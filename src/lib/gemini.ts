import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

const getAi = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey });
};

export async function generateVideoPrompt(topic: string, details: string) {
  console.log("Generating prompt for:", { topic, details });
  
  const ai = getAi();

  const systemPrompt = `Ты профессиональный режиссер. Превращай ввод пользователя в детальный английский промпт для модели Veo 3.1.
- Если тема связана с эмоциями (ссора, развод), обязательно добавляй: "cinematic, photorealistic, emotional facial expressions, moody lighting, 4k, realistic skin textures". 
- Если тема про бизнес или успех: "dynamic, high-end, clean look, soft sunlight, professional atmosphere".
- Ответ должен содержать ТОЛЬКО английский текст для копирования.`;

  const userPrompt = `Тема видео: ${topic}\nДетали: ${details}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
        ],
      },
    });

    const result = response.text;
    console.log("Gemini Response:", result);
    
    if (!result) {
      throw new Error("Empty response from Gemini");
    }

    return result.trim();
  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error?.message?.includes("API_KEY_MISSING")) {
      throw new Error("API_KEY_MISSING");
    }
    throw error;
  }
}
