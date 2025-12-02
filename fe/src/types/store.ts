
export interface Store {
  id: number;
  code: string;
  name: string;
  domain: string | null;
  address: string;
  phone: string | null;
  email: string | null;
  description: string | null;
  openingHours: string | null;
  latitude: number | null;
  longitude: number | null;
  manager_id: number | null;
  manager_name?: string | null;
  isActive: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoreFormData {
  code: string;
  name: string;
  domain: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  openingHours: string;
  latitude: string;
  longitude: string;
  manager_id: string;
  isActive: boolean;
}

export interface StoreResponse {
   data:{
    data: Store[];
    meta?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };

   } 
}