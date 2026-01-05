import express from "express"
import axios from "axios"
import cors from "cors"
import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// 🔥 Connexion Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

// 📌 Route chat avec DB
app.post("/chat", async (req, res) => {
  const { message, clientId, sessionId } = req.body

  console.log("🔍 clientId reçu:", clientId)
  console.log("🔍 message reçu:", message)

  if (!message || !clientId) {
    return res.status(400).json({ error: "message ou clientId manquant" })
  }

  try {
    // 1️⃣ Récupérer les infos de la boutique depuis Supabase
    const { data: shop, error: shopError } = await supabase
      .from("shops")
      .select("*")
      .eq("shop_id", clientId)
      .eq("is_active", true)
      .single()

    console.log("🔍 Boutique trouvée:", shop)
    console.log("🔍 Erreur Supabase:", shopError)

    if (shopError || !shop) {
      return res.status(404).json({ error: "Boutique non trouvée ou inactive" })
    }

    // 2️⃣ Récupérer l'historique de conversation (si sessionId existe)
    let conversationHistory = []
    
    if (sessionId) {
      const { data: history } = await supabase
        .from("conversations")
        .select("user_message, bot_reply")
        .eq("shop_id", clientId)
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true })
        .limit(10) // Garde les 10 derniers messages

      if (history) {
        conversationHistory = history.flatMap(h => [
          { role: "user", content: h.user_message },
          { role: "assistant", content: h.bot_reply }
        ])
      }
    }

    // 3️⃣ Appel API OpenAI avec historique
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: shop.system_prompt },
          ...conversationHistory,
          { role: "user", content: message }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    )

    const botReply = response.data.choices[0].message.content

    // 4️⃣ Sauvegarder la conversation dans Supabase
    await supabase.from("conversations").insert({
      shop_id: clientId,
      user_message: message,
      bot_reply: botReply,
      session_id: sessionId || null
    })

    // 5️⃣ Retourner la réponse
    res.json({ reply: botReply })

  } catch (error) {
    console.error("Erreur:", error.response?.data || error.message)
    res.status(500).json({ error: "Erreur IA" })
  }
})

app.use(express.static("."))

app.listen(3000, () => {
  console.log("✅ Backend IA + Supabase lancé sur http://localhost:3000")
})