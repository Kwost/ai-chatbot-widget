(function () {
  const clientId = document.currentScript.getAttribute("data-client-id");
  
  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:3000" 
    : "https://ai-chatbot-widget-kzh9.onrender.com";
  
  const sessionId = "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);

  // Détection mobile
  const isMobile = window.innerWidth <= 768;

  // Bouton flottant
  const button = document.createElement("div");
  button.innerHTML = "💬";
  button.style.cssText = `
    position: fixed;
    bottom: ${isMobile ? '16px' : '24px'};
    right: ${isMobile ? '16px' : '24px'};
    width: ${isMobile ? '56px' : '64px'};
    height: ${isMobile ? '56px' : '64px'};
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 9999;
    font-size: ${isMobile ? '28px' : '32px'};
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
    transition: all 0.3s ease;
  `;

  button.onmouseenter = () => {
    button.style.transform = "scale(1.1)";
    button.style.boxShadow = "0 12px 32px rgba(102, 126, 234, 0.6)";
  };
  button.onmouseleave = () => {
    button.style.transform = "scale(1)";
    button.style.boxShadow = "0 8px 24px rgba(102, 126, 234, 0.4)";
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
    width: 380px;
    height: 550px;
    background: white;
    border-radius: 20px;
    display: none;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    z-index: 9999;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    overflow: hidden;
  `;

  box.innerHTML = `
    <div style="
      padding: ${isMobile ? '16px' : '20px'};
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      ${isMobile ? 'padding-top: max(16px, env(safe-area-inset-top));' : ''}
    ">
      <div>
        <div style="font-size: ${isMobile ? '18px' : '20px'}; font-weight: 600;">💎 Assistant</div>
        <div style="font-size: ${isMobile ? '12px' : '13px'}; opacity: 0.9; margin-top: 4px;">En ligne</div>
      </div>
      <span id="close" style="
        cursor: pointer;
        font-size: ${isMobile ? '32px' : '28px'};
        opacity: 0.9;
        transition: opacity 0.2s;
        line-height: 1;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">×</span>
    </div>
    <div id="chat" style="
      flex: 1;
      overflow-y: auto;
      padding: ${isMobile ? '16px' : '20px'};
      background: #f8f9fa;
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
      <input id="msg" placeholder="Écrivez votre message..." 
        style="
          width: 100%;
          border: 2px solid #e5e7eb;
          border-radius: 24px;
          padding: ${isMobile ? '14px 18px' : '12px 20px'};
          outline: none;
          font-size: ${isMobile ? '16px' : '15px'};
          transition: border-color 0.2s;
        " />
    </div>
  `;

  document.body.appendChild(box);

  const chat = box.querySelector("#chat");
  const input = box.querySelector("#msg");
  const close = box.querySelector("#close");

  input.onfocus = () => input.style.borderColor = "#667eea";
  input.onblur = () => input.style.borderColor = "#e5e7eb";

  close.onmouseenter = () => close.style.opacity = "1";
  close.onmouseleave = () => close.style.opacity = "0.9";

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
      border-radius: 18px;
      word-wrap: break-word;
      line-height: 1.5;
      font-size: ${isMobile ? '15px' : '15px'};
      animation: fadeIn 0.3s ease;
      ${isBot ? `
        background: white;
        color: #1f2937;
        align-self: flex-start;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      ` : `
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        align-self: flex-end;
        margin-left: auto;
      `}
    `;
    
    if (isBot) {
      const label = document.createElement("div");
      label.style.cssText = "font-size: 11px; color: #9ca3af; margin-bottom: 6px; font-weight: 500;";
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

    const typing = document.createElement("div");
    typing.style.cssText = `
      padding: 10px 14px;
      background: white;
      border-radius: 18px;
      max-width: 75%;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    `;
    typing.innerHTML = `
      <div style="font-size: 11px; color: #9ca3af; margin-bottom: 6px; font-weight: 500;">Assistant</div>
      <div style="color: #9ca3af; font-style: italic;">En train d'écrire...</div>
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
    }
  }

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && input.value.trim()) {
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
  `;
  document.head.appendChild(style);
})();