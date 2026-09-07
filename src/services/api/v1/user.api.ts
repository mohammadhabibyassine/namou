import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import {
  CreateAddressDto,
  UpdateAddressDto,
  UpdateProfileDto,
  UserAddressRecord,
  UserProfile,
} from "@/types/models/user.model";

export const getUserProfile = async (): Promise<UserProfile | null> => {
  const response = await apiClient.get<UserProfile | null>(
    API_ENDPOINTS.USERS.ME,
  );
  return response.data;
};

export const updateUserProfile = async (
  input: UpdateProfileDto,
): Promise<UserProfile> => {
  const response = await apiClient.patch<UserProfile>(
    API_ENDPOINTS.USERS.ME,
    input,
  );
  return response.data;
};

export const getUserAddresses = async (): Promise<UserAddressRecord[]> => {
  const response = await apiClient.get<UserAddressRecord[]>(
    API_ENDPOINTS.USERS.ADDRESSES,
  );
  return response.data;
};

export const createUserAddress = async (
  input: CreateAddressDto,
): Promise<UserAddressRecord> => {
  const response = await apiClient.post<UserAddressRecord>(
    API_ENDPOINTS.USERS.ADDRESSES,
    input,
  );
  return response.data;
};

export const updateUserAddress = async (
  addressId: string,
  input: UpdateAddressDto,
): Promise<UserAddressRecord> => {
  const response = await apiClient.patch<UserAddressRecord>(
    API_ENDPOINTS.USERS.ADDRESS_BY_ID(addressId),
    input,
  );
  return response.data;
};

export const deleteUserAddress = async (addressId: string): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.USERS.ADDRESS_BY_ID(addressId));
};
