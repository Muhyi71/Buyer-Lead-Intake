export type CityType = 'Chandigarh' | 'Mohali' | 'Zirakpur' | 'Panchkula' | 'Other';
export type PropertyType = 'Apartment' | 'Villa' | 'Plot' | 'Office' | 'Retail';
export type BhkType = '1' | '2' | '3' | '4' | 'Studio';
export type PurposeType = 'Buy' | 'Rent';
export type TimelineType = '0-3m' | '3-6m' | '>6m' | 'Exploring';
export type SourceType = 'Website' | 'Referral' | 'Walk-in' | 'Call' | 'Other';
export type StatusType = 'New' | 'Qualified' | 'Contacted' | 'Visited' | 'Negotiation' | 'Converted' | 'Dropped';

export interface Buyer {
  id: string;
  full_name: string;
  email?: string | null;
  phone: string;
  city: CityType;
  property_type: PropertyType;
  bhk?: BhkType | null;
  purpose: PurposeType;
  budget_min?: number | null;
  budget_max?: number | null;
  timeline: TimelineType;
  source: SourceType;
  status: StatusType;
  notes?: string | null;
  tags: string[];
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface BuyerHistory {
  id: string;
  buyer_id: string;
  changed_by: string;
  changed_at: string;
  diff: Record<string, { old: any; new: any }>;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name?: string | null;
  email?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BuyerFilters {
  city?: CityType;
  property_type?: PropertyType;
  status?: StatusType;
  timeline?: TimelineType;
  search?: string;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}