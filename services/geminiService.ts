
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

// NEW: Optimize News/Articles for SEO and Readability
export async function optimizeNewsArticle(title: string, rawContent: string, category: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    You are an editor-in-chief for Trazot Global Intelligence. 
    Topic Category: ${category}
    Draft Title: ${title}
    Draft Content: ${rawContent}

    Task:
    1. Optimize the headline for maximum CTR and SEO keywords related to GCC/South Asia trade.
    2. Enhance the body text for "Elite Editorial" tone (professional, data-driven, insightful).
    3. Generate a compelling Meta Description (max 160 chars).
    4. Create an SEO-friendly slug (e.g., "dubai-real-estate-trends-2025").
    5. Suggest 5 relevant SEO tags.
    
    Return ONLY JSON.
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
            optimizedTitle: { type: Type.STRING },
            optimizedContent: { type: Type.STRING },
            metaDescription: { type: Type.STRING },
            slug: { type: Type.STRING },
            tags: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['optimizedTitle', 'optimizedContent', 'metaDescription', 'slug', 'tags'],
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("News AI Optimization failed", error);
    return null;
  }
}
