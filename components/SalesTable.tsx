import React, { useState, useMemo } from 'react';
import { SaleData, ShippingStatus } from '../types';
import { formatCurrency } from '../constants';
import { Search, X, Edit2, Check, AlertCircle, Eye, EyeOff, AlertTriangle, ArrowUp, ArrowDown, ArrowUpDown, GripVertical, Star, Flag, BarChart2 } from 'lucide-react';

interface SalesTableProps {
  data: SaleData[];
  selectedIds?: Set<string>;
  onRowClick?: (sale: SaleData) => void;
  onUpdateNote?: (id: string, note: string) => void;
  onToggleHide?: (id: string) => void;
  onToggleHighlight?: (id: string) => void;
  onToggleMark?: (id: string) => void;
  onSelectRow?: (id: string) => void;
  onSelectAll?: (ids: string[]) => void;
  onProductClick?: (id: string, name: string, currentPrice: number) => void;
  showHidden?: boolean;
  setShowHidden?: (show: boolean) => void;
}

type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: keyof SaleData | null;
  direction: SortDirection;
}

interface ColumnDef {
  key: keyof SaleData;
  label: string;
  minWidth: string;
  isNumeric?: boolean;
}

// Definição inicial das colunas reordenáveis (exclui Checkbox, Nome e Ações que são fixas)
const INITIAL_COLUMNS: ColumnDef[] = [
  { key: 'cidade', label: 'Cidade', minWidth: '120px' },
  { key: 'envioStatus', label: 'Envio', minWidth: '100px' },
  { key: 'recebimentoClienteStatus', label: 'Recebido (Cli)', minWidth: '80px' },
  { key: 'dataVenda', label: 'Data Venda', minWidth: '100px' },
  { key: 'dataEnvio', label: 'Data Envio', minWidth: '100px' },
  { key: 'dataRecebimento', label: 'Data Receb.', minWidth: '100px' },
  { key: 'recebimentoDias', label: 'Dias', minWidth: '60px', isNumeric: true },
  { key: 'pontoEntrega', label: 'Ponto Entrega', minWidth: '100px' },
  { key: 'codigoRastreio', label: 'Rastreio', minWidth: '120px' },
  { key: 'valorVenda', label: 'Valor Venda', minWidth: '100px', isNumeric: true },
  { key: 'freteRecebido', label: 'Frete Rec.', minWidth: '100px', isNumeric: true },
  { key: 'valorVendaMaisFrete', label: 'V + F', minWidth: '100px', isNumeric: true },
  { key: 'valorCompra', label: 'Vlr Compra', minWidth: '100px', isNumeric: true },
  { key: 'fretePago', label: 'Frete Pago', minWidth: '100px', isNumeric: true },
  { key: 'comissaoAmazon', label: 'Comissão', minWidth: '100px', isNumeric: true },
  { key: 'totalCustos', label: 'Custos Tot.', minWidth: '100px', isNumeric: true },
  { key: 'lucro', label: 'Lucro', minWidth: '100px', isNumeric: true },
  { key: 'quantidade', label: 'Qtd', minWidth: '60px', isNumeric: true },
  { key: 'idProduto', label: 'ID Produto', minWidth: '100px' },
  { key: 'produto', label: 'Produto', minWidth: '200px' },
  { key: 'observacoes', label: 'Observações', minWidth: '200px' },
];

