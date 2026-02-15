
export enum CategoryType {
  PROPERTIES = 'Properties',
  VEHICLES = 'Vehicles',
  ELECTRONICS = 'Electronics',
  GENERAL = 'General Items'
}

export enum ListingPurpose {
  SALE = 'For Sale',
  RENT = 'For Rent',
  WANTED = 'Wanted'
}

export enum PropertyType {
  HOUSE = 'House',
  FLAT = 'Flat',
  UPPER_PORTION = 'Upper Portion',
  LOWER_PORTION = 'Lower Portion',
  FARM_HOUSE = 'Farm House',
  ROOM = 'Room',
  PENTHOUSE = 'Penthouse',
  RESIDENTIAL_PLOT = 'Residential Plot',
  COMMERCIAL_PLOT = 'Commercial Plot',
  AGRICULTURAL_LAND = 'Agricultural Land',
  INDUSTRIAL_LAND = 'Industrial Land',
  PLOT_FILE = 'Plot File',
  PLOT_FORM = 'Plot Form',
  OFFICE = 'Office',
  SHOP = 'Shop',
  WAREHOUSE = 'Warehouse',
  FACTORY = 'Factory',
  BUILDING = 'Building',
  OTHER = 'Other'
}

export enum AreaUnit {
  SQFT = 'Square Feet',
  MARLA = 'Marla',
  KANAL = 'Kanal',
  ACRES = 'Acres'
}

export enum AdStatus {
  PENDING = 'Pending',
  ACTIVE = 'Active',
  REJECTED = 'Rejected',
  SOLD = 'Sold'
}

export interface Location {
  country: string;
  city: string;
  lat?: number;
  lng?: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  image: string;
  category: 'Market Trend' | 'Trade Zone News' | 'Expert Advice' | 'Tech Update';
  author: string;
  publishedAt: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: {
    category: CategoryType | 'All';
    purpose: ListingPurpose | 'All';
    country: string;
    city: string;
    searchQuery: string;
    isNearMeActive: boolean;
  };
  createdAt: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: CategoryType;
  purpose: ListingPurpose;
  images: string[];
  location: Location;
  status: AdStatus;
  userId: string;
  createdAt: string;
  featured: boolean;
  classification?: 'Free' | 'Basic' | 'Hot' | 'Super Hot';
  isVerified: boolean;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  details: {
    propertyType?: PropertyType | string;
    area?: string;
    areaValue?: number;
    areaUnit?: AreaUnit;
    length?: number;
    width?: number;
    bedrooms?: number | string;
    bathrooms?: number | string;
    year?: number;
    make?: string;
    model?: string;
    mileage?: number;
    fuelType?: string;
    transmission?: string;
    brand?: string;
    condition?: 'New' | 'Used';
    warranty?: boolean;
    bestFeatures?: string[];
    subCategory?: string;
    isReady?: boolean;
    isInstallment?: boolean;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isPremium: boolean;
  tier?: 'Free' | 'Starter' | 'Professional' | 'Elite';
  credits: number;
  joinedAt: string;
}

export interface AnalyticsData {
  date: string;
  revenue: number;
  listings: number;
}
