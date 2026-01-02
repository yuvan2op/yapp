import axios from "axios";
import type { Item } from "../types";

const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json"
  }
});

export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get("/health");
    return response.status === 200;
  } catch {
    return false;
  }
};

export const getItems = async (): Promise<Item[]> => {
  const response = await apiClient.get<Item[]>("/items");
  return response.data;
};

export const createItem = async (
  title: string,
  description?: string
): Promise<Item> => {
  const response = await apiClient.post<Item>("/items", { title, description });
  return response.data;
};

export const deleteItem = async (id: string): Promise<void> => {
  await apiClient.delete(`/items/${id}`);
};

