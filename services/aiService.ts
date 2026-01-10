import { GoogleGenAI } from "@google/genai";
import { Visitor } from "../types";


const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY // ❗ shu qism
});


export const getVisitorInsights = async (visitors: Visitor[]) => {
  const visitorSummary = visitors.map(v => 
    `${v.firstName} ${v.lastName} (${v.userType}) - Section: ${v.section}, Faculty: ${v.faculty || 'N/A'}`
  ).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Quyidagi ARM tashrif buyuruvchilarini tahlil qil va qisqacha hisobot ber:
${visitorSummary}`,
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });

    return response.text;
  } catch (error) {
    console.error("AI Insight Error:", error);
    return "AI tahlilini amalga oshirib bo'lmadi.";
  }
};
