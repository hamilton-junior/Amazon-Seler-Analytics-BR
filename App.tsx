import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_SALES_DATA } from './constants';
import { SaleData, FilterState } from './types';
import KPICards from './components/KPICards';
import SalesTable from './components/SalesTable';
import Charts from './components/Charts';
import AIInsights from './components/AIInsights';
import AlertsSystem from './components/AlertsSystem';
import SalesFilters from './components/SalesFilters';
import SaleDetailModal from './components/SaleDetailModal';
import ProductHistoryModal from './components/ProductHistoryModal';
import { ShoppingCart, Moon, Sun, CheckSquare, Square, EyeOff, Eye, Check } from 'lucide-react';

const App: React.FC = () => {
  // Theme State
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  const isDarkMode = theme === 'dark';

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const [salesData, setSalesData] = useState<SaleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Selected Sale for Modal
  const [selectedSale, setSelectedSale] = useState<SaleData | null>(null);
  
  // Selected Product for History Modal
  const [selectedProductHistory, setSelectedProductHistory] = useState<{ id: string, name: string, currentPrice: number } | null>(null);

  // Hidden State
  const [showHidden, setShowHidden] = useState(false);

  // Selection & Marking State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    searchName: '',
    searchCity: '',
    searchProductId: '',
    status: '',
    dateStart: '',
    dateEnd: ''
  });

  useEffect(() => {
    // Simulate API fetch delay
    const timer = setTimeout(() => {
      setSalesData(MOCK_SALES_DATA);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Update Note Handler
  const handleUpdateNote = (id: string, newNote: string) => {
    setSalesData(prevData => 
      prevData.map(sale => 
        sale.id === id ? { ...sale, observacoes: newNote } : sale
      )
    );
  };

  // Toggle Hide Handler
  const handleToggleHide = (id: string) => {
    setSalesData(prevData =>
      prevData.map(sale =>
        sale.id === id ? { ...sale, hidden: !sale.hidden } : sale
      )
    );
  };

  // Toggle Highlight
  const handleToggleHighlight = (id: string) => {
    setSalesData(prevData => 
      prevData.map(sale =>
        sale.id === id ? { ...sale, isHighlighted: !sale.isHighlighted } : sale
      )
    );
  };

  // Toggle Mark
  const handleToggleMark = (id: string) => {
    setSalesData(prevData => 
      prevData.map(sale =>
        sale.id === id ? { ...sale, isMarked: !sale.isMarked } : sale
      )
    );
  };

  // Multi-select Handlers
  const handleSelectRow = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = (ids: string[]) => {
    if (selectedIds.size === ids.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(ids));
    }
  };

  // --- Bulk Actions ---

  const handleBulkHide = () => {
    // No confirmation needed per user request preference for speed
    setSalesData(prevData => prevData.map(sale => 
      selectedIds.has(sale.id) ? { ...sale, hidden: true } : sale
    ));
    setSelectedIds(new Set());
  };

  const handleBulkShow = () => {
    setSalesData(prevData => prevData.map(sale => 
      selectedIds.has(sale.id) ? { ...sale, hidden: false } : sale
    ));
    setSelectedIds(new Set());
  };

  const handleBulkMark = () => {
    setSalesData(prevData => prevData.map(sale => 
      selectedIds.has(sale.id) ? { ...sale, isMarked: true } : sale
    ));
    setSelectedIds(new Set());
  };

  const handleBulkUnmark = () => {
    setSalesData(prevData => prevData.map(sale => 
      selectedIds.has(sale.id) ? { ...sale, isMarked: false } : sale
    ));
    setSelectedIds(new Set());
  };

  // Compute Filtered Data
  const filteredSalesData = useMemo(() => {
    return salesData.filter(sale => {
      // Hidden Filter
      if (!showHidden && sale.hidden) {
        return false;
      }

      // Name Filter
      if (filters.searchName && !sale.nome.toLowerCase().includes(filters.searchName.toLowerCase())) {
        return false;
      }
      
      // City Filter
      if (filters.searchCity && !sale.cidade.toLowerCase().includes(filters.searchCity.toLowerCase())) {
        return false;
      }

      // Product ID Filter
      if (filters.searchProductId && !sale.idProduto.toLowerCase().includes(filters.searchProductId.toLowerCase())) {
        return false;
      }

      // Status Filter
      if (filters.status && sale.envioStatus !== filters.status) {
        return false;
      }

      // Date Range Filter
      if (filters.dateStart && sale.dataVenda < filters.dateStart) {
        return false;
      }
      if (filters.dateEnd && sale.dataVenda > filters.dateEnd) {
        return false;
      }

      return true;
    });
  }, [salesData, filters, showHidden]);

  return (
    <div className="min-h-screen pb-10 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 p-2 rounded-md text-white">
                <ShoppingCart size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Amazon Analytics</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Painel de Controle do Vendedor</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-500 dark:text-slate-300 hidden sm:inline-block">
                Conexão: Simulada (Segurança)
              </span>
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                title={isDarkMode ? "Mudar para modo claro" : "Mudar para modo escuro"}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                JS
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-slate-500 dark:text-slate-400">Carregando dados da Amazon...</p>
          </div>
        ) : (
          <>
            {/* Filter Section */}
            <SalesFilters 
              filters={filters} 
              setFilters={setFilters} 
              showHidden={showHidden}
              setShowHidden={setShowHidden}
            />

            {/* Alerts System */}
            <AlertsSystem data={filteredSalesData} />

            {/* KPI Cards Section */}
            <KPICards data={filteredSalesData} />

            {/* AI Insights Section */}
            <AIInsights data={filteredSalesData} />

            {/* Visual Charts */}
            <Charts data={filteredSalesData} isDarkMode={isDarkMode} />

            {/* Detailed Data Table */}
            <div className="mb-4">
              <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-3 gap-3">
                 <h2 className="text-lg font-bold text-slate-800 dark:text-white">Detalhamento de Vendas</h2>
                 
                 {selectedIds.size > 0 && (
                   <div className="flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-right-4 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                     <span className="text-xs text-slate-500 font-medium px-2 border-r border-slate-200 dark:border-slate-700 mr-1">
                       {selectedIds.size} selecionados
                     </span>
                     
                     {/* Marking Actions */}
                     <div className="flex gap-1">
                       <button 
                          onClick={handleBulkMark} 
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded text-xs hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors border border-blue-100 dark:border-blue-800"
                          title="Adicionar marcação de verificado"
                        >
                          <CheckSquare size={14} /> Marcar
                        </button>
                        <button 
                          onClick={handleBulkUnmark} 
                          className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 rounded text-xs hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors border border-slate-200 dark:border-slate-600"
                          title="Remover marcação"
                        >
                          <Square size={14} /> Desmarcar
                        </button>
                     </div>

                     <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1"></div>

                     {/* Visibility Actions */}
                     <div className="flex gap-1">
                       <button 
                          onClick={handleBulkHide} 
                          className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 rounded text-xs hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-300 transition-colors border border-slate-200 dark:border-slate-600"
                          title="Ocultar da lista principal"
                        >
                          <EyeOff size={14} /> Esconder
                        </button>
                        <button 
                          onClick={handleBulkShow} 
                          className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 rounded text-xs hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 dark:hover:text-green-300 transition-colors border border-slate-200 dark:border-slate-600"
                          title="Exibir itens ocultos"
                        >
                          <Eye size={14} /> Mostrar
                        </button>
                     </div>
                   </div>
                 )}
              </div>
              
              <SalesTable 
                data={filteredSalesData} 
                selectedIds={selectedIds}
                onRowClick={setSelectedSale} 
                onUpdateNote={handleUpdateNote}
                onToggleHide={handleToggleHide}
                onToggleHighlight={handleToggleHighlight}
                onToggleMark={handleToggleMark}
                onSelectRow={handleSelectRow}
                onSelectAll={handleSelectAll}
                onProductClick={(id, name, price) => setSelectedProductHistory({ id, name, currentPrice: price })}
                showHidden={showHidden}
                setShowHidden={setShowHidden}
              />
            </div>

            {/* Sale Detail Modal */}
            <SaleDetailModal sale={selectedSale} onClose={() => setSelectedSale(null)} />
            
            {/* Product History Modal */}
            <ProductHistoryModal 
              isOpen={!!selectedProductHistory}
              onClose={() => setSelectedProductHistory(null)}
              product={selectedProductHistory}
              isDarkMode={isDarkMode}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default App;