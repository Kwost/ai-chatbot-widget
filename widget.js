(function () {
  const clientId = document.currentScript.getAttribute("data-client-id");
  
  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:3000" 
    : "https://ai-chatbot-widget-kzh9.onrender.com";
  
  const sessionId = "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);

  // Détection mobile
  const isMobile = window.innerWidth <= 768;

  // Bouton flottant - Design neutre moderne
  const button = document.createElement("div");
  button.innerHTML = "💬";
  button.style.cssText = `
    position: fixed;
    bottom: ${isMobile ? '16px' : '24px'};
    right: ${isMobile ? '16px' : '24px'};
    width: ${isMobile ? '56px' : '64px'};
    height: ${isMobile ? '56px' : '64px'};
    border-radius: 50%;
    background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 9999;
    font-size: ${isMobile ? '28px' : '32px'};
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
  `;

  button.onmouseenter = () => {
    button.style.transform = "scale(1.1)";
    button.style.boxShadow = "0 12px 32px rgba(0, 0, 0, 0.25)";
  };
  button.onmouseleave = () => {
    button.style.transform = "scale(1)";
    button.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.15)";
  };

  document.body.appendChild(button);

  // Fenêtre chat responsive
  const box = document.createElement("div");
  box.style.cssText = isMobile ? `
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: white;
    display: none;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    z-index: 9999;
  ` : `
    position: fixed;
    bottom: 100px;
    right: 24px;
    width: 400px;
    height: 600px;
    background: white;
    border-radius: 16px;
    display: none;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    z-index: 9999;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    border: 1px solid #e5e7eb;
  `;

  box.innerHTML = `
    <div style="
      padding: ${isMobile ? '16px' : '20px'};
      background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      ${isMobile ? 'padding-top: max(16px, env(safe-area-inset-top));' : ''}
    ">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        ">💬</div>
        <div>
          <div style="font-size: ${isMobile ? '18px' : '18px'}; font-weight: 600;">Assistant</div>
          <div style="font-size: ${isMobile ? '12px' : '13px'}; opacity: 0.85; margin-top: 2px;">
            <span style="
              display: inline-block;
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: #10b981;
              margin-right: 6px;
              animation: pulse 2s ease-in-out infinite;
            "></span>En ligne
          </div>
        </div>
      </div>
      <span id="close" style="
        cursor: pointer;
        font-size: ${isMobile ? '32px' : '28px'};
        opacity: 0.85;
        transition: opacity 0.2s;
        line-height: 1;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        transition: all 0.2s;
      ">×</span>
    </div>
    <div id="chat" style="
      flex: 1;
      overflow-y: auto;
      padding: ${isMobile ? '16px' : '20px'};
      background: #f9fafb;
      display: flex;
      flex-direction: column;
      gap: 12px;
      ${isMobile ? 'padding-bottom: max(16px, env(safe-area-inset-bottom));' : ''}
    "></div>
    <div style="
      padding: ${isMobile ? '12px' : '16px'};
      background: white;
      border-top: 1px solid #e5e7eb;
      ${isMobile ? 'padding-bottom: max(12px, calc(env(safe-area-inset-bottom) + 12px));' : ''}
    ">
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        gap: 8px;
      ">
        <input id="msg" placeholder="Écrivez votre message..." 
          style="
            flex: 1;
            border: 2px solid #e5e7eb;
            border-radius: 24px;
            padding: ${isMobile ? '12px 18px' : '12px 20px'};
            outline: none;
            font-size: ${isMobile ? '16px' : '15px'};
            transition: border-color 0.2s;
            background: #f9fafb;
          " />
        <button id="send" style="
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        ">➤</button>
      </div>
    </div>
  `;

  document.body.appendChild(box);

  const chat = box.querySelector("#chat");
  const input = box.querySelector("#msg");
  const close = box.querySelector("#close");
  const sendBtn = box.querySelector("#send");

  input.onfocus = () => {
    input.style.borderColor = "#374151";
    input.style.background = "white";
  };
  input.onblur = () => {
    input.style.borderColor = "#e5e7eb";
    input.style.background = "#f9fafb";
  };

  close.onmouseenter = () => {
    close.style.opacity = "1";
    close.style.background = "rgba(255, 255, 255, 0.1)";
  };
  close.onmouseleave = () => {
    close.style.opacity = "0.85";
    close.style.background = "transparent";
  };

  sendBtn.onmouseenter = () => {
    sendBtn.style.transform = "scale(1.05)";
    sendBtn.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
  };
  sendBtn.onmouseleave = () => {
    sendBtn.style.transform = "scale(1)";
    sendBtn.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
  };

  button.onclick = () => {
    box.style.display = "flex";
    button.style.display = "none";
    if (isMobile) {
      document.body.style.overflow = "hidden";
    }
    setTimeout(() => input.focus(), 300);
  };

  close.onclick = () => {
    box.style.display = "none";
    button.style.display = "flex";
    if (isMobile) {
      document.body.style.overflow = "";
    }
  };

  function addMessage(text, isBot = false) {
    const msg = document.createElement("div");
    msg.style.cssText = `
      max-width: ${isMobile ? '85%' : '75%'};
      padding: ${isMobile ? '10px 14px' : '12px 16px'};
      border-radius: ${isBot ? '18px 18px 18px 4px' : '18px 18px 4px 18px'};
      word-wrap: break-word;
      line-height: 1.5;
      font-size: ${isMobile ? '15px' : '15px'};
      animation: fadeIn 0.3s ease;
      ${isBot ? `
        background: white;
        color: #1f2937;
        align-self: flex-start;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        border: 1px solid #f3f4f6;
      ` : `
        background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
        color: white;
        align-self: flex-end;
        margin-left: auto;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      `}
    `;
    
    if (isBot) {
      const label = document.createElement("div");
      label.style.cssText = "font-size: 11px; color: #9ca3af; margin-bottom: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;";
      label.textContent = "Assistant";
      msg.appendChild(label);
      
      const content = document.createElement("div");
      content.textContent = text;
      msg.appendChild(content);
    } else {
      msg.textContent = text;
    }
    
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
  }

  async function sendMessage(text) {
    addMessage(text, false);
    input.value = "";
    sendBtn.disabled = true;
    sendBtn.style.opacity = "0.5";

    const typing = document.createElement("div");
    typing.style.cssText = `
      padding: 12px 16px;
      background: white;
      border-radius: 18px 18px 18px 4px;
      max-width: 75%;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      border: 1px solid #f3f4f6;
    `;
    typing.innerHTML = `
      <div style="font-size: 11px; color: #9ca3af; margin-bottom: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Assistant</div>
      <div style="display: flex; gap: 4px; align-items: center;">
        <div style="width: 8px; height: 8px; border-radius: 50%; background: #9ca3af; animation: bounce 1.4s infinite ease-in-out both; animation-delay: -0.32s;"></div>
        <div style="width: 8px; height: 8px; border-radius: 50%; background: #9ca3af; animation: bounce 1.4s infinite ease-in-out both; animation-delay: -0.16s;"></div>
        <div style="width: 8px; height: 8px; border-radius: 50%; background: #9ca3af; animation: bounce 1.4s infinite ease-in-out both;"></div>
      </div>
    `;
    chat.appendChild(typing);
    chat.scrollTop = chat.scrollHeight;

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, clientId, sessionId })
      });

      const data = await res.json();
      typing.remove();
      
      if (data.error) {
        addMessage("⚠️ " + data.error, true);
      } else {
        addMessage(data.reply, true);
      }
    } catch (err) {
      typing.remove();
      addMessage("⚠️ Erreur de connexion", true);
    } finally {
      sendBtn.disabled = false;
      sendBtn.style.opacity = "1";
    }
  }

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && input.value.trim()) {
      sendMessage(input.value.trim());
    }
  });

  sendBtn.addEventListener("click", () => {
    if (input.value.trim()) {
      sendMessage(input.value.trim());
    }
  });

  // Message de bienvenue
  setTimeout(() => {
    addMessage("👋 Bonjour ! Comment puis-je vous aider aujourd'hui ?", true);
  }, 500);

  // Style pour l'animation
  const style = document.createElement("style");
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    @keyframes bounce {
      0%, 80%, 100% { 
        transform: scale(0);
        opacity: 0.5;
      } 
      40% { 
        transform: scale(1);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
})()