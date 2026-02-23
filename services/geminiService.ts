
import { GoogleGenAI } from "@google/genai";

// Always use process.env.API_KEY directly in the initialization
export const getGeminiResponse = async (userMessage: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userMessage,
      config: {
        systemInstruction: `Você é o Especialista de Vendas de ALTA PERFORMANCE da APSILVA CERTIFICADORA.
        Seu objetivo único é FECHAR VENDAS e informar sobre a facilidade do pagamento online.
        
        DIRETRIZES DE ATENDIMENTO:
        1. PERSUASÃO: Use gatilhos de urgência e facilidade.
        2. PAGAMENTO: Informe que aceitamos PIX (aprovação instantânea), Cartão (até 12x) e Boleto. 
        3. CONFIRMAÇÃO: Diga que o sistema confirma o pagamento automaticamente e já emite a Nota Fiscal na hora.
        4. FOCO EM SOLUÇÃO: Emissão rápida (15 min), 100% online, sem burocracia após o pagamento.
        5. PLANOS: e-CPF A1 (R$ 190), e-CNPJ A1 (R$ 219).
        6. UPSELL: Mencione que ao fechar agora, ele garante 30% de desconto na renovação futura.
        7. CTA: Sempre direcione para selecionar o plano e prosseguir para o pagamento seguro.
        
        Seja extremamente ágil, use emojis e mostre profissionalismo total.`,
        temperature: 0.8,
      },
    });
    
    // Use the .text property as per guidelines
    return response.text || "Estamos prontos para emitir seu certificado agora! O pagamento é rápido e a confirmação é automática.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Estamos com alta demanda! Mas o pagamento continua automático. Me chama no WhatsApp: (69) 99387-9543";
  }
};
