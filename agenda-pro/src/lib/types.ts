export type AppointmentStatus =
  | 'scheduled'   // Agendado
  | 'confirmed'   // Confirmado
  | 'in_progress' // Em Atendimento
  | 'completed'   // Concluído / Finalizado
  | 'cancelled'   // Cancelado
  | 'no_show'     // Falta
  | 'blocked';    // Bloqueio / Ausência

export type PaymentMethod =
  | 'pix'
  | 'dinheiro'
  | 'debito'
  | 'credito'
  | 'credito_cliente'
  | 'boleto'
  | 'transferencia'
  | 'outro';

export interface Service {
  id: string;
  name: string;
  description?: string;
  category: 'alongamento' | 'manutencao' | 'esmaltacao' | 'tradicional' | 'cuidados' | 'cursos' | 'bloqueio';
  durationMinutes: number; // e.g. 120 = 2h
  price: number; // e.g. 150.00
  commissionRate?: number; // e.g. 50%
  color?: string; // Cor para o bloco na agenda
  active: boolean;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  carrier?: string; // Operadora (Claro, Vivo, TIM, etc)
  birthDate?: string; // DD/MM/AAAA
  notes?: string;
  creditBalance: number; // Saldo de crédito da cliente
  createdAt: string;
  lastVisit?: string;
  nextExpectedReturn?: string; // Previsão de retorno (ex: +20 dias)
  totalSpent: number;
  totalVisits: number;
}

export interface AppointmentItem {
  serviceId: string;
  serviceName: string;
  price: number;
  durationMinutes: number;
  commission?: number;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  services: AppointmentItem[];
  totalPrice: number;
  status: AppointmentStatus;
  professionalName: string;
  notes?: string;
  nextReturnDate?: string; // Previsão de retorno
  paid: boolean;
  paymentId?: string;
  createdAt: string;
}

export interface PaymentItem {
  method: PaymentMethod;
  amount: number;
  installments?: number; // 1x, 2x, 3x...
  cardBrand?: string; // Visa, Master, Elo...
}

export interface SaleTransaction {
  id: string;
  appointmentId?: string;
  clientId?: string;
  clientName: string;
  clientPhone?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  discountType?: 'reais' | 'porcentagem';
  discountValue?: number;
  discount: number;
  total: number;
  payments: PaymentItem[];
  change: number; // Troco
  changeAsCredit?: boolean; // Se o troco foi convertido em crédito
  cashRegisterId?: string;
  destinationAccount?: string; // Banco, Cofre, Gaveta
  notes?: string;
  professionalName?: string;
}

export interface CashRegister {
  id: string;
  codeNumber: number; // Caixa #1, #2...
  openedAt: string; // YYYY-MM-DD HH:mm
  closedAt?: string;
  openedBy: string;
  closedBy?: string;
  status: 'open' | 'closed';
  destinationAccount?: string; // Banco, Cofre
  initialAmount: number; // Fundo de troco / Suprimento inicial
  salesTotal: number;
  expensesTotal: number;
  supplyTotal: number;
  bleedTotal: number; // Sangria
  finalExpectedAmount: number;
  finalRealAmount?: number;
  closingNotes?: string;
  movements: CashMovement[];
}

export interface CashMovement {
  id: string;
  type: 'suprimento' | 'sangria' | 'despesa' | 'venda';
  amount: number;
  method: PaymentMethod;
  description: string;
  category?: string;
  time: string;
  date: string;
  clientName?: string;
  saleId?: string;
}

export interface AnamnesisFicha {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  nailType: 'natural' | 'roída' | 'oleosa' | 'quebradiça' | 'seca' | 'outra';
  preferredShape: 'quadrada' | 'redonda' | 'almond' | 'bailarina' | 'stiletto';
  hasAllergies: boolean;
  allergyDetails?: string;
  usesMedications: boolean;
  medicationDetails?: string;
  hasDiabetes: boolean;
  hasFungusHistory: boolean;
  previousTechnique?: string;
  clientSignature?: string; // base64 data url
  photos?: string[];
  notes?: string;
}

export interface BusinessConfig {
  name: string;
  ownerName: string;
  phone: string;
  slug: string;
  instagram?: string;
  address?: string;
  openingTime: string;
  closingTime: string;
  intervalMinutes: number;
  workingDays: number[];
  destinationAccounts: string[]; // ['Banco', 'Cofre', 'Gaveta']
  expenseCategories: string[]; // ['Material de Trabalho', 'Vale Profissional', 'Alimentação', 'Outros']
  whatsappConfirmationTemplate: string;
  whatsappReminderTemplate: string;
  whatsappReceiptTemplate: string;
}
