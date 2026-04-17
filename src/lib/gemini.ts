import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

export async function generateVideoPrompt(topic: string, details: string) {
  // Try to find the key in baked-in environments
  const apiKey = process.env.MOROZOV || process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === "al studio free tier" || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    console.error("API Key Check Failed. Value:", apiKey);
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
    console.error("Gemini Error:", error);
    throw error;
  }
}
