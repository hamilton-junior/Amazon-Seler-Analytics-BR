import React, { useState, useMemo } from 'react';
import { SaleData, AlertRule, AlertOperator, Alert, ShippingStatus } from '../types';
import { formatCurrency } from '../constants';
import { Bell, Settings, Trash2, Plus, Mail, AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronUp, Archive, Check, Filter, Pencil, ArrowUp, ArrowDown, Save, X, AlertCircle, ChevronRight, CheckSquare, Square } from 'lucide-react';

interface AlertsSystemProps {
  data: SaleData[];
}

// Configuration for available fields to alert on
const FIELD_DEFINITIONS: { 
  key: keyof SaleData; 
  label: string; 
  type: 'number' | 'currency' | 'text' | 'select';
  options?: string[];
}[] = [
  { key: 'lucro', label: 'Lucro (R$)', type: 'currency' },
  { key: 'valorVenda', label: 'Valor Venda (R$)', type: 'currency' },
  { key: 'recebimentoDias', label: 'Dias de Entrega', type: 'number' },
  { key: 'envioStatus', label: 'Status de Envio', type: 'select', options: Object.values(ShippingStatus) },
  { key: 'cidade', label: 'Cidade', type: 'text' },
  { key: 'produto', label: 'Nome do Produto', type: 'text' },
  { key: 'idProduto', label: 'ID Produto (ASIN)', type: 'text' },
  { key: 'quantidade', label: 'Quantidade', type: 'number' },
];

