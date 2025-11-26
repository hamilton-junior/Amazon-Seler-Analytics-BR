
export interface SaleData {
  id: string;
  nome: string;
  cidade: string;
  envioStatus: ShippingStatus;
  recebimentoClienteStatus: boolean;
  dataVenda: string;
  dataEnvio: string | null;
  dataRecebimento: string | null;
  recebimentoDias: number | null;
  pontoEntrega: string;
  codigoRastreio: string;
  valorVenda: number;
  freteRecebido: number;
  valorVendaMaisFrete: number; // V + F
  valorCompra: number;
  fretePago: number;
  comissaoAmazon: number;
  totalCustos: number; // V + F + C (Logic: Cost + ShipPaid + Commission)
  lucro: number;
  quantidade: number;
  idProduto: string; // ASIN or SKU
  produto: string;
  observacoes: string;
  hidden?: boolean;
  isHighlighted?: boolean;
  isMarked?: boolean;
}

export enum ShippingStatus {
  URGENT = 'Urgente',
  PROCESSING = 'Em Processamento',
  PENDING = 'Pendente',
  SHIPPED = 'Enviado',
  DELIVERED = 'Entregue',
  RETURNED = 'Devolvido',
  CANCELED = 'Cancelado'
}

export interface KPI {
  totalRevenue: number;
  totalProfit: number;
  totalOrders: number;
  averageMargin: number;
}

// --- New Alert System Types ---

export enum AlertOperator {
  GREATER = 'maior que',
  LESS = 'menor que',
  EQUALS = 'igual a',
  NOT_EQUALS = 'diferente de',
  CONTAINS = 'contém'
}

export interface AlertRule {
  id: string;
  name: string;
  active: boolean;
  emailNotification: boolean;
  // Dynamic Rule Configuration
  field: keyof SaleData;
  operator: AlertOperator;
  value: string | number | boolean;
}

export interface Alert {
  id: string;
  ruleId: string;
  saleId: string;
  message: string;
  severity: 'success' | 'warning' | 'error';
  timestamp: string;
  isRead: boolean;
  isDismissed: boolean;
}

// --- Filter Types ---

export interface FilterState {
  searchName: string;
  searchCity: string;
  searchProductId: string;
  status: string; // '' for all
  dateStart: string;
  dateEnd: string;
}