const SalesTable: React.FC<SalesTableProps> = ({ 
  data, 
  selectedIds,
  onRowClick, 
  onUpdateNote, 
  onToggleHide,
  onToggleHighlight,
  onToggleMark,
  onSelectRow,
  onSelectAll,
  onProductClick,
  showHidden,
  setShowHidden
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');
  const [hoveredProduct, setHoveredProduct] = useState<{ name: string; x: number; y: number } | null>(null);
  const [exitingRows, setExitingRows] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [columns, setColumns] = useState<ColumnDef[]>(INITIAL_COLUMNS);
  const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(null);

  const getStatusColor = (status: ShippingStatus) => {
    switch (status) {
      case ShippingStatus.DELIVERED: return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case ShippingStatus.SHIPPED: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case ShippingStatus.PROCESSING: return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300';
      case ShippingStatus.PENDING: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      case ShippingStatus.RETURNED: return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      case ShippingStatus.CANCELED: return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const isCriticalStatus = (status: ShippingStatus) => {
    return status === ShippingStatus.RETURNED || status === ShippingStatus.CANCELED;
  };

  // --- Filtering & Sorting Logic ---

  const filteredData = useMemo(() => {
    return data.filter(sale => {
      if (!searchTerm) return true;
      const lowerTerm = searchTerm.toLowerCase();
      return Object.values(sale).some(value => {
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(lowerTerm);
      });
    });
  }, [data, searchTerm]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue);
      }
      
      if (aValue < bValue) return -1;
      if (aValue > bValue) return 1;
      return 0;
    });

    return sortConfig.direction === 'asc' ? sorted : sorted.reverse();
  }, [filteredData, sortConfig]);

  // --- Handlers ---

  const handleSort = (key: keyof SaleData) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const startEditing = (e: React.MouseEvent, sale: SaleData) => {
    e.stopPropagation();
    setEditingId(sale.id);
    setTempNote(sale.observacoes || '');
  };

  const saveNote = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (onUpdateNote) onUpdateNote(id, tempNote);
    setEditingId(null);
  };

  const cancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleHideClick = (e: React.MouseEvent, id: string, isHidden: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!onToggleHide) return;

    if (isHidden) {
      // Unhide - always immediate
      onToggleHide(id);
    } else {
      // Hide
      if (!showHidden) {
        // If hidden items are NOT shown, animate out the row because it will leave the list
        setExitingRows(prev => new Set(prev).add(id));
        setTimeout(() => {
          onToggleHide(id);
          setExitingRows(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }, 300); // Wait for transition
      } else {
        // If hidden items ARE shown, just toggle state immediately (no exit animation)
        onToggleHide(id);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (onUpdateNote) onUpdateNote(id, tempNote);
      setEditingId(null);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const handleMouseEnter = (e: React.MouseEvent, text: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredProduct({
      name: text,
      x: rect.left + rect.width / 2,
      y: rect.top
    });
  };

  const handleMouseLeave = () => {
    setHoveredProduct(null);
  };

  // --- Drag and Drop Handlers ---

  const onDragStart = (e: React.DragEvent, index: number) => {
    setDraggedColumnIndex(index);
    e.dataTransfer.effectAllowed = "move"; 
  };

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = "move";
  };

  const onDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedColumnIndex === null || draggedColumnIndex === dropIndex) return;

    const newColumns = [...columns];
    const [removed] = newColumns.splice(draggedColumnIndex, 1);
    newColumns.splice(dropIndex, 0, removed);
    
    setColumns(newColumns);
    setDraggedColumnIndex(null);
  };

  // --- Render Helper ---

  const renderCellContent = (sale: SaleData, key: keyof SaleData, isEditing: boolean) => {
    const value = sale[key];

    if (key === 'cidade' || key === 'pontoEntrega' || key === 'produto') {
       return (
         <div 
           className={key === 'produto' ? 'truncate max-w-[200px]' : ''}
           onMouseEnter={(e) => handleMouseEnter(e, String(value))} 
           onMouseLeave={handleMouseLeave}
         >
           {value as string}
         </div>
       );
    }

    if (key === 'idProduto') {
      return (
        <div 
           className="font-mono text-xs text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline flex items-center gap-1"
           onClick={(e) => {
             e.stopPropagation();
             if (onProductClick) onProductClick(sale.idProduto, sale.produto, sale.valorVenda);
           }}
           onMouseEnter={(e) => value ? handleMouseEnter(e, String(value)) : undefined} 
           onMouseLeave={handleMouseLeave}
        >
          {value ? value : '-'}
          <BarChart2 size={10} className="opacity-70" />
        </div>
      );
    }

    if (key === 'codigoRastreio') {
      return (
        <div 
           className="font-mono text-xs"
           onMouseEnter={(e) => value ? handleMouseEnter(e, String(value)) : undefined} 
           onMouseLeave={handleMouseLeave}
        >
          {value ? value : '-'}
        </div>
      );
    }

    if (key === 'envioStatus') {
      return (
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${getStatusColor(value as ShippingStatus)}`}>
           {value as string}
        </span>
      );
    }

    if (key === 'recebimentoClienteStatus') {
      return <div className="text-center">{value ? 'Sim' : 'Não'}</div>;
    }

    if (['dataVenda', 'dataEnvio', 'dataRecebimento'].includes(key)) {
      return value ? new Date(value as string).toLocaleDateString('pt-BR') : '-';
    }

    if (['valorVenda', 'freteRecebido', 'valorVendaMaisFrete', 'valorCompra', 'fretePago', 'comissaoAmazon', 'totalCustos', 'lucro'].includes(key)) {
       const isProfit = key === 'lucro';
       const numVal = value as number;
       const colorClass = isProfit 
          ? (numVal >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400') 
          : '';
       
       return (
         <div className={`text-right ${key === 'valorVendaMaisFrete' || key === 'totalCustos' ? 'font-semibold' : ''} ${key === 'lucro' ? 'font-bold' : ''} ${colorClass}`}>
           {formatCurrency(numVal)}
         </div>
       );
    }

    if (key === 'observacoes') {
      if (isEditing) {
        return (
          <div onClick={(e) => e.stopPropagation()}>
             <textarea 
                value={tempNote}
                onChange={(e) => setTempNote(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, sale.id)}
                className="w-full text-xs p-2 border border-indigo-300 dark:border-indigo-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={2}
                autoFocus
                placeholder="Adicionar observação..."
              />
          </div>
        );
      }
      return (
         <span className="italic text-slate-400 text-xs whitespace-normal">{sale.observacoes || '-'}</span>
      );
    }

    return <div className="text-center">{value !== null && value !== undefined ? String(value) : '-'}</div>;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300 relative">
      
      {/* Search Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-3 items-center bg-slate-50/50 dark:bg-slate-800/50">
        <div className="relative flex-1 max-w-md group w-full">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
           <input
             type="text"
             placeholder="Buscar em todas as colunas..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full pl-10 pr-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors placeholder:text-slate-400"
           />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="flex items-center gap-1 px-3 py-2 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-md transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-800/50"
              title="Limpar busca"
            >
              <X size={16} />
              Limpar
            </button>
          )}

          {setShowHidden && (
            <button
              onClick={() => setShowHidden(!showHidden)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border transition-all shadow-sm ml-auto md:ml-0 ${
                showHidden 
                  ? 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-700' 
                  : 'bg-white text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
              }`}
            >
              {showHidden ? <Eye size={16} /> : <EyeOff size={16} />}
              {showHidden ? 'Ocultar Escondidos' : 'Ver Escondidos'}
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto pb-6">
        <table className="w-full text-xs text-left text-slate-600 dark:text-slate-400 whitespace-nowrap border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold uppercase">
            <tr>
              {/* FIXED CHECKBOX COLUMN */}
              <th className="px-3 py-3 border-b border-r border-slate-200 dark:border-slate-600 sticky left-0 bg-slate-50 dark:bg-slate-700 z-30 min-w-[40px]">
                <input 
                  type="checkbox" 
                  className="rounded text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-slate-600 cursor-pointer"
                  checked={data.length > 0 && selectedIds?.size === data.length}
                  onChange={(e) => {
                    if (onSelectAll) onSelectAll(e.target.checked ? data.map(s => s.id) : []);
                  }}
                />
              </th>

              {/* FIXED NAME COLUMN */}
              <th 
                className="px-3 py-3 border-b border-r border-slate-200 dark:border-slate-600 sticky left-[40px] bg-slate-50 dark:bg-slate-700 z-30 min-w-[150px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
                onClick={() => handleSort('nome')}
              >
                <div className="flex items-center gap-1 cursor-pointer group">
                  Nome
                  <span className="text-slate-400 dark:text-slate-500">
                    {sortConfig.key === 'nome' ? (
                      sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                    ) : (
                      <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </span>
                </div>
              </th>

              {/* DYNAMIC COLUMNS */}
              {columns.map((col, index) => {
                 const isActiveSort = sortConfig.key === col.key;
                 
                 return (
                   <th
                     key={col.key}
                     className="px-3 py-3 border-b border-r border-slate-200 dark:border-slate-600 group relative cursor-move"
                     style={{ minWidth: col.minWidth }}
                     draggable
                     onDragStart={(e) => onDragStart(e, index)}
                     onDragOver={(e) => onDragOver(e, index)}
                     onDrop={(e) => onDrop(e, index)}
                   >
                     {/* Grab Handle visible on hover */}
                     <div className="absolute left-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-move text-slate-300">
                       <GripVertical size={12} />
                     </div>
                     
                     <div 
                       className="flex items-center gap-1 cursor-pointer pl-1"
                       onClick={() => handleSort(col.key)}
                     >
                       {col.label}
                       <span className="text-slate-400 dark:text-slate-500">
                         {isActiveSort ? (
                           sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                         ) : (
                           <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                         )}
                       </span>
                     </div>
                   </th>
                 );
              })}

              {/* FIXED ACTIONS COLUMN */}
              <th className="px-3 py-3 border-b bg-slate-100 dark:bg-slate-700/50 text-center min-w-[130px] sticky right-0 z-20 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">Ações</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 3} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="opacity-20" size={40} />
                    <p>Nenhum resultado encontrado para "{searchTerm}"</p>
                    {data.length > 0 && !showHidden && (
                      <p className="text-xs text-indigo-500 cursor-pointer" onClick={() => setShowHidden && setShowHidden(true)}>
                        Verificar itens escondidos
                      </p>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              sortedData.map((sale) => {
                const isCritical = isCriticalStatus(sale.envioStatus);
                const isEditing = editingId === sale.id;
                const isHidden = sale.hidden === true;
                const isHighlighted = sale.isHighlighted === true;
                const isMarked = sale.isMarked === true;
                const isExiting = exitingRows.has(sale.id);
                const isSelected = selectedIds?.has(sale.id);

                return (
                  <tr 
                    key={sale.id} 
                    onClick={() => onRowClick && !isEditing && onRowClick(sale)}
                    className={`
                      border-b border-slate-100 dark:border-slate-700 group
                      transition-all duration-300 ease-in-out
                      ${!isEditing && onRowClick ? 'cursor-pointer' : ''}
                      ${isExiting ? 'opacity-0 scale-95 translate-x-4 pointer-events-none' : 'opacity-100 scale-100 translate-x-0 animate-in fade-in slide-in-from-left-2 duration-500'}
                      ${isHidden
                        ? 'bg-slate-100/50 dark:bg-slate-800/30 opacity-60 grayscale italic'
                        : isHighlighted 
                          ? 'bg-amber-50 dark:bg-amber-900/10 border-l-4 border-l-amber-400 dark:border-l-amber-500'
                          : isCritical 
                            ? 'hover:bg-red-50 dark:hover:bg-red-900/10' 
                            : 'hover:bg-indigo-50 dark:hover:bg-slate-700/80'
                      }
                      ${isSelected ? 'bg-indigo-50/60 dark:bg-indigo-900/20' : ''}
                    `}
                    title={isHidden ? "Item Oculto (Clique para detalhes)" : "Clique para ver detalhes"}
                  >
                     {/* FIXED CHECKBOX COLUMN */}
                    <td 
                      className={`px-3 py-2 border-r border-slate-100 dark:border-slate-700 sticky left-0 z-20 ${
                        isHighlighted ? 'bg-amber-50 dark:bg-amber-900/10' : (isHidden ? 'bg-slate-100 dark:bg-slate-800' : 'bg-white dark:bg-slate-800')
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input 
                        type="checkbox" 
                        className="rounded text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-slate-600 cursor-pointer"
                        checked={isSelected || false}
                        onChange={() => onSelectRow && onSelectRow(sale.id)}
                      />
                    </td>

                    {/* FIXED NAME COLUMN */}
                    <td 
                      className={`px-3 py-2 border-r border-slate-100 dark:border-slate-700 sticky left-[40px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] font-medium text-slate-900 dark:text-slate-100 z-20 ${
                        isHighlighted ? 'bg-amber-50 dark:bg-amber-900/10' : (isHidden ? 'bg-slate-100 dark:bg-slate-800' : isCritical ? 'bg-red-50 dark:bg-red-900/20' : 'bg-white dark:bg-slate-800')
                      }`}
                      onMouseEnter={(e) => handleMouseEnter(e, sale.nome)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="flex items-center gap-2">
                         {isMarked && (
                           <Check size={14} className="text-indigo-500 flex-shrink-0" strokeWidth={3} />
                         )}
                        {isCritical && (
                          <span title="Atenção: Status Crítico">
                            <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                          </span>
                        )}
                        {sale.nome}
                      </div>
                    </td>

                    {/* DYNAMIC COLUMNS */}
                    {columns.map((col) => {
                      return (
                        <td 
                          key={col.key} 
                          className="px-3 py-2 border-r border-slate-100 dark:border-slate-700"
                        >
                          {renderCellContent(sale, col.key, isEditing)}
                        </td>
                      );
                    })}

                    {/* FIXED ACTIONS COLUMN */}
                    <td className={`px-3 py-2 sticky right-0 border-l border-slate-200 dark:border-slate-700 z-20 text-center shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] ${
                       isHidden 
                       ? 'bg-slate-100 dark:bg-slate-800' 
                       : isHighlighted ? 'bg-amber-50 dark:bg-amber-900/10' : 'bg-slate-50 dark:bg-slate-800/50'
                    }`} onClick={(e) => e.stopPropagation()}>
                       {isEditing ? (
                         // Edit Mode Actions
                         <div className="flex items-center justify-center gap-2">
                           <button 
                              onClick={(e) => saveNote(e, sale.id)}
                              className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-1.5 rounded-md hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors shadow-sm border border-green-200 dark:border-green-800"
                              title="Salvar"
                            >
                              <Check size={14} />
                            </button>
                            <button 
                              onClick={cancelEditing}
                              className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-1.5 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors shadow-sm border border-red-200 dark:border-red-800"
                              title="Cancelar"
                            >
                              <X size={14} />
                            </button>
                         </div>
                       ) : (
                         // View Mode Actions (Visible on Hover)
                         <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                           {onUpdateNote && (
                             <button
                               onClick={(e) => startEditing(e, sale)}
                               className="text-indigo-600 dark:text-indigo-400 p-1 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                               title="Editar Notas"
                             >
                               <Edit2 size={14} />
                             </button>
                           )}

                           {onToggleHighlight && (
                             <button
                               onClick={(e) => { e.stopPropagation(); onToggleHighlight(sale.id); }}
                               className={`p-1 rounded hover:bg-amber-100 dark:hover:bg-amber-900/50 ${isHighlighted ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`}
                               title={isHighlighted ? "Remover Destaque" : "Destacar Venda"}
                             >
                               <Star size={14} className={isHighlighted ? 'fill-current' : ''} />
                             </button>
                           )}
                           
                           {onToggleMark && (
                             <button
                               onClick={(e) => { e.stopPropagation(); onToggleMark(sale.id); }}
                               className={`p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 ${isMarked ? 'text-blue-500 fill-blue-500' : 'text-slate-400'}`}
                               title={isMarked ? "Desmarcar" : "Marcar Venda"}
                             >
                               <Flag size={14} className={isMarked ? 'fill-current' : ''} />
                             </button>
                           )}
                           
                           {isCritical && (
                             <button
                               onClick={(e) => {
                                 e.stopPropagation();
                                 alert(`Atenção: Venda com status '${sale.envioStatus}'. Verifique as regras de alerta acima.`);
                                 const alertEl = document.getElementById('alerts-system');
                                 if (alertEl) alertEl.scrollIntoView({ behavior: 'smooth' });
                               }}
                               className="text-red-500 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/50"
                               title="Verificar Alerta Crítico"
                             >
                               <AlertTriangle size={14} />
                             </button>
                           )}

                           {onToggleHide && (
                              <button
                                onClick={(e) => handleHideClick(e, sale.id, !!sale.hidden)}
                                className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600 ${isHidden ? 'text-amber-600' : 'text-slate-400'}`}
                                title={isHidden ? "Mostrar Venda (Desocultar)" : "Esconder Venda"}
                              >
                                {isHidden ? <Eye size={14} /> : <EyeOff size={14} />}
                              </button>
                           )}
                         </div>
                       )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {/* Custom Tooltip Render */}
      {hoveredProduct && (
        <div 
          className="fixed z-[60] px-3 py-2 text-xs font-medium text-white bg-slate-900 dark:bg-slate-700 rounded-lg shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full max-w-xs whitespace-normal text-center"
          style={{ top: hoveredProduct.y - 8, left: hoveredProduct.x }}
        >
          {hoveredProduct.name}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-700"></div>
        </div>
      )}

      <div className="bg-slate-50 dark:bg-slate-700 px-4 py-3 border-t border-slate-200 dark:border-slate-600 text-xs text-slate-500 dark:text-slate-400 flex justify-between">
        <span>Mostrando {filteredData.length} de {data.length} registros</span>
        <span>Dados atualizados: {new Date().toLocaleString('pt-BR')}</span>
      </div>
    </div>
  );
};

export default SalesTable;