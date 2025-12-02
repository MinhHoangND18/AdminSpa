import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { CreateCustomerDto, Customer, UpdateCustomerDto, CustomerResponse } from '@/types/customer';
import api from './axios';
// interface CustomerDetailResponse {
//   data: Customer;
// }
export interface CustomerStats {
  totalCustomers: number;
  newCustomers: number;
  regularCustomers: number;
  vipCustomers: number;
  totalRevenue: number;
}
interface CustomerStatsResponse {
  data: CustomerStats;
}

export const getCustomers = async (query: { [key: string]: string | number | boolean | undefined } = {}): Promise<CustomerResponse> => {

  const { data } = await api.get<CustomerResponse>(API_ENDPOINTS.CUSTOMERS, { params: query }); 
  return data; 
};
export const getCustomerStats = async (storeId?: number): Promise<CustomerStats> => {
  const { data } = await api.get<CustomerStatsResponse>(
    `${API_ENDPOINTS.CUSTOMERS}/statistics`,
    { params: { storeId } }
  );
  if (data && typeof data === 'object' && 'data' in data) {
    return (data as CustomerStatsResponse).data;
  }
  return data as CustomerStats;
};

export const getCustomer = async (id: number) => {
  const { data } = await api.get(`${API_ENDPOINTS.CUSTOMERS}/${id}`);
  return data;
};

export const createCustomer = async (customer: CreateCustomerDto) => {
  const { data } = await api.post(API_ENDPOINTS.CUSTOMERS, customer);
  return data;
};

export const updateCustomer = async (id: number, customer: UpdateCustomerDto) => {
  const { data } = await api.patch(`${API_ENDPOINTS.CUSTOMERS}/${id}`, customer);
  return data;
};

export const deleteCustomer = async (id: number) => {
  const { data } = await api.delete(`${API_ENDPOINTS.CUSTOMERS}/${id}`);
  return data;
};
