import { GoogleGenAI } from "@google/genai";

export async function generateVideoPrompt(topic: string, details: string) {
  // Use the standard environment variable name for Gemini in AI Studio
  // Note: For public sharing, it's CRITICAL to have the key in the Secrets tab
  const apiKey = process.env.GEMINI_API_KEY || (process.env as any).MOROZOV;
  
  if (!apiKey || apiKey === "al studio free tier" || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    console.error("API Key check fail on frontend. Value:", apiKey);
    throw new Error("API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const systemPrompt = `Ты профессиональный режиссер. Превращай ввод пользователя в детальный английский промпт для модели Veo 3.1.
- Если тема связана с эмоциями (ссора, развод), обязательно добавляй: "cinematic, photorealistic, emotional facial expressions, moody lighting, 4k, realistic skin textures". 
- Если тема про бизнес или успех: "dynamic, high-end, clean look, soft sunlight, professional atmosphere".
- Ответ должен содержать ТОЛЬКО английский текст для копирования.`;

  const userPrompt = `Тема видео: ${topic}\nДетали: ${details}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    const result = response.text;
    if (!result) {
      throw new Error("EMPTY_RESPONSE");
    }

    return result.trim();
  } catch (error: any) {
    console.error("Gemini Frontend Error:", error);
    throw error;
  }
}
