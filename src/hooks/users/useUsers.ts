import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createUserAddress,
  deleteUserAddress,
  getUserAddresses,
  getUserProfile,
  updateUserAddress,
  updateUserProfile,
} from "@/services/api/v1/user.api";
import {
  CreateAddressDto,
  UpdateAddressDto,
  UpdateProfileDto,
} from "@/types/models/user.model";
import { queryKeys } from "@/lib/query/keys";
import { useAuthStore } from "@/store";

export const USER_KEYS = {
  profile: queryKeys.profile,
  addresses: queryKeys.addresses,
};

export const useUserProfile = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setUser = useAuthStore((state) => state.setUser);

  return useQuery({
    queryKey: USER_KEYS.profile,
    queryFn: async () => {
      const profile = await getUserProfile();
      if (profile) setUser(profile);
      return profile;
    },
    enabled: isAuthenticated,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (input: UpdateProfileDto) => updateUserProfile(input),
    onSuccess: (updatedProfile) => {
      setUser(updatedProfile);
      queryClient.setQueryData(USER_KEYS.profile, updatedProfile);
    },
  });
};

export const useUserAddresses = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: USER_KEYS.addresses,
    queryFn: () => getUserAddresses(),
    enabled: isAuthenticated,
  });
};

export const useCreateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAddressDto) => createUserAddress(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.addresses });
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      addressId,
      input,
    }: {
      addressId: string;
      input: UpdateAddressDto;
    }) => updateUserAddress(addressId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.addresses });
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: string) => deleteUserAddress(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.addresses });
    },
  });
};
