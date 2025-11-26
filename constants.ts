import { SaleData, ShippingStatus } from './types';

export const MOCK_SALES_DATA: SaleData[] = [
  {
    id: "AMZ-1001",
    nome: "Carlos Silva",
    cidade: "São Paulo, SP",
    envioStatus: ShippingStatus.DELIVERED,
    recebimentoClienteStatus: true,
    dataVenda: "2023-10-01",
    dataEnvio: "2023-10-02",
    dataRecebimento: "2023-10-05",
    recebimentoDias: 3,
    pontoEntrega: "Portaria",
    codigoRastreio: "BR123456789",
    valorVenda: 150.00,
    freteRecebido: 15.00,
    valorVendaMaisFrete: 165.00,
    valorCompra: 80.00,
    fretePago: 18.00,
    comissaoAmazon: 24.75, // approx 15%
    totalCustos: 122.75,
    lucro: 42.25,
    quantidade: 1,
    idProduto: "B08X1234",
    produto: "Fone de Ouvido Bluetooth",
    observacoes: "Cliente Prime"
  },
  {
    id: "AMZ-1002",
    nome: "Ana Souza",
    cidade: "Rio de Janeiro, RJ",
    envioStatus: ShippingStatus.SHIPPED,
    recebimentoClienteStatus: false,
    dataVenda: "2023-10-05",
    dataEnvio: "2023-10-06",
    dataRecebimento: null,
    recebimentoDias: null,
    pontoEntrega: "Em trânsito",
    codigoRastreio: "BR987654321",
    valorVenda: 2500.00,
    freteRecebido: 0.00,
    valorVendaMaisFrete: 2500.00,
    valorCompra: 1900.00,
    fretePago: 45.00,
    comissaoAmazon: 412.50,
    totalCustos: 2357.50,
    lucro: 142.50,
    quantidade: 1,
    idProduto: "B09Y5678",
    produto: "Monitor Gamer 27'",
    observacoes: "Envio frágil"
  },
  {
    id: "AMZ-1003",
    nome: "Marcos Oliveira",
    cidade: "Curitiba, PR",
    envioStatus: ShippingStatus.PROCESSING,
    recebimentoClienteStatus: false,
    dataVenda: "2023-10-08",
    dataEnvio: null,
    dataRecebimento: null,
    recebimentoDias: null,
    pontoEntrega: "Aguardando",
    codigoRastreio: "",
    valorVenda: 45.00,
    freteRecebido: 12.00,
    valorVendaMaisFrete: 57.00,
    valorCompra: 15.00,
    fretePago: 0.00,
    comissaoAmazon: 8.55,
    totalCustos: 23.55,
    lucro: 33.45,
    quantidade: 2,
    idProduto: "B07Z9012",
    produto: "Cabo USB-C 2m",
    observacoes: ""
  },
  {
    id: "AMZ-1004",
    nome: "Fernanda Lima",
    cidade: "Belo Horizonte, MG",
    envioStatus: ShippingStatus.PENDING,
    recebimentoClienteStatus: false,
    dataVenda: "2023-10-07",
    dataEnvio: null,
    dataRecebimento: null,
    recebimentoDias: null,
    pontoEntrega: "Aguardando coleta",
    codigoRastreio: "",
    valorVenda: 120.00,
    freteRecebido: 20.00,
    valorVendaMaisFrete: 140.00,
    valorCompra: 60.00,
    fretePago: 0.00, // Not shipped yet
    comissaoAmazon: 21.00,
    totalCustos: 81.00,
    lucro: 59.00, // Estimated
    quantidade: 1,
    idProduto: "B05A3456",
    produto: "Teclado Mecânico",
    observacoes: "Verificar estoque"
  },
  {
    id: "AMZ-1005",
    nome: "Roberto Santos",
    cidade: "Porto Alegre, RS",
    envioStatus: ShippingStatus.RETURNED,
    recebimentoClienteStatus: false,
    dataVenda: "2023-09-25",
    dataEnvio: "2023-09-26",
    dataRecebimento: null,
    recebimentoDias: null,
    pontoEntrega: "Devolvido ao remetente",
    codigoRastreio: "BR55667788",
    valorVenda: 300.00,
    freteRecebido: 0.00,
    valorVendaMaisFrete: 300.00,
    valorCompra: 150.00,
    fretePago: 25.00,
    comissaoAmazon: 45.00,
    totalCustos: 220.00,
    lucro: -25.00, // Loss due to return shipping
    quantidade: 1,
    idProduto: "B02C7890",
    produto: "Mochila Impermeável",
    observacoes: "Endereço não encontrado"
  }
];

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Generate Mock Price History
export const getMockPriceHistory = (basePrice: number) => {
  const history = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setMonth(today.getMonth() - i);
    // Random fluctuation +/- 15%
    const fluctuation = 1 + (Math.random() * 0.3 - 0.15); 
    history.push({
      date: date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
      price: basePrice * fluctuation
    });
  }
  return history;
};