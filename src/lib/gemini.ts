import { GoogleGenAI } from "@google/genai";

export async function generateVideoPrompt(topic: string, details: string) {
  // Key is baked into process.env.GEMINI_API_KEY by vite.config.ts at build time
  const apiKey = (process.env as any).GEMINI_API_KEY;
  
  if (!apiKey || apiKey === "al studio free tier" || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    console.error("Critical: API Key is missing in the build!");
    throw new Error("API_KEY_MISSING_IN_BUILD");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const systemPrompt = `You are a professional video director. Transform user input into a detailed English prompt for Veo 3.1 video generation model.
- If the topic is emotional (argument, divorce): include "cinematic, photorealistic, emotional facial expressions, moody lighting, 4k, realistic skin textures". 
- If the topic is business/success: "dynamic, high-end, clean look, soft sunlight, professional atmosphere".
- Output ONLY the prompt text.`;

  const userPrompt = `Topic: ${topic}\nDetails: ${details}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) throw new Error("EMPTY_RESPONSE");
    return text.trim();
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw error;
  }
}