const AlertsSystem: React.FC<AlertsSystemProps> = ({ data }) => {
  
  // -- State --

  // Default Rules adapted to new structure
  const [rules, setRules] = useState<AlertRule[]>([
    {
      id: '1',
      name: 'Lucro Alto (> R$ 100)',
      active: true,
      emailNotification: false,
      field: 'lucro',
      operator: AlertOperator.GREATER,
      value: 100
    },
    {
      id: '2',
      name: 'Status Devolvido',
      active: true,
      emailNotification: true,
      field: 'envioStatus',
      operator: AlertOperator.EQUALS,
      value: ShippingStatus.RETURNED
    }
  ]);

  // UI State
  const [showConfig, setShowConfig] = useState(false);
  const [viewHistory, setViewHistory] = useState(false);
  const [expandedGroupIds, setExpandedGroupIds] = useState<Set<string>>(new Set());
  
  // Alerts tracking
  const [readAlertIds, setReadAlertIds] = useState<Set<string>>(new Set());
  const [dismissedAlertIds, setDismissedAlertIds] = useState<Set<string>>(new Set());
  const [alertsHistory, setAlertsHistory] = useState<Alert[]>([]);
  const [selectedAlertIds, setSelectedAlertIds] = useState<Set<string>>(new Set());

  // Form State
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [newRuleField, setNewRuleField] = useState<keyof SaleData>('lucro');
  const [newRuleOperator, setNewRuleOperator] = useState<AlertOperator>(AlertOperator.GREATER);
  const [newRuleValue, setNewRuleValue] = useState<string>('');
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleEmail, setNewRuleEmail] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // -- Helpers --

  const getOperatorsForType = (type: string): AlertOperator[] => {
    switch (type) {
      case 'number':
      case 'currency':
        return [AlertOperator.GREATER, AlertOperator.LESS, AlertOperator.EQUALS, AlertOperator.NOT_EQUALS];
      case 'text':
        return [AlertOperator.CONTAINS, AlertOperator.EQUALS, AlertOperator.NOT_EQUALS];
      case 'select':
        return [AlertOperator.EQUALS, AlertOperator.NOT_EQUALS];
      default:
        return [AlertOperator.EQUALS];
    }
  };

  const getFieldConfig = (key: string) => FIELD_DEFINITIONS.find(f => f.key === key);

  // Automatically update operator when field changes
  const handleFieldChange = (key: keyof SaleData) => {
    setNewRuleField(key);
    const config = getFieldConfig(key);
    if (config) {
      const ops = getOperatorsForType(config.type);
      setNewRuleOperator(ops[0]);
      setNewRuleValue(''); // Reset value
      
      // Smart default for Status
      if (config.type === 'select' && config.options) {
        setNewRuleValue(config.options[0]);
      }
    }
  };

  // -- Rule Engine Logic --

  const evaluateRule = (value: any, operator: AlertOperator, target: any): boolean => {
    if (value === null || value === undefined) return false;

    // Type casting for comparison
    const numValue = Number(value);
    const numTarget = Number(target);
    const strValue = String(value).toLowerCase();
    const strTarget = String(target).toLowerCase();

    switch (operator) {
      case AlertOperator.GREATER:
        return !isNaN(numValue) && !isNaN(numTarget) && numValue > numTarget;
      case AlertOperator.LESS:
        return !isNaN(numValue) && !isNaN(numTarget) && numValue < numTarget;
      case AlertOperator.EQUALS:
        // Loose equality for numbers in string format, exact for strings
        return String(value) === String(target);
      case AlertOperator.NOT_EQUALS:
        return String(value) !== String(target);
      case AlertOperator.CONTAINS:
        return strValue.includes(strTarget);
      default:
        return false;
    }
  };

  const determineSeverity = (field: keyof SaleData, operator: AlertOperator, value: any): Alert['severity'] => {
    // Heuristic for severity
    if (field === 'envioStatus' && (String(value) === ShippingStatus.RETURNED || String(value) === ShippingStatus.CANCELED)) return 'error';
    if (field === 'lucro' && operator === AlertOperator.GREATER) return 'success';
    if (field === 'lucro' && operator === AlertOperator.LESS && Number(value) < 0) return 'error';
    if (field === 'recebimentoDias' && operator === AlertOperator.GREATER) return 'warning';
    return 'warning'; // Default
  };

  const currentAlerts = useMemo(() => {
    const alerts: Alert[] = [];

    data.forEach(sale => {
      rules.forEach(rule => {
        if (!rule.active) return;
        
        const alertId = `${sale.id}-${rule.id}`;
        if (dismissedAlertIds.has(alertId)) return;

        const saleValue = sale[rule.field];
        const isTriggered = evaluateRule(saleValue, rule.operator, rule.value);

        if (isTriggered) {
          const fieldConfig = getFieldConfig(rule.field);
          const formattedValue = fieldConfig?.type === 'currency' ? formatCurrency(Number(saleValue)) : String(saleValue);
          
          alerts.push({
            id: alertId,
            ruleId: rule.id,
            saleId: sale.id,
            message: `${fieldConfig?.label}: ${formattedValue} (${rule.operator} ${rule.value}) - ${sale.nome}`,
            severity: determineSeverity(rule.field, rule.operator, rule.value),
            timestamp: new Date().toISOString(),
            isRead: readAlertIds.has(alertId),
            isDismissed: false
          });
        }
      });
    });

    return alerts;
  }, [data, rules, readAlertIds, dismissedAlertIds]);

  // -- Handlers --

  const handleSaveRule = () => {
    if (newRuleValue === '') {
      setValidationError("Defina um valor para a regra.");
      return;
    }

    const fieldConfig = getFieldConfig(newRuleField);
    const generatedName = newRuleName || `${fieldConfig?.label} ${newRuleOperator} ${newRuleValue}`;

    const ruleData: Omit<AlertRule, 'id'> = {
      name: generatedName,
      active: true,
      emailNotification: newRuleEmail,
      field: newRuleField,
      operator: newRuleOperator,
      value: fieldConfig?.type === 'number' || fieldConfig?.type === 'currency' ? Number(newRuleValue) : newRuleValue
    };

    if (editingRuleId) {
      // Update existing rule
      setRules(prev => prev.map(r => r.id === editingRuleId ? { ...r, ...ruleData } : r));
      setEditingRuleId(null);
    } else {
      // Create new rule
      const newRule: AlertRule = {
        id: Math.random().toString(36).substr(2, 9),
        ...ruleData
      };
      setRules([...rules, newRule]);
    }
    
    // Reset Form
    resetForm();
  };

  const resetForm = () => {
    setNewRuleValue('');
    setNewRuleName('');
    setValidationError(null);
    setNewRuleEmail(false);
    setEditingRuleId(null);
    handleFieldChange('lucro'); // Reset to default field
  };

  const startEditRule = (rule: AlertRule) => {
    setEditingRuleId(rule.id);
    setNewRuleField(rule.field);
    setNewRuleOperator(rule.operator);
    setNewRuleValue(String(rule.value));
    setNewRuleName(rule.name);
    setNewRuleEmail(rule.emailNotification);
    setValidationError(null);
  };

  const moveRule = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === rules.length - 1) return;

    const newRules = [...rules];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap
    [newRules[index], newRules[targetIndex]] = [newRules[targetIndex], newRules[index]];
    setRules(newRules);
  };

  const deleteRule = (id: string) => {
    if (window.confirm("Tem certeza que deseja remover esta regra?")) {
      setRules(rules.filter(r => r.id !== id));
      if (editingRuleId === id) resetForm();
    }
  };

  const handleDismiss = (alertId: string) => {
    const alertToDismiss = currentAlerts.find(a => a.id === alertId);
    if (alertToDismiss) {
      setAlertsHistory(prev => [...prev, { ...alertToDismiss, isDismissed: true, timestamp: new Date().toISOString() }]);
      setDismissedAlertIds(prev => new Set(prev).add(alertId));
      setSelectedAlertIds(prev => {
        const next = new Set(prev);
        next.delete(alertId);
        return next;
      });
    }
  };

  const handleBulkDismiss = () => {
    const alertsToDismiss = currentAlerts.filter(a => selectedAlertIds.has(a.id));
    if (alertsToDismiss.length === 0) return;

    const timestamp = new Date().toISOString();
    
    setAlertsHistory(prev => [
      ...prev,
      ...alertsToDismiss.map(a => ({ ...a, isDismissed: true, timestamp }))
    ]);
    
    setDismissedAlertIds(prev => {
      const next = new Set(prev);
      selectedAlertIds.forEach(id => next.add(id));
      return next;
    });
    
    setSelectedAlertIds(new Set());
  };

  const handleMarkAllRead = () => {
    const newReadIds = new Set(readAlertIds);
    currentAlerts.forEach(a => newReadIds.add(a.id));
    setReadAlertIds(newReadIds);
  };

  const toggleGroupExpand = (ruleId: string) => {
    setExpandedGroupIds(prev => {
      const next = new Set(prev);
      if (next.has(ruleId)) next.delete(ruleId);
      else next.add(ruleId);
      return next;
    });
  };

  const toggleSelectAlert = (id: string) => {
    setSelectedAlertIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectGroup = (alertIds: string[]) => {
    const allSelected = alertIds.every(id => selectedAlertIds.has(id));
    
    setSelectedAlertIds(prev => {
      const next = new Set(prev);
      if (allSelected) {
        alertIds.forEach(id => next.delete(id));
      } else {
        alertIds.forEach(id => next.add(id));
      }
      return next;
    });
  };

  // Group Alerts Logic
  const groupedAlerts = useMemo(() => {
    const grouped: Record<string, { ruleName: string, count: number, alerts: Alert[], severity: string }> = {};
    
    currentAlerts.forEach(alert => {
      const rule = rules.find(r => r.id === alert.ruleId);
      const ruleName = rule ? rule.name : 'Outros';
      
      if (!grouped[alert.ruleId]) {
        grouped[alert.ruleId] = { ruleName, count: 0, alerts: [], severity: alert.severity };
      }
      grouped[alert.ruleId].count++;
      grouped[alert.ruleId].alerts.push(alert);
    });

    // Sort alerts within groups by timestamp descending
    Object.values(grouped).forEach(g => {
        g.alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    });

    return Object.values(grouped);
  }, [currentAlerts, rules]);

  // Render Helpers
  const renderValueInput = () => {
    const config = getFieldConfig(newRuleField);
    if (!config) return null;

    if (config.type === 'select' && config.options) {
      return (
        <select
          value={newRuleValue}
          onChange={(e) => setNewRuleValue(e.target.value)}
          className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-500 rounded text-sm bg-white dark:bg-slate-600 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {config.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      );
    }

    return (
      <input
        type={config.type === 'number' || config.type === 'currency' ? 'number' : 'text'}
        value={newRuleValue}
        onChange={(e) => setNewRuleValue(e.target.value)}
        placeholder="Valor..."
        className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-500 rounded text-sm bg-white dark:bg-slate-600 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
      />
    );
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <XCircle className="text-red-500" size={20} />;
      case 'warning': return <AlertTriangle className="text-amber-500" size={20} />;
      case 'success': return <CheckCircle className="text-green-500" size={20} />;
      default: return <Bell className="text-blue-500" size={20} />;
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'error': return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'warning': return 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800';
      case 'success': return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      default: return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
    }
  };

  const unreadCount = currentAlerts.filter(a => !a.isRead).length;

  return (
    <div id="alerts-system" className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 mb-6 overflow-hidden transition-colors duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="text-slate-600 dark:text-slate-300" size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
          <h3 className="font-bold text-slate-800 dark:text-white">Central de Alertas</h3>
          
          <div className="flex bg-slate-200 dark:bg-slate-600 rounded-md p-1 ml-4">
             <button 
               onClick={() => { setViewHistory(false); setSelectedAlertIds(new Set()); }}
               className={`px-3 py-1 text-xs rounded-sm transition-all ${!viewHistory ? 'bg-white dark:bg-slate-500 shadow-sm font-medium' : 'text-slate-500 dark:text-slate-300'}`}
             >
               Ativos
             </button>
             <button 
               onClick={() => { setViewHistory(true); setSelectedAlertIds(new Set()); }}
               className={`px-3 py-1 text-xs rounded-sm transition-all ${viewHistory ? 'bg-white dark:bg-slate-500 shadow-sm font-medium' : 'text-slate-500 dark:text-slate-300'}`}
             >
               Histórico
             </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
           {unreadCount > 0 && !viewHistory && (
             <button 
               onClick={handleMarkAllRead}
               className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-medium"
             >
               <Check size={14} /> Marcar lidos
             </button>
           )}
           <button 
            onClick={() => setShowConfig(!showConfig)}
            className={`flex items-center gap-1 text-sm font-medium transition-colors ${showConfig || editingRuleId ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
          >
            <Settings size={16} />
            {showConfig ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Bulk Action Bar (Active only) */}
      {selectedAlertIds.size > 0 && !viewHistory && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 flex justify-between items-center border-b border-indigo-100 dark:border-indigo-800 animate-in slide-in-from-top-2">
          <span className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">
            {selectedAlertIds.size} alerta(s) selecionado(s)
          </span>
          <button 
            onClick={handleBulkDismiss}
            className="text-sm flex items-center gap-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-3 py-1 rounded hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm"
          >
            <Archive size={14} /> Arquivar Selecionados
          </button>
        </div>
      )}

      {/* Dynamic Rule Configuration Panel */}
      {(showConfig || editingRuleId) && (
        <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-800 animate-in slide-in-from-top-2">
          <h4 className="font-semibold text-sm text-indigo-900 dark:text-indigo-200 mb-3 flex items-center gap-2">
            <Filter size={16} /> {editingRuleId ? 'Editar Regra' : 'Configurar Nova Regra'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 bg-white dark:bg-slate-700 p-3 rounded-md border border-indigo-100 dark:border-slate-600 shadow-sm">
            
            {/* Field Selection */}
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-300 mb-1">Campo</label>
              <select 
                value={newRuleField}
                onChange={(e) => handleFieldChange(e.target.value as keyof SaleData)}
                className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-500 rounded text-sm bg-white dark:bg-slate-600 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {FIELD_DEFINITIONS.map(def => (
                  <option key={def.key} value={def.key}>{def.label}</option>
                ))}
              </select>
            </div>

            {/* Operator Selection */}
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-300 mb-1">Condição</label>
              <select 
                value={newRuleOperator}
                onChange={(e) => setNewRuleOperator(e.target.value as AlertOperator)}
                className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-500 rounded text-sm bg-white dark:bg-slate-600 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {getOperatorsForType(getFieldConfig(newRuleField)?.type || 'text').map(op => (
                   <option key={op} value={op}>{op}</option>
                ))}
              </select>
            </div>

            {/* Value Input */}
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-300 mb-1">Argumento / Valor</label>
              {renderValueInput()}
            </div>

            {/* Optional Name */}
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-300 mb-1">Nome da Regra (Opcional)</label>
              <input 
                type="text" 
                value={newRuleName}
                onChange={(e) => setNewRuleName(e.target.value)}
                placeholder="Ex: Lucro Crítico"
                className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-500 rounded text-sm bg-white dark:bg-slate-600 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          
           {validationError && (
            <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-xs mb-3 font-medium">
              <AlertCircle size={12} /> {validationError}
            </div>
          )}

           <div className="flex justify-between items-center">
             <div className="flex items-center gap-2">
               <input 
                type="checkbox" 
                id="emailNotif"
                checked={newRuleEmail}
                onChange={(e) => setNewRuleEmail(e.target.checked)}
                className="rounded text-indigo-600"
               />
               <label htmlFor="emailNotif" className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer">
                 <Mail size={14} /> Enviar E-mail
               </label>
             </div>
             
             <div className="flex gap-2">
               {editingRuleId && (
                 <button onClick={resetForm} className="bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200 px-3 py-1.5 rounded text-sm hover:bg-slate-300 dark:hover:bg-slate-500 flex items-center gap-1 shadow-sm transition-colors">
                    <X size={14} /> Cancelar
                 </button>
               )}
               <button onClick={handleSaveRule} className="bg-indigo-600 text-white px-4 py-1.5 rounded text-sm hover:bg-indigo-700 flex items-center gap-1 shadow-sm transition-colors">
                  {editingRuleId ? <Save size={14} /> : <Plus size={14} />}
                  {editingRuleId ? 'Salvar Alterações' : 'Adicionar Regra'}
               </button>
             </div>
           </div>
           
           <div className="mt-4 pt-3 border-t border-indigo-100 dark:border-indigo-800">
             <div className="flex justify-between items-center mb-2">
               <p className="text-xs font-semibold text-slate-500">Regras Ativas ({rules.length}):</p>
               <span className="text-[10px] text-slate-400">Arraste ou use setas para reordenar prioridade</span>
             </div>
             <div className="space-y-1">
               {rules.map((rule, index) => {
                  const fieldLabel = getFieldConfig(rule.field)?.label;
                  return (
                    <div key={rule.id} className={`flex justify-between items-center text-xs p-2 rounded border transition-colors ${editingRuleId === rule.id ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-700 ring-1 ring-indigo-300' : 'bg-white dark:bg-slate-700 border-slate-100 dark:border-slate-600'}`}>
                      <div className="flex items-center gap-2">
                        {/* Numeric Badge */}
                        <span className="w-5 h-5 flex items-center justify-center bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-300 rounded font-bold text-[10px]">
                          {index + 1}
                        </span>
                        
                        <div>
                          <span className="font-medium text-indigo-700 dark:text-indigo-300 block">{rule.name}</span>
                          <span className="text-slate-400 text-[10px]">({fieldLabel} {rule.operator} {rule.value})</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {/* Order Controls */}
                        <div className="flex flex-col mr-2">
                          <button 
                            onClick={() => moveRule(index, 'up')} 
                            disabled={index === 0}
                            className="text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400"
                          >
                            <ArrowUp size={10} />
                          </button>
                          <button 
                            onClick={() => moveRule(index, 'down')} 
                            disabled={index === rules.length - 1}
                            className="text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400"
                          >
                            <ArrowDown size={10} />
                          </button>
                        </div>

                        <button 
                          onClick={() => startEditRule(rule)} 
                          className="text-slate-400 hover:text-indigo-600 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-600"
                          title="Editar"
                        >
                          <Pencil size={12} />
                        </button>
                        <button 
                          onClick={() => deleteRule(rule.id)} 
                          className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-600"
                          title="Excluir"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
               })}
             </div>
           </div>
        </div>
      )}

      {/* Alerts Display Area */}
      <div className="max-h-80 overflow-y-auto custom-scrollbar">
        {viewHistory ? (
           // HISTORY VIEW
           <div className="divide-y divide-slate-100 dark:divide-slate-700">
             {alertsHistory.length === 0 ? (
               <div className="p-6 text-center text-slate-400 text-sm">Histórico vazio.</div>
             ) : (
               alertsHistory.map((alert, idx) => (
                 <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/50 flex gap-3 opacity-70">
                   <div className="mt-0.5">{getSeverityIcon(alert.severity)}</div>
                   <div>
                     <p className="text-sm text-slate-600 dark:text-slate-400">{alert.message}</p>
                     <p className="text-xs text-slate-400">Arquivado em {new Date(alert.timestamp).toLocaleTimeString()}</p>
                   </div>
                 </div>
               ))
             )}
           </div>
        ) : (
           // ACTIVE VIEW (GROUPED COLLAPSIBLE)
           <div>
             {groupedAlerts.length === 0 ? (
                <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                  <CheckCircle className="mx-auto mb-2 opacity-50" size={32} />
                  <p>Nenhum alerta ativo.</p>
                </div>
             ) : (
               groupedAlerts.map((group, idx) => {
                 const isExpanded = expandedGroupIds.has(group.alerts[0].ruleId);
                 const latestAlert = group.alerts[0]; // Already sorted by timestamp desc
                 const groupAlertIds = group.alerts.map(a => a.id);
                 const allSelected = groupAlertIds.length > 0 && groupAlertIds.every(id => selectedAlertIds.has(id));
                 const someSelected = groupAlertIds.some(id => selectedAlertIds.has(id));

                 return (
                   <div key={group.alerts[0].ruleId} className={`border-b border-slate-100 dark:border-slate-700 last:border-0`}>
                      {/* Group Header */}
                      <div 
                        className={`px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${getSeverityBg(group.severity)}`}
                        onClick={() => toggleGroupExpand(group.alerts[0].ruleId)}
                      >
                         <div className="flex items-center gap-3 overflow-hidden">
                           <div onClick={(e) => { e.stopPropagation(); toggleSelectGroup(groupAlertIds); }}>
                              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${allSelected ? 'bg-indigo-600 border-indigo-600' : someSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-500'}`}>
                                {allSelected && <Check size={12} className="text-white" />}
                                {someSelected && !allSelected && <div className="w-2 h-0.5 bg-white rounded-full" />}
                              </div>
                           </div>
                           
                           <div className="text-slate-500 dark:text-slate-400">
                             {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                           </div>
                           
                           {getSeverityIcon(group.severity)}
                           
                           <div className="flex items-baseline gap-2 overflow-hidden">
                              <span className="font-semibold text-sm text-slate-800 dark:text-white whitespace-nowrap">{group.ruleName}</span>
                              <span className="bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded-full text-xs font-bold shadow-sm">{group.count}</span>
                              <span className="text-xs text-slate-400 truncate hidden sm:inline-block">
                                 - {latestAlert.message}
                              </span>
                           </div>
                         </div>
                      </div>
                      
                      {/* Expanded Items */}
                      {isExpanded && (
                        <div className="bg-white dark:bg-slate-800">
                          {group.alerts.map(alert => (
                            <div key={alert.id} className={`pl-12 pr-4 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b border-slate-50 dark:border-slate-700/50 last:border-0 ${!alert.isRead ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
                               <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                 <div onClick={() => toggleSelectAlert(alert.id)} className="cursor-pointer">
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedAlertIds.has(alert.id) ? 'bg-indigo-600 border-indigo-600' : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-500'}`}>
                                      {selectedAlertIds.has(alert.id) && <Check size={12} className="text-white" />}
                                    </div>
                                 </div>
                                 <div className="text-sm text-slate-600 dark:text-slate-300 truncate">
                                    {alert.message}
                                    {!alert.isRead && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-blue-500"></span>}
                                 </div>
                               </div>
                               <button onClick={() => handleDismiss(alert.id)} className="text-slate-400 hover:text-slate-600 ml-2" title="Arquivar">
                                 <Archive size={14} />
                               </button>
                            </div>
                          ))}
                        </div>
                      )}
                   </div>
                 );
               })
             )}
           </div>
        )}
      </div>
    </div>
  );
};

export default AlertsSystem;