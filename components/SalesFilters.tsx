import React from 'react';
import { FilterState, ShippingStatus } from '../types';
import { Search, MapPin, Package, Calendar, Filter, X, Eye, EyeOff, CalendarDays } from 'lucide-react';

interface SalesFiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  showHidden?: boolean;
  setShowHidden?: React.Dispatch<React.SetStateAction<boolean>>;
}

const SalesFilters: React.FC<SalesFiltersProps> = ({ filters, setFilters, showHidden, setShowHidden }) => {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      searchName: '',
      searchCity: '',
      searchProductId: '',
      status: '',
      dateStart: '',
      dateEnd: ''
    });
  };

  const clearDates = () => {
    setFilters(prev => ({
      ...prev,
      dateStart: '',
      dateEnd: ''
    }));
  };

  const setDateRange = (range: 'today' | '7days' | '30days' | 'thisMonth') => {
    const end = new Date();
    const start = new Date();
    
    switch (range) {
      case 'today':
        // Start and End are today
        break;
      case '7days':
        start.setDate(end.getDate() - 6);
        break;
      case '30days':
        start.setDate(end.getDate() - 29);
        break;
      case 'thisMonth':
        start.setDate(1);
        break;
    }

    setFilters(prev => ({
      ...prev,
      dateStart: start.toISOString().split('T')[0],
      dateEnd: end.toISOString().split('T')[0]
    }));
  };

  const hasActiveFilters = Object.values(filters).some(val => val !== '');

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 mb-6 transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold">
          <Filter size={18} />
          <h2>Filtrar Vendas</h2>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {setShowHidden && (
             <button
              onClick={() => setShowHidden(!showHidden)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                showHidden 
                  ? 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-700' 
                  : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-700/50 dark:text-slate-400 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {showHidden ? <Eye size={14} /> : <EyeOff size={14} />}
              {showHidden ? 'Ocultar Escondidos' : 'Mostrar Escondidos'}
            </button>
          )}

          {hasActiveFilters && (
            <button 
              onClick={clearFilters}
              className="ml-auto md:ml-0 text-xs flex items-center gap-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
            >
              <X size={14} /> Limpar Filtros
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
        {/* Name Filter */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={14} className="text-slate-400" />
          </div>
          <input
            type="text"
            name="searchName"
            placeholder="Nome do Cliente"
            value={filters.searchName}
            onChange={handleChange}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-600 dark:text-white transition-colors placeholder:text-slate-400"
          />
        </div>

        {/* City Filter */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin size={14} className="text-slate-400" />
          </div>
          <input
            type="text"
            name="searchCity"
            placeholder="Cidade"
            value={filters.searchCity}
            onChange={handleChange}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-600 dark:text-white transition-colors placeholder:text-slate-400"
          />
        </div>

        {/* Product ID Filter */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Package size={14} className="text-slate-400" />
          </div>
          <input
            type="text"
            name="searchProductId"
            placeholder="ID Produto / SKU"
            value={filters.searchProductId}
            onChange={handleChange}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-600 dark:text-white transition-colors placeholder:text-slate-400"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            name="status"
            value={filters.status}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-600 transition-colors text-slate-700 dark:text-white"
          >
            <option value="" className="text-slate-500">Todos os Status</option>
            {Object.values(ShippingStatus).map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        {/* Date Start */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar size={14} className="text-slate-400" />
          </div>
          <input
            type="date"
            name="dateStart"
            value={filters.dateStart}
            onChange={handleChange}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-600 transition-colors text-slate-600 dark:text-white placeholder:text-slate-400"
            title="Data Inicial"
          />
        </div>

        {/* Date End */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar size={14} className="text-slate-400" />
          </div>
          <input
            type="date"
            name="dateEnd"
            value={filters.dateEnd}
            onChange={handleChange}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-600 transition-colors text-slate-600 dark:text-white placeholder:text-slate-400"
            title="Data Final"
          />
        </div>
      </div>

      {/* Quick Date Filters */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
          <CalendarDays size={14} /> Períodos Rápidos:
        </span>
        <button 
          onClick={() => setDateRange('today')}
          className="px-3 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-md transition-colors border border-transparent hover:border-slate-300 dark:hover:border-slate-500"
        >
          Hoje
        </button>
        <button 
          onClick={() => setDateRange('7days')}
          className="px-3 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-md transition-colors border border-transparent hover:border-slate-300 dark:hover:border-slate-500"
        >
          Últimos 7 dias
        </button>
        <button 
          onClick={() => setDateRange('30days')}
          className="px-3 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-md transition-colors border border-transparent hover:border-slate-300 dark:hover:border-slate-500"
        >
          Últimos 30 dias
        </button>
        <button 
          onClick={() => setDateRange('thisMonth')}
          className="px-3 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-md transition-colors border border-transparent hover:border-slate-300 dark:hover:border-slate-500"
        >
          Este Mês
        </button>
        
        {(filters.dateStart || filters.dateEnd) && (
          <button
            onClick={clearDates}
            className="ml-auto flex items-center gap-1 px-3 py-1 text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
            title="Limpar apenas filtros de data"
          >
            <X size={12} /> Limpar Datas
          </button>
        )}
      </div>
    </div>
  );
};

export default SalesFilters;