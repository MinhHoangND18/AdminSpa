export interface Product {
  id: number;
  name: string;
  price: number;
  quantity_stock: number;
  discount: number | null;
  created_at: string;
}

export interface QueryProductDto {
  page?: number;
  limit?: number;
  name?: string;
}

export interface PaginatedProducts {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}