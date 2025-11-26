import { GoogleGenAI } from "@google/genai";
import { SaleData } from '../types';

export const analyzeSalesData = async (salesData: SaleData[]): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key is missing. Please configure your API_KEY.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Serialize data for the model
  const dataSummary = JSON.stringify(salesData.map(s => ({
    produto: s.produto,
    cidade: s.cidade,
    status: s.envioStatus,
    valorVenda: s.valorVenda,
    lucro: s.lucro,
    margem: ((s.lucro / s.valorVenda) * 100).toFixed(2) + '%'
  })), null, 2);

  const prompt = `
    Você é um especialista em análise de vendas de E-commerce, especificamente Amazon FBA.
    Analise os seguintes dados de vendas (em formato JSON) e forneça um relatório executivo curto em Markdown.
    
    Dados das vendas:
    ${dataSummary}

    Foque nos seguintes pontos:
    1. Resumo da lucratividade (quais produtos dão mais lucro, quais dão prejuízo).
    2. Eficiência logística baseada nas cidades e status.
    3. Sugestões acionáveis para aumentar o lucro ou reduzir custos.
    4. Use formatação rica (negrito, listas) para facilitar a leitura.
    
    Responda em Português do Brasil.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Não foi possível gerar a análise.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Ocorreu um erro ao conectar com a inteligência artificial. Verifique sua chave de API.";
  }
};