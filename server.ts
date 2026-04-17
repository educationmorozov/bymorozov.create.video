import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Gemini Proxy
  app.post("/api/generate-prompt", async (req, res) => {
    const { topic, details } = req.body;
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "API_KEY_MISSING" });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const systemPrompt = `Ты профессиональный режиссер. Превращай ввод пользователя в детальный английский промпт для модели Veo 3.1.
- Если тема связана с эмоциями (ссора, развод), обязательно добавляй: "cinematic, photorealistic, emotional facial expressions, moody lighting, 4k, realistic skin textures". 
- Если тема про бизнес или успех: "dynamic, high-end, clean look, soft sunlight, professional atmosphere".
- Ответ должен содержать ТОЛЬКО английский текст для копирования.`;

      const userPrompt = `Тема видео: ${topic}\nДетали: ${details}`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
          safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          ],
        },
      });

      const result = response.text;
      if (!result) {
        return res.status(500).json({ error: "Empty response from Gemini" });
      }

      res.json({ prompt: result.trim() });
    } catch (error: any) {
      console.error("Server Gemini Error:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
