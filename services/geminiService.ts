
import { GoogleGenAI, Type } from "@google/genai";

// Optimize listing content using Gemini API
export async function optimizeListingContent(title: string, rawDescription: string, category: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    You are an expert sales copywriter for a premium classifieds marketplace named Trazot.
    The user is posting an ad in the ${category} category.
    Original Title: ${title}
    Original Description: ${rawDescription}
    
    Task: Rewrite the title and description to be more professional, persuasive, and SEO-friendly.
    Keep the tone luxury-focused and trustworthy. Ensure all technical details from the original are preserved.
    Output only the JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            optimizedTitle: {
              type: Type.STRING,
              description: 'The optimized, catchy, and professional title for the ad.',
            },
            optimizedDescription: {
              type: Type.STRING,
              description: 'The rewritten, persuasive, and SEO-friendly description for the ad.',
            },
          },
          required: ['optimizedTitle', 'optimizedDescription'],
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Optimization failed", error);
    return null;
  }
}
