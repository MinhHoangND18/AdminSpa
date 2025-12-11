import api from './axios';
import { Product, PaginatedProducts, QueryProductDto } from '@/types/product';
import { ApiResponse } from '@/types';

export const getProducts = async (
  params: QueryProductDto,
): Promise<PaginatedProducts> => {
  const response = await api.get<ApiResponse<PaginatedProducts>>('/products', {
    params,
  });
  return response.data.data;
};

export const getProduct = async (id: number): Promise<Product> => {
  const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
  return response.data.data;
};

export const createProduct = async (productData: Omit<Product, 'id' | 'created_at'>): Promise<Product> => {
  const response = await api.post<ApiResponse<Product>>('/products', productData);
  return response.data.data;
};

export const updateProduct = async (
  id: number,
  productData: Partial<Omit<Product, 'id' | 'created_at'>>,
): Promise<Product> => {
  const response = await api.patch<ApiResponse<Product>>(
    `/products/${id}`,
    productData,
  );
  return response.data.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await api.delete(`/products/${id}`);
};