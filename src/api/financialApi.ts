import axios from "axios";

export const financialApi = axios.create({
  baseURL: "http://127.0.0.1:8000/api/v1",
});

// data we send to the backend
export interface AmortizationParams {
  principal: number;
  annual_rate: number;
  periods: number;
  method: 'frances' | 'aleman';
}

//shape of a single row in the response
export interface ScheduleRow {
  period: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
}

// API call
export const getAmortizationSchedule = async (params: AmortizationParams): Promise<ScheduleRow[]> => {
  const response = await financialApi.post('/amortization/calculate', params);
  return response.data.schedule;
};