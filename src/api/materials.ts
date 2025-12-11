/**
 * @file API endpoints, types, and functions for materials.
 */
import { API_ENDPOINTS } from './endpoints';

export interface ResponseResult {
  status: boolean;
  message?: string;
  data: ResMaterialsData[];
}
export interface ResMaterials {
  ID: number;
  MaterialName: string;
  Urlpath: string;
  Tags: string | null;
}
export interface ResMaterialGroup {
  ID: number;
  CategoryName: string;
  Info: ResMaterials[];
}

export interface ResMaterialsData {
  ID: number;
  CategoryName: string;
  Info: ResMaterialGroup[];
}

// 3. 建立一個專門用來擷取資料的函式
export const apiGetMaterials = async (options?: { authorization?: string }): Promise<ResponseResult> => {
  const response = await fetch(API_ENDPOINTS.GET_MATERIALS, {
    method: 'GET',
    headers: {
      Authorization: options?.authorization || ''
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch materials');
  }
  return response.json();
};