export type Role = 'admin' | 'agen' | 'user';

export interface Profile {
  id: string;
  email: string;
  role: Role;
  full_name: string | null;
  created_at: string;
}

export interface GasLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  stock: number;
  operating_hours: string;
  agen_id: string;
  created_at: string;
  updated_at: string;
}
