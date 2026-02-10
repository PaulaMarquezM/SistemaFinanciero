import axios from "axios";

// Configuración base de Axios
export const financialApi = axios.create({
  baseURL: "http://127.0.0.1:8000/api/v1",
});

// ================= TYPES (Tipos de datos) =================

export interface AmortizationParams {
  principal: number;
  annual_rate: number;
  periods: number;
  method: 'frances' | 'aleman';
}

export interface ScheduleRow {
  period: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
}

export interface Customer {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  document_number?: string; 
}

export interface CustomerCreate {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  document_number?: string;
}

export interface CreditCreate extends AmortizationParams {
  customer_id: number;
  start_date?: string; 
  description?: string;
}

export interface CreditResponse extends CreditCreate {
  id: number;
  status: string;
  total_interest: number;
  total_amount: number;
  customer?: Customer;
}

// === TIPOS DE ACTIVOS (NUEVO) ===
export interface AssetDepreciationRow {
  period_number: number;
  period_date: string;
  depreciation_amount: number;
  accumulated_depreciation: number;
  book_value: number;
}

export interface Asset {
  id?: number;
  name: string;
  category: string;
  cost: number;
  residual_rate: number; // Ej: 0.10 para 10%
  useful_life_years: number;
  acquisition_date: string; // YYYY-MM-DD
  depreciations?: AssetDepreciationRow[]; // La tabla calculada
}

// ================= API CALLS (Llamadas al servidor) =================

// --- AMORTIZACIÓN Y CRÉDITOS ---

export const getAmortizationSchedule = async (params: AmortizationParams): Promise<ScheduleRow[]> => {
  const response = await financialApi.post('/amortization/calculate', params);
  return response.data.schedule;
};

export const createCredit = async (data: CreditCreate): Promise<CreditResponse> => {
  const response = await financialApi.post('/credits/create_with_schedule', data);
  return response.data;
};

export const getCredits = async (): Promise<CreditResponse[]> => {
  const response = await financialApi.get('/credits/');
  return response.data;
};

export const deleteCredit = async (id: number): Promise<void> => {
  await financialApi.delete(`/credits/${id}`);
};

// --- CLIENTES ---

export const getCustomers = async (): Promise<Customer[]> => {
  const response = await financialApi.get('/customers/');
  return response.data;
};

export const createCustomer = async (data: CustomerCreate | Customer): Promise<Customer> => {
  const response = await financialApi.post('/customers/', data);
  return response.data;
};

export const updateCustomer = async (id: number, data: Customer): Promise<Customer> => {
  const response = await financialApi.put(`/customers/${id}`, data);
  return response.data;
};

export const deleteCustomer = async (id: number): Promise<void> => {
  await financialApi.delete(`/customers/${id}`);
};

// --- COBRANZAS (Reportes) ---

export const getReceivables = async (year: number, month: number) => {
  const response = await financialApi.get(`/receivables/?year=${year}&month=${month}`);
  return response.data;
};

export const getReceivablesStats = async (year: number, month: number) => {
  const response = await financialApi.get(`/receivables/stats?year=${year}&month=${month}`);
  return response.data;
};

// --- ACTIVOS Y DEPRECIACIÓN (ESTO ES LO QUE TE FALTABA) ---

export const getAssets = async (): Promise<Asset[]> => {
  const response = await financialApi.get('/assets/');
  return response.data;
};

export const createAsset = async (data: Asset): Promise<Asset> => {
  const response = await financialApi.post('/assets/', data);
  return response.data;
};

export const deleteAsset = async (id: number): Promise<void> => {
  await financialApi.delete(`/assets/${id}`);
};

export const getAssetDepreciation = async (id: number) => {
  const response = await financialApi.get(`/assets/${id}/depreciation`);
  return response.data; // Retorna { schedule: [...] }
};