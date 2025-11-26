import React, { useMemo } from 'react';
import { SaleData } from '../types';
import { formatCurrency } from '../constants';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface ChartsProps {
  data: SaleData[];
  isDarkMode?: boolean;
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const Charts: React.FC<ChartsProps> = ({ data, isDarkMode = false }) => {
  
  // 1. Process Data for Line Chart (Lucro x Tempo)
  const profitOverTimeData = useMemo(() => {
    const grouped = data.reduce((acc, curr) => {
      const date = new Date(curr.dataVenda).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      acc[date] = (acc[date] || 0) + curr.lucro;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([date, lucro]) => ({ date, lucro }))
      .sort((a, b) => {
        // Simple sort assumes current year for simplicity in this view
        const [dayA, monthA] = a.date.split('/').map(Number);
        const [dayB, monthB] = b.date.split('/').map(Number);
        return new Date(2023, monthA - 1, dayA).getTime() - new Date(2023, monthB - 1, dayB).getTime();
      });
  }, [data]);

  // 2. Process Data for Bar Chart (Vendas Totais x Produto)
  const salesByProductData = useMemo(() => {
    const grouped = data.reduce((acc, curr) => {
      // Use shorter name for display
      const productName = curr.produto.length > 20 ? curr.produto.substring(0, 20) + '...' : curr.produto;
      acc[productName] = (acc[productName] || 0) + curr.valorVendaMaisFrete;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Descending order
  }, [data]);

  // 3. Process Data for Pie Chart (Vendas Totais x Cidade)
  const salesByCityData = useMemo(() => {
    const grouped = data.reduce((acc, curr) => {
      // Extract City name only if it has state (e.g., "São Paulo, SP" -> "São Paulo")
      const city = curr.cidade.split(',')[0]; 
      acc[city] = (acc[city] || 0) + curr.valorVendaMaisFrete;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 shadow-lg rounded-lg">
          <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
          <p className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Recharts styling based on theme
  const axisColor = isDarkMode ? '#94a3b8' : '#64748b';
  const gridColor = isDarkMode ? '#334155' : '#e2e8f0';

  return (
    <div className="space-y-6 mb-6">
      {/* Row 1: Line Chart (Profit Over Time) */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 transition-colors duration-300">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Evolução do Lucro (Tempo)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={profitOverTimeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis dataKey="date" tick={{ fill: axisColor }} fontSize={12} stroke={axisColor} />
              <YAxis tick={{ fill: axisColor }} fontSize={12} stroke={axisColor} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: axisColor }} />
              <Line 
                type="monotone" 
                dataKey="lucro" 
                name="Lucro Diário" 
                stroke="#4f46e5" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#4f46e5' }} 
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Grid for Bar and Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Bar Chart: Sales by Product */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 transition-colors duration-300">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Vendas Totais por Produto</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByProductData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={gridColor} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={120} tick={{ fill: axisColor, fontSize: 11 }} stroke={axisColor} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Vendas Totais" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                   {salesByProductData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Sales by City */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 transition-colors duration-300">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Vendas por Cidade</h3>
          <div className="h-[350px] w-full flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={salesByCityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                  stroke={isDarkMode ? '#1e293b' : '#fff'}
                >
                  {salesByCityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ color: axisColor }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Charts;