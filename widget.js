(function () {
  const clientId = document.currentScript.getAttribute("data-client-id");
  
  // 🔥 Détecte automatiquement l'environnement
  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:3000" 
    : "https://ai-chatbot-widget-kzh9.onrender.com"; 
  
  // 🔥 Génère un sessionId unique pour cette conversation
  const sessionId = "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);

  // 📌 Bouton flottant
  const button = document.createElement("div");
  button.innerText = "💬";
  button.style.position = "fixed";
  button.style.bottom = "20px";
  button.style.right = "20px";
  button.style.width = "50px";
  button.style.height = "50px";
  button.style.borderRadius = "50%";
  button.style.background = "#111";
  button.style.color = "#fff";
  button.style.display = "flex";
  button.style.alignItems = "center";
  button.style.justifyContent = "center";
  button.style.cursor = "pointer";
  button.style.zIndex = "9999";
  button.style.fontSize = "22px";
  button.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
  button.style.transition = "transform 0.2s";

  button.onmouseenter = () => button.style.transform = "scale(1.1)";
  button.onmouseleave = () => button.style.transform = "scale(1)";

  document.body.appendChild(button);

  // 📌 Fenêtre chat
  const box = document.createElement("div");
  box.style.position = "fixed";
  box.style.bottom = "80px";
  box.style.right = "20px";
  box.style.width = "320px";
  box.style.height = "450px";
  box.style.background = "#fff";
  box.style.border = "1px solid #ddd";
  box.style.borderRadius = "12px";
  box.style.display = "none";
  box.style.flexDirection = "column";
  box.style.fontFamily = "Arial, sans-serif";
  box.style.zIndex = "9999";
  box.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";

  box.innerHTML = `
    <div style="padding:14px;font-weight:bold;border-bottom:1px solid #eee;background:#f8f9fa;border-radius:12px 12px 0 0;display:flex;justify-content:space-between;align-items:center;">
      <span style="font-size:16px;">💎 Assistant</span>
      <span id="close" style="cursor:pointer;font-size:20px;color:#666;">✕</span>
    </div>
    <div id="chat" style="flex:1;overflow:auto;padding:12px;background:#fafafa;"></div>
    <div style="padding:10px;border-top:1px solid #eee;background:#fff;border-radius:0 0 12px 12px;">
      <input id="msg" placeholder="Écrivez votre message…" 
        style="width:100%;border:1px solid #ddd;border-radius:20px;padding:10px 15px;outline:none;font-size:14px;" />
    </div>
  `;

  document.body.appendChild(box);

  const chat = box.querySelector("#chat");
  const input = box.querySelector("#msg");
  const close = box.querySelector("#close");

  // 📌 Ouvrir / fermer
  button.onclick = () => {
    box.style.display = "flex";
    button.style.display = "none";
    input.focus();
  };

  close.onclick = () => {
    box.style.display = "none";
    button.style.display = "flex";
  };

  // 📌 Fonction d'affichage de message
  function addMessage(sender, text, isBot = false) {
    const msg = document.createElement("div");
    msg.style.marginBottom = "10px";
    msg.style.padding = "8px 12px";
    msg.style.borderRadius = "12px";
    msg.style.maxWidth = "80%";
    msg.style.wordWrap = "break-word";
    
    if (isBot) {
      msg.style.background = "#e3f2fd";
      msg.style.alignSelf = "flex-start";
      msg.innerHTML = `<b>Assistant :</b><br>${text}`;
    } else {
      msg.style.background = "#111";
      msg.style.color = "#fff";
      msg.style.alignSelf = "flex-end";
      msg.style.marginLeft = "auto";
      msg.innerHTML = `<b>Vous :</b><br>${text}`;
    }
    
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
  }

  // 📌 Envoi message
  input.addEventListener("keypress", async (e) => {
    if (e.key === "Enter" && input.value.trim()) {
      const text = input.value.trim();
      addMessage("user", text, false);
      input.value = "";

      const typing = document.createElement("div");
      typing.id = "typing";
      typing.style.fontStyle = "italic";
      typing.style.color = "#999";
      typing.style.marginTop = "8px";
      typing.innerText = "Assistant en train d'écrire...";
      chat.appendChild(typing);
      chat.scrollTop = chat.scrollHeight;

      try {
        const res = await fetch(`${API_URL}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            message: text, 
            clientId,
            sessionId 
          })
        });

        const data = await res.json();
        
        typing.remove();
        
        if (data.error) {
          addMessage("bot", "⚠ Erreur : " + data.error, true);
        } else {
          addMessage("bot", data.reply, true);
        }
      } catch (err) {
        typing.remove();
        addMessage("bot", "⚠ Erreur de connexion", true);
      }
    }
  });

  // Message de bienvenue
  setTimeout(() => {
    if (chat.children.length === 0) {
      addMessage("bot", "👋 Bonjour ! Comment puis-je vous aider ?", true);
    }
  }, 500);
})();