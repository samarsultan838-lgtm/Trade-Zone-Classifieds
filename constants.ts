import { CategoryType, ListingPurpose, AdStatus, Listing } from './types.ts';

export const COUNTRIES = [
  'Pakistan', 
  'India', 
  'Saudi Arabia', 
  'United Arab Emirates', 
  'Qatar', 
  'Kuwait', 
  'Oman', 
  'Bahrain'
];

export const CITIES: Record<string, string[]> = {
  'Pakistan': [
    'Karachi', 'Lahore', 'Islamabad', 'Faisalabad', 'Rawalpindi', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
    'Sukkur', 'Bahawalpur', 'Sargodha', 'Larkana', 'Sheikhupura', 'Jhang', 'Rahim Yar Khan', 'Gujrat', 'Kasur', 'Mardan',
    'Mingora', 'Nawabshah', 'Sahiwal', 'Mirpur Khas', 'Okara', 'Mandi Bahauddin', 'Jacobabad', 'Jhelum', 'Khanewal', 'Muzaffargarh'
  ],
  'India': [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Lucknow',
    'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad',
    'Ludhiana', 'Coimbatore', 'Agra', 'Madurai', 'Nashik', 'Vijayawada', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivli'
  ],
  'Saudi Arabia': [
    'Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Ta\'if', 'Tabuk', 'Buraidah', 'Khamis Mushait', 'Abha',
    'Al Khobar', 'Jubail', 'Ha\'il', 'Najran', 'Yanbu', 'Qatif', 'Al Kharj', 'Jizan', 'Al Bahah', 'Sakaka',
    'Al Mithnab', 'Al-Ula', 'Al-Wajh', 'Arar', 'Dumat al-Jandal', 'Gurayat', 'Hafar Al-Batin', 'Hofuf', 'Khafji', 'Zulfi'
  ],
  'United Arab Emirates': [
    'Dubai', 'Abu Dhabi', 'Sharjah', 'Al Ain', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain', 'Khor Fakkan', 'Kalba',
    'Jebel Ali', 'Madinat Zayed', 'Ruwais', 'Liwa Oasis', 'Dhaid', 'Ghayathi', 'Ar-Rams', 'Dibba Al-Hisn', 'Hatta', 'Al Madam',
    'Masdar City', 'Khalifa City', 'Baniyas', 'Musaffah', 'Al Ruwais', 'Al Mirfa', 'Sweihan', 'Sila', 'Al Jazirah Al Hamra'
  ],
  'Qatar': [
    'Doha', 'Al Rayyan', 'Al Wakrah', 'Al Khor', 'Al Sheehaniya', 'Umm Salal Mohammed', 'Mesaieed', 'Madinat ash Shamal', 'Al Wukair', 'Lusail',
    'Fuwayrit', 'Dukhan', 'Ar-Ruways', 'Abu Az Zuluf', 'Al Ghuwariyah', 'Al Jumayliyah', 'Al Khawr', 'Al Khaysah', 'Al Thakhira', 'Simaisma'
  ],
  'Kuwait': [
    'Kuwait City', 'Hawally', 'Salmiya', 'Al Farwaniyah', 'Al Fahahil', 'Al Jahra', 'Sabah Al-Salem', 'Mubarak Al-Kabeer', 'Mahboula', 'Jabriya',
    'Adan', 'Andalous', 'Ardiya', 'Bayan', 'Firdous', 'Granada', 'Jaber Al-Ali', 'Jaber Al-Ahmed', 'Mishref', 'Qurain', 'Rumaithiya', 'Salwa'
  ],
  'Oman': [
    'Muscat', 'Salalah', 'Seeb', 'Bawshar', 'Sohar', 'As Suwayq', 'Ibri', 'Saham', 'Rustaq', 'Nizwa',
    'Sur', 'Ibra', 'Bahla', 'Khasab', 'Barka', 'Al Khaburah', 'Ad Duqm', 'Al Buraimi', 'Al Hamra', 'Al Jazir', 'Al Kamil Wal Wafi', 'Al Mudhaibi'
  ],
  'Bahrain': [
    'Manama', 'Riffa', 'Muharraq', 'Hamad Town', 'Aali', 'Isa Town', 'Sitra', 'Budaiya', 'Jidhafs', 'Al Hidd',
    'Adliya', 'Amwaj Islands', 'Bani Jamra', 'Busaiteen', 'Diraz', 'Galali', 'Janabiya', 'Malkiya', 'Saar', 'Sanad', 'Tubli', 'Zallaq'
  ]
};

export const INITIAL_LISTINGS: Listing[] = [
  {
    id: 'PRP-LAHOR-V1',
    title: 'Modern 2-Kanal Villa in DHA Phase 6',
    description: 'A luxurious residence featuring italian marble flooring, smart home automation, and a private infinity pool.',
    price: 185000000,
    currency: 'PKR',
    category: CategoryType.PROPERTIES,
    purpose: ListingPurpose.SALE,
    images: ['https://picsum.photos/seed/villa1/800/600'],
    location: { country: 'Pakistan', city: 'Lahore' },
    status: AdStatus.ACTIVE,
    userId: 'user_1',
    createdAt: new Date().toISOString(),
    featured: true,
    isVerified: true,
    contactEmail: 'sales@modernvilla.pk',
    contactPhone: '+92 300 1234567',
    whatsappNumber: '+92 300 1234567',
    details: { area: '2 Kanal', areaValue: 2, bedrooms: 5, bathrooms: 6, length: 100, width: 90 }
  },
  {
    id: 'VEH-DUBAI-G63',
    title: 'Mercedes-Benz G63 AMG Magno Edition',
    description: 'Factory matte finish, low mileage, full service history from Gargash Motors. Showroom condition.',
    price: 850000,
    currency: 'AED',
    category: CategoryType.VEHICLES,
    purpose: ListingPurpose.SALE,
    images: ['https://picsum.photos/seed/car1/800/600'],
    location: { country: 'United Arab Emirates', city: 'Dubai' },
    status: AdStatus.ACTIVE,
    userId: 'user_2',
    createdAt: new Date().toISOString(),
    featured: true,
    isVerified: true,
    contactEmail: 'luxurycars@dubai.ae',
    contactPhone: '+971 50 1234567',
    whatsappNumber: '+971 50 1234567',
    details: { make: 'Mercedes-Benz', model: 'G63 AMG', year: 2023, mileage: 4500, fuelType: 'Petrol', transmission: 'Automatic' }
  },
  {
    id: 'PRP-MUMBA-OFF1',
    title: 'Commercial Floor in Downtown Mumbai',
    description: 'Prime corporate space with 360-degree views of the sea link. High-speed elevators and 24/7 security.',
    price: 450000000,
    currency: 'INR',
    category: CategoryType.PROPERTIES,
    purpose: ListingPurpose.RENT,
    images: ['https://picsum.photos/seed/office1/800/600'],
    location: { country: 'India', city: 'Mumbai' },
    status: AdStatus.ACTIVE,
    userId: 'user_3',
    createdAt: new Date().toISOString(),
    featured: false,
    isVerified: true,
    contactEmail: 'corp@downtownmumbai.in',
    contactPhone: '+91 98765 43210',
    whatsappNumber: '+91 98765 43210',
    details: { area: '12,000 Sqft', areaValue: 12000, length: 120, width: 100 }
  }
];