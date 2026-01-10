import { GoogleGenAI } from "@google/genai";
import { Visitor } from "../types";

// ❌ process.env.API_KEY emas
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_API_KEY });

export const getVisitorInsights = async (visitors: Visitor[]) => {
  const visitorSummary = visitors.map(v => 
    `${v.firstName} ${v.lastName} (${v.userType}) - Section: ${v.section}, Faculty: ${v.faculty || 'N/A'}`
  ).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Quyidagi ARM (Axborot-resurs markazi) tashrif buyuruvchilari ma'lumotlarini tahlil qil va qisqacha o'zbek tilida hisobot ber:
      ${visitorSummary}
      
      Hisobotda:
      1. Eng ko'p tashrif buyurilgan bo'lim.
      2. Qaysi fakultet eng faol.
      3. Tashrif buyuruvchilar tarkibi (ichki/tashqi) haqida xulosa.`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text;
  } catch (error) {
    console.error("AI Insight Error:", error);
    return "AI tahlilini amalga oshirib bo'lmadi.";
  }
};
