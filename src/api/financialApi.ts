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
  document_number?: string; // IMPORTANTE: Debe coincidir con el backend
}

// Actualicé este para incluir document_number también
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
  start_date?: string; // YYYY-MM-DD
  description?: string;
}

export interface CreditResponse extends CreditCreate {
  id: number;
  status: string;
  total_interest: number;
  total_amount: number;
  customer?: Customer;
}

// ================= API CALLS (Llamadas al servidor) =================

// --- AMORTIZACIÓN Y CRÉDITOS ---

// 1. Calcular Amortización (Simulación)
export const getAmortizationSchedule = async (params: AmortizationParams): Promise<ScheduleRow[]> => {
  const response = await financialApi.post('/amortization/calculate', params);
  return response.data.schedule;
};

// 2. Crear/Guardar Crédito Real
export const createCredit = async (data: CreditCreate): Promise<CreditResponse> => {
  const response = await financialApi.post('/credits/create_with_schedule', data);
  return response.data;
};

// 3. Listar Créditos
export const getCredits = async (): Promise<CreditResponse[]> => {
  const response = await financialApi.get('/credits/');
  return response.data;
};

// 4. Eliminar Crédito
export const deleteCredit = async (id: number): Promise<void> => {
  await financialApi.delete(`/credits/${id}`);
};

// --- CLIENTES (Aquí estaban los faltantes) ---

// 5. Obtener Clientes
export const getCustomers = async (): Promise<Customer[]> => {
  const response = await financialApi.get('/customers/');
  return response.data;
};

// 6. Crear Cliente
export const createCustomer = async (data: CustomerCreate | Customer): Promise<Customer> => {
  const response = await financialApi.post('/customers/', data);
  return response.data;
};

// 7. Actualizar Cliente (NUEVO - Faltaba esto)
export const updateCustomer = async (id: number, data: Customer): Promise<Customer> => {
  const response = await financialApi.put(`/customers/${id}`, data);
  return response.data;
};

// 8. Eliminar Cliente (NUEVO - Faltaba esto)
export const deleteCustomer = async (id: number): Promise<void> => {
  await financialApi.delete(`/customers/${id}`);
};