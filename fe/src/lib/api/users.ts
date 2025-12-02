import api from "./axios";
import { User, UserFilters, UserResponse } from "@/types/user";

export const usersApi = {
  getAll: async (filters: UserFilters): Promise<UserResponse> => {
    const params: any = {};
    if (filters.search) params.search = filters.search;
    if (filters.role && filters.role !== "all") params.role = filters.role;

    if (filters.is_active !== undefined) {
      if (
        typeof filters.is_active === "boolean" ||
        typeof filters.is_active === "string"
      ) {
        params.is_active = filters.is_active.toString();
      } else {
      }
    }

    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;

    const response = await api.get<UserResponse>("/users", { params });
    return response.data;
  },

  getById: async (id: number): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  create: async (data: Partial<User>): Promise<User> => {
    const response = await api.post<User>("/users", data);
    return response.data;
  },

  update: async (id: number, data: Partial<User>): Promise<User> => {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  toggleLock: async (id: number, isLocked: boolean): Promise<void> => {
    await api.patch(`/users/${id}/${isLocked ? "lock" : "unlock"}`);
  },
};
