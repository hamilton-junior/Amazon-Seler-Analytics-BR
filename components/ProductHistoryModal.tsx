import React from 'react';
import { formatCurrency, getMockPriceHistory } from '../constants';
import { X, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProductHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: { id: string, name: string, currentPrice: number } | null;
  isDarkMode: boolean;
}

const ProductHistoryModal: React.FC<ProductHistoryModalProps> = ({ isOpen, onClose, product, isDarkMode }) => {
  if (!isOpen || !product) return null;

  const historyData = getMockPriceHistory(product.currentPrice);
  const axisColor = isDarkMode ? '#94a3b8' : '#64748b';
  const gridColor = isDarkMode ? '#334155' : '#e2e8f0';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl border border-slate-200 dark:border-slate-700 relative z-10 animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <div>
             <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
               <TrendingUp className="text-indigo-600 dark:text-indigo-400" />
               Histórico de Preço
             </h3>
             <p className="text-sm text-slate-500 dark:text-slate-400">{product.name} ({product.id})</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 h-[300px] w-full bg-slate-50 dark:bg-slate-900/50">
           <ResponsiveContainer width="100%" height="100%">
             <LineChart data={historyData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="date" tick={{ fill: axisColor }} stroke={axisColor} fontSize={12} />
                <YAxis tick={{ fill: axisColor }} stroke={axisColor} fontSize={12} tickFormatter={(val) => `R$${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#fff', borderColor: isDarkMode ? '#334155' : '#e2e8f0', color: isDarkMode ? '#fff' : '#000' }}
                  formatter={(val: number) => [formatCurrency(val), 'Preço']}
                />
                <Line type="monotone" dataKey="price" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5' }} />
             </LineChart>
           </ResponsiveContainer>
        </div>
        
        <div className="px-6 py-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 text-center">
          * Dados históricos simulados para fins de demonstração.
        </div>
      </div>
    </div>
  );
};

export default ProductHistoryModal;