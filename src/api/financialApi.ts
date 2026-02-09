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
  id: number;
  first_name: string;
  last_name: string;
  full_name?: string; // Agregado por si el backend manda nombre completo
  email?: string;
  phone?: string;
  address?: string;
}

export interface CustomerCreate {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
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

// 1. Calcular Amortización (Para el botón "Generar Tabla")
export const getAmortizationSchedule = async (params: AmortizationParams): Promise<ScheduleRow[]> => {
  // Nota: Asegúrate de tener el endpoint /amortization/calculate en tu backend.
  // Si no lo tienes, avísame para dártelo o usar cálculo local.
  const response = await financialApi.post('/amortization/calculate', params);
  return response.data.schedule;
};

// 2. Obtener Clientes (Para el Select "Vincular Cliente")
export const getCustomers = async (): Promise<Customer[]> => {
  const response = await financialApi.get('/customers/');
  return response.data;
};

// 3. Crear Cliente (Si tienes un formulario de registro)
export const createCustomer = async (data: CustomerCreate): Promise<Customer> => {
  const response = await financialApi.post('/customers/', data);
  return response.data;
};

// 4. Crear/Guardar Crédito (CORREGIDO EL ERROR 405 AQUÍ)
export const createCredit = async (data: CreditCreate): Promise<CreditResponse> => {
  // ANTES: post('/credits/', data) -> Esto daba error 405
  // AHORA: Apuntamos a la ruta específica que soporta Francés/Alemán
  const response = await financialApi.post('/credits/create_with_schedule', data);
  return response.data;
};

// 5. Listar Créditos (Para reportes)
export const getCredits = async (): Promise<CreditResponse[]> => {
  const response = await financialApi.get('/credits/');
  return response.data;
};

// 6. Eliminar Crédito
export const deleteCredit = async (id: number): Promise<void> => {
  await financialApi.delete(`/credits/${id}`);
};