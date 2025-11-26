import React from 'react';
import { SaleData } from '../types';
import { formatCurrency } from '../constants';
import { DollarSign, Package, TrendingUp, Truck } from 'lucide-react';

interface KPICardsProps {
  data: SaleData[];
}

const KPICards: React.FC<KPICardsProps> = ({ data }) => {
  const totalRevenue = data.reduce((acc, curr) => acc + curr.valorVendaMaisFrete, 0);
  const totalProfit = data.reduce((acc, curr) => acc + curr.lucro, 0);
  const totalOrders = data.length;
  const avgProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 transition-colors duration-300">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Receita Total</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{formatCurrency(totalRevenue)}</h3>
          </div>
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
            <DollarSign size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 transition-colors duration-300">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Lucro Líquido</p>
            <h3 className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(totalProfit)}
            </h3>
          </div>
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
            <TrendingUp size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 transition-colors duration-300">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Pedidos</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{totalOrders}</h3>
          </div>
          <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-600 dark:text-orange-400">
            <Package size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 transition-colors duration-300">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Margem Média</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{avgProfitMargin.toFixed(1)}%</h3>
          </div>
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400">
            <Truck size={24} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default KPICards;