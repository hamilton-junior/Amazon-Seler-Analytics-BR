import React, { useState } from 'react';
import { SaleData } from '../types';
import { analyzeSalesData } from '../services/geminiService';
import { Sparkles, Loader2 } from 'lucide-react';

interface AIInsightsProps {
  data: SaleData[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ data }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await analyzeSalesData(data);
      setAnalysis(result);
    } catch (e) {
      setAnalysis("Erro ao gerar análise. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-lg p-6 border border-indigo-100 dark:border-indigo-800 mb-6 transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Sparkles className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-indigo-900 dark:text-indigo-100 text-lg">Inteligência Gemini</h3>
            <p className="text-sm text-indigo-700 dark:text-indigo-300">Insights automáticos sobre suas vendas</p>
          </div>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 shadow-sm"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
          {loading ? 'Analisando...' : 'Gerar Relatório'}
        </button>
      </div>

      {analysis && (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-indigo-100 dark:border-slate-700 shadow-sm animate-in fade-in slide-in-from-bottom-2">
          <div className="prose prose-indigo prose-sm max-w-none dark:prose-invert">
             <div className="whitespace-pre-line text-slate-700 dark:text-slate-200">{analysis}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsights;