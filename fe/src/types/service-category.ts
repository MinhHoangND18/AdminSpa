
export type CategoryStatus = 'active' | 'inactive';

export interface ServiceCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  status: CategoryStatus;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceCategoryDto {
  name: string;
  slug?: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export type UpdateServiceCategoryDto = Partial<CreateServiceCategoryDto>;

export interface QueryServiceCategoryDto {
  search?: string;
  isActive?: boolean;
  sortByOrder?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedServiceCategories {
    data: ServiceCategory[];
    total: number;
    page: number;
    limit: number;
}
