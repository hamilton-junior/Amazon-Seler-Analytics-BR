import React from 'react';
import { SaleData } from '../types';
import { formatCurrency } from '../constants';
import { X, User, MapPin, Truck, Package, DollarSign, Info, FileText, ArrowRight, Calendar, CreditCard, ShoppingBag } from 'lucide-react';

interface SaleDetailModalProps {
  sale: SaleData | null;
  onClose: () => void;
}

const SaleDetailModal: React.FC<SaleDetailModalProps> = ({ sale, onClose }) => {
  if (!sale) return null;

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Overlay click to close */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700 flex flex-col relative z-10 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <FileText className="text-indigo-600 dark:text-indigo-400" size={24} />
                Detalhes do Pedido
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                  #{sale.id}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {new Date(sale.dataVenda).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>
            
            {/* Prominent Status Badge */}
            <span className={`px-3 py-1 rounded-full text-sm font-bold border ml-2 ${
              sale.envioStatus === 'Entregue' 
                ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' 
                : sale.envioStatus === 'Devolvido' || sale.envioStatus === 'Cancelado'
                ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
                : 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
            }`}>
              {sale.envioStatus}
            </span>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content Body - 2 Column Layout */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-50/50 dark:bg-slate-900/50">
          
          {/* LEFT COLUMN: Operations (Product, Customer, Logistics) */}
          <div className="space-y-6">
            
            {/* Product Card */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-indigo-50/50 dark:bg-indigo-900/10 flex items-center gap-2">
                <Package size={18} className="text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Produto</h3>
              </div>
              <div className="p-4">
                <div className="flex items-start gap-4">
                  <div className="bg-slate-100 dark:bg-slate-700 w-16 h-16 rounded-md flex items-center justify-center flex-shrink-0 text-slate-300 dark:text-slate-500">
                    <ShoppingBag size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 dark:text-white text-base leading-tight mb-1">{sale.produto}</h4>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                      <span>Qtd: <b className="text-slate-900 dark:text-white">{sale.quantidade}</b></span>
                      <span>ASIN: <b className="font-mono text-slate-900 dark:text-white">{sale.idProduto}</b></span>
                    </div>
                  </div>
                </div>
                {sale.observacoes && (
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded text-sm text-amber-800 dark:text-amber-200 flex gap-2 items-start">
                    <Info size={15} className="mt-0.5 flex-shrink-0" />
                    <span className="text-xs">{sale.observacoes}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Card */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center gap-2">
                <User size={18} className="text-slate-500 dark:text-slate-400" />
                <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Cliente</h3>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-500 uppercase font-medium">Nome</span>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white mt-0.5">{sale.nome}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 uppercase font-medium">Localização</span>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white mt-0.5 flex items-center gap-1">
                    <MapPin size={14} className="text-slate-400" /> {sale.cidade}
                  </p>
                </div>
              </div>
            </div>

            {/* Logistics Card */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center gap-2">
                <Truck size={18} className="text-slate-500 dark:text-slate-400" />
                <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Logística e Entrega</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Rastreamento</p>
                    <p className="font-mono text-sm text-slate-700 dark:text-slate-300 select-all">{sale.codigoRastreio || 'N/A'}</p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="relative pt-2 pb-2">
                  <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-100 dark:bg-slate-700 -z-10 transform -translate-y-1/2"></div>
                  <div className="flex justify-between text-center">
                    <div className="bg-white dark:bg-slate-800 px-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-600 mx-auto mb-2 ring-4 ring-white dark:ring-slate-800"></div>
                      <p className="text-[10px] uppercase text-slate-400 font-bold">Venda</p>
                      <p className="text-xs text-slate-700 dark:text-slate-300">{new Date(sale.dataVenda).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 px-2">
                      <div className={`w-2 h-2 rounded-full mx-auto mb-2 ring-4 ring-white dark:ring-slate-800 ${sale.dataEnvio ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                      <p className="text-[10px] uppercase text-slate-400 font-bold">Envio</p>
                      <p className="text-xs text-slate-700 dark:text-slate-300">{sale.dataEnvio ? new Date(sale.dataEnvio).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'}) : '-'}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 px-2">
                      <div className={`w-2 h-2 rounded-full mx-auto mb-2 ring-4 ring-white dark:ring-slate-800 ${sale.dataRecebimento ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                      <p className="text-[10px] uppercase text-slate-400 font-bold">Entrega</p>
                      <p className="text-xs text-slate-700 dark:text-slate-300">{sale.dataRecebimento ? new Date(sale.dataRecebimento).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'}) : '-'}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-700">
                  <div>
                     <span className="text-xs text-slate-500 block">Ponto de Entrega</span>
                     <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{sale.pontoEntrega}</span>
                  </div>
                  <div className="text-right">
                     <span className="text-xs text-slate-500 block">Recebido Cliente</span>
                     <span className={`text-sm font-medium ${sale.recebimentoClienteStatus ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}>
                       {sale.recebimentoClienteStatus ? 'Confirmado' : 'Pendente'}
                     </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Financials (Revenue, Costs, Profit) */}
          <div className="space-y-6">
            
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden h-full flex flex-col">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center gap-2">
                <DollarSign size={18} className="text-green-600 dark:text-green-400" />
                <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Demonstrativo Financeiro</h3>
              </div>
              
              <div className="p-6 flex-1 flex flex-col gap-6">
                
                {/* Revenue Section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <ArrowRight size={12} className="text-green-500" /> Entradas (Receita)
                  </h4>
                  <div className="bg-green-50/50 dark:bg-green-900/10 rounded-lg p-3 space-y-2 border border-green-100 dark:border-green-900/30">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Valor do Produto</span>
                      <span className="text-slate-800 dark:text-slate-200">{formatCurrency(sale.valorVenda)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Frete Cobrado</span>
                      <span className="text-slate-800 dark:text-slate-200">{formatCurrency(sale.freteRecebido)}</span>
                    </div>
                    <div className="pt-2 border-t border-green-200 dark:border-green-800/30 flex justify-between font-bold text-green-700 dark:text-green-400">
                      <span>Receita Bruta</span>
                      <span>{formatCurrency(sale.valorVendaMaisFrete)}</span>
                    </div>
                  </div>
                </div>

                {/* Costs Section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <ArrowRight size={12} className="text-red-500" /> Saídas (Custos)
                  </h4>
                  <div className="bg-red-50/50 dark:bg-red-900/10 rounded-lg p-3 space-y-2 border border-red-100 dark:border-red-900/30">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Custo da Mercadoria (CMV)</span>
                      <span className="text-slate-800 dark:text-slate-200">{formatCurrency(sale.valorCompra)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Frete Pago (Envio)</span>
                      <span className="text-slate-800 dark:text-slate-200">{formatCurrency(sale.fretePago)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Comissão Amazon</span>
                      <span className="text-slate-800 dark:text-slate-200">{formatCurrency(sale.comissaoAmazon)}</span>
                    </div>
                    <div className="pt-2 border-t border-red-200 dark:border-red-800/30 flex justify-between font-bold text-red-700 dark:text-red-400">
                      <span>Total Custos</span>
                      <span>- {formatCurrency(sale.totalCustos)}</span>
                    </div>
                  </div>
                </div>

                {/* Profit Section - Push to bottom */}
                <div className="mt-auto">
                  <div className={`rounded-xl p-5 border-2 ${
                    sale.lucro >= 0 
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700' 
                      : 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-700'
                  }`}>
                    <div className="flex justify-between items-end">
                      <div>
                        <span className={`text-xs font-bold uppercase tracking-wider block mb-1 ${
                          sale.lucro >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          Lucro Líquido
                        </span>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          Margem: 
                          <span className={`font-bold ${sale.lucro >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {((sale.lucro / sale.valorVendaMaisFrete) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className={`text-4xl font-extrabold ${sale.lucro >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {formatCurrency(sale.lucro)}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
        
        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaleDetailModal;