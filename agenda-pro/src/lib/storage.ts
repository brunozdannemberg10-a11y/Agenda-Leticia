import {
  Service,
  Client,
  Appointment,
  CashRegister,
  AnamnesisFicha,
  BusinessConfig,
  SaleTransaction
} from './types';
import {
  initialConfig,
  initialServices,
  initialClients,
  getSampleAppointments,
  initialCashRegister,
  initialPastRegisters
} from './mock-data';

const STORAGE_KEYS = {
  CONFIG: 'agenda_pro_config_v2',
  SERVICES: 'agenda_pro_services_v2',
  CLIENTS: 'agenda_pro_clients_v2',
  APPOINTMENTS: 'agenda_pro_appointments_v2',
  CASH_REGISTER: 'agenda_pro_cash_register_v2',
  PAST_REGISTERS: 'agenda_pro_past_registers_v2',
  SALES: 'agenda_pro_sales_v2',
  ANAMNESIS: 'agenda_pro_anamnesis_v2',
};

function getStored<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
  }
}

// Config
export function loadConfig(): BusinessConfig {
  return getStored<BusinessConfig>(STORAGE_KEYS.CONFIG, initialConfig);
}
export function saveConfig(config: BusinessConfig): void {
  setStored(STORAGE_KEYS.CONFIG, config);
}

// Services
export function loadServices(): Service[] {
  return getStored<Service[]>(STORAGE_KEYS.SERVICES, initialServices);
}
export function saveServices(services: Service[]): void {
  setStored(STORAGE_KEYS.SERVICES, services);
}

// Clients
export function loadClients(): Client[] {
  return getStored<Client[]>(STORAGE_KEYS.CLIENTS, initialClients);
}
export function saveClients(clients: Client[]): void {
  setStored(STORAGE_KEYS.CLIENTS, clients);
}

// Appointments
export function loadAppointments(): Appointment[] {
  return getStored<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, getSampleAppointments());
}
export function saveAppointments(appointments: Appointment[]): void {
  setStored(STORAGE_KEYS.APPOINTMENTS, appointments);
}

// Cash Register
export function loadCashRegister(): CashRegister {
  return getStored<CashRegister>(STORAGE_KEYS.CASH_REGISTER, initialCashRegister);
}
export function saveCashRegister(register: CashRegister): void {
  setStored(STORAGE_KEYS.CASH_REGISTER, register);
}

// Past Registers
export function loadPastRegisters(): CashRegister[] {
  return getStored<CashRegister[]>(STORAGE_KEYS.PAST_REGISTERS, initialPastRegisters);
}
export function savePastRegisters(registers: CashRegister[]): void {
  setStored(STORAGE_KEYS.PAST_REGISTERS, registers);
}

// Sales
export function loadSales(): SaleTransaction[] {
  return getStored<SaleTransaction[]>(STORAGE_KEYS.SALES, []);
}
export function saveSales(sales: SaleTransaction[]): void {
  setStored(STORAGE_KEYS.SALES, sales);
}

// Anamnesis
export function loadAnamnesis(): AnamnesisFicha[] {
  return getStored<AnamnesisFicha[]>(STORAGE_KEYS.ANAMNESIS, []);
}
export function saveAnamnesis(fichas: AnamnesisFicha[]): void {
  setStored(STORAGE_KEYS.ANAMNESIS, fichas);
}
