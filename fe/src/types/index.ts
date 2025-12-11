export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface PagedData<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export * from "./service";
export * from "./service-category";
export * from "./user";
export * from "./invoice";
export * from "./invoice-item";
export * from "./customer";
export * from "./product";