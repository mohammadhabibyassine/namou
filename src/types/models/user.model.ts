export interface UserRole {
  id: string;
  name: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  isActive: boolean;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  role: UserRole;
}

// User alias for general frontend usage
export type User = UserProfile;

export interface UserAddressRecord {
  id: string;
  label: string | null;
  recipientName: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string | null;
  postalCode: string;
  countryCode: string;
  phone: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressDto {
  label?: string | null;
  recipientName: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state?: string | null;
  postalCode: string;
  countryCode: string;
  phone?: string | null;
  isDefault?: boolean;
}

export interface UpdateAddressDto {
  label?: string | null;
  recipientName?: string;
  addressLine1?: string;
  addressLine2?: string | null;
  city?: string;
  state?: string | null;
  postalCode?: string;
  countryCode?: string;
  phone?: string | null;
  isDefault?: boolean;
}

export interface UpdateProfileDto {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
}
