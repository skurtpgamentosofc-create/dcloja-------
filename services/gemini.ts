
import { GoogleGenAI } from "@google/genai";
import { Product } from "../types";

export const sendMessageToGemini = async (userMessage: string, currentProducts: Product[]): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Gera a lista de produtos dinâmica para o contexto da IA
    const productList = currentProducts.length > 0 
      ? currentProducts.map(p => `- ${p.name}: R$${p.price.toFixed(2)} (${p.description})`).join('\n')
      : "Nenhum produto disponível no momento.";
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userMessage,
      config: {
        systemInstruction: `Você é o assistente virtual da NEXUS STORE.
        Persona: Gamer, direto, técnico e prestativo.
        Objetivo: Ajudar com dúvidas sobre estes produtos que temos em estoque agora:
        ${productList}
        Regras: Responda em no máximo 3 frases. Seja honesto sobre preços e entrega automática. Se o produto não estiver na lista acima, diga que não temos no momento.`,
        temperature: 0.7,
      }
    });

    return response.text || "Desculpe, não consegui processar sua resposta agora.";
  } catch (error) {
    console.error("Erro ao chamar Gemini:", error);
    return "Ocorreu um erro ao conectar com o servidor de IA.";
  }
};
