import { CategoryType, ListingPurpose, AdStatus, Listing } from './types';

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

export const MARKET_KEYWORDS: Record<string, { motors: string[], property: string[], tech: string[] }> = {
  'Pakistan': {
    motors: ['Used cars in Lahore', 'Used cars in Karachi', 'Suzuki Alto for sale', 'Honda Civic for sale', 'Toyota Corolla for sale', 'Bike for sale', 'Honda 125', 'Commercial vehicle', 'Truck for sale'],
    property: ['House for sale in Lahore', 'House for sale in Karachi', 'Flat for sale in Karachi', 'Plot for sale in Islamabad', 'Commercial plot', 'House for rent', 'Portion for rent'],
    tech: ['Mobile phones for sale', 'iPhone for sale', 'Used laptop', 'LED TV', 'Electronics for sale']
  },
  'India': {
    motors: ['Used cars in Delhi', 'Used cars in Mumbai', 'Second hand car in Delhi', 'Bike for sale in India', 'Car for sale in India'],
    property: ['Property for sale in Delhi', 'Flat for sale in Mumbai', 'Plot for sale in India', 'Commercial property in Delhi', 'House for rent Mumbai'],
    tech: ['Mobile phones for sale India', 'Used laptop for sale India']
  },
  'United Arab Emirates': {
    motors: ['Used cars for sale Dubai', 'Cars for sale direct owner', 'Car for rent in Dubai', 'Cars for sale in Sharjah'],
    property: ['Property for sale in Dubai', 'Apartment for sale in Dubai', 'Villa for sale in Dubai', 'Flat for rent in Dubai', 'Shop for sale in Dubai', 'Property for sale Abu Dhabi'],
    tech: ['Mobile phones for sale Dubai', 'Used electronics for sale UAE']
  },
  'Saudi Arabia': {
    motors: ['Cars for sale Saudi Arabia', 'Used cars in Riyadh'],
    property: ['Plot for sale Saudi Arabia', 'Property for sale in Riyadh'],
    tech: ['Mobile phones for sale Saudi Arabia']
  }
};

export const CITIES: Record<string, string[]> = {
  'Pakistan': [
    'Karachi', 'Lahore', 'Islamabad', 'Faisalabad', 'Rawalpindi', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
    'Sukkur', 'Bahawalpur', 'Sargodha', 'Larkana', 'Sheikhupura', 'Jhang', 'Rahim Yar Khan', 'Gujrat', 'Kasur', 'Mardan',
    'Mingora', 'Nawabshah', 'Sahiwal', 'Mirpur Khas', 'Okara', 'Mandi Bahauddin', 'Jacobabad', 'Jhelum', 'Khanewal', 'Muzaffargarh',
    'Abbottabad', 'Murree', 'Gwadar', 'Hub', 'Attock', 'Chakwal', 'Dera Ghazi Khan', 'Dera Ismail Khan', 'Gilgit', 'Skardu', 'Kotli', 'Mirpur'
  ],
  'India': [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Lucknow',
    'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad',
    'Ludhiana', 'Coimbatore', 'Agra', 'Madurai', 'Nashik', 'Vijayawada', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivli',
    'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad', 'Howrah', 'Gwalior', 'Jabalpur'
  ],
  'Saudi Arabia': [
    'Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Ta\'if', 'Tabuk', 'Buraidah', 'Khamis Mushait', 'Abha',
    'Al Khobar', 'Jubail', 'Ha\'il', 'Najran', 'Yanbu', 'Qatif', 'Al Kharj', 'Jizan', 'Al Bahah', 'Sakaka',
    'Al Mithnab', 'Al-Ula', 'Al-Wajh', 'Arar', 'Dumat al-Jandal', 'Gurayat', 'Hafar Al-Batin', 'Hofuf', 'Khafji', 'Zulfi',
    'Rafha', 'Ar Rass', 'Al-Muzahmiyya', 'Afif', 'Al-Hareeq', 'Dhurma'
  ],
  'United Arab Emirates': [
    // Added missing quote for 'Kalba'
    'Dubai', 'Abu Dhabi', 'Sharjah', 'Al Ain', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain', 'Khor Fakkan', 'Kalba',
    'Jebel Ali', 'Madinat Zayed', 'Ruwais', 'Liwa Oasis', 'Dhaid', 'Ghayathi', 'Ar-Rams', 'Dibba Al-Hisn', 'Hatta', 'Al Madam',
    'Masdar City', 'Khalifa City', 'Baniyas', 'Musaffah', 'Al Ruwais', 'Al Mirfa', 'Sweihan', 'Sila', 'Al Jazirah Al Hamra'
  ],
  'Qatar': [
    'Doha', 'Al Rayyan', 'Al Wakrah', 'Al Khor', 'Al Sheehaniya', 'Umm Salal Mohammed', 'Mesaieed', 'Madinat ash Shamal', 'Al Wukair', 'Lusail',
    'Fuwayrit', 'Dukhan', 'Ar-Ruways', 'Abu Az Zuluf', 'Al Ghuwariyah', 'Al Jumayliyah', 'Al Khawr', 'Al Khaysah', 'Al Thakhira', 'Simaisma',
    'Pearl Qatar', 'Education City', 'West Bay'
  ],
  'Kuwait': [
    'Kuwait City', 'Hawally', 'Salmiya', 'Al Farwaniyah', 'Al Fahahil', 'Al Jahra', 'Sabah Al-Salem', 'Mubarak Al-Kabeer', 'Mahboula', 'Jabriya',
    'Adan', 'Andalous', 'Ardiya', 'Bayan', 'Firdous', 'Granada', 'Jaber Al-Ali', 'Jaber Al-Ahmed', 'Mishref', 'Qurain', 'Rumaithiya', 'Salwa',
    'Funaitees', 'Egaila', 'Shuwaikh'
  ],
  'Oman': [
    'Muscat', 'Salalah', 'Seeb', 'Bawshar', 'Sohar', 'As Suwayq', 'Ibri', 'Saham', 'Rustaq', 'Nizwa',
    'Sur', 'Ibra', 'Bahla', 'Khasab', 'Barka', 'Al Khaburah', 'Ad Duqm', 'Al Buraimi', 'Al Hamra', 'Al Jazir', 'Al Kamil Wal Wafi', 'Al Mudhaibi',
    'Sinaw', 'Thumrait'
  ],
  'Bahrain': [
    'Manama', 'Riffa', 'Muharraq', 'Hamad Town', 'Aali', 'Isa Town', 'Sitra', 'Budaiya', 'Jidhafs', 'Al Hidd',
    'Adliya', 'Amwaj Islands', 'Bani Jamra', 'Busaiteen', 'Diraz', 'Galali', 'Janabiya', 'Malkiya', 'Saar', 'Sanad', 'Tubli', 'Zallaq',
    'Durrat Al Bahrain', 'Seef'
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
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800'],
    location: { country: 'Pakistan', city: 'Lahore', society: 'DHA Phase 6', lat: 31.4697, lng: 74.4474 },
    status: AdStatus.ACTIVE,
    userId: 'user_1',
    createdAt: new Date().toISOString(),
    featured: true,
    isVerified: true,
    contactEmail: 'sales@modernvilla.pk',
    contactPhone: '+92 300 1234567',
    whatsappNumber: '+92 300 1234567',
    details: { 
      propertyType: 'Villa', 
      area: '2 Kanal', 
      areaValue: 2, 
      bedrooms: 5, 
      bathrooms: 6, 
      year: 2024,
      length: 100, 
      width: 90 
    }
  },
  {
    id: 'VEH-DUBAI-G63',
    title: 'Mercedes-Benz G63 AMG Magno Edition',
    description: 'Factory matte finish, low mileage, full service history from Gargash Motors. Showroom condition.',
    price: 850000,
    currency: 'AED',
    category: CategoryType.VEHICLES,
    purpose: ListingPurpose.SALE,
    images: ['https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&q=80&w=800'],
    location: { country: 'United Arab Emirates', city: 'Dubai', society: 'Al Quoz', lat: 25.1593, lng: 55.2343 },
    status: AdStatus.ACTIVE,
    userId: 'user_2',
    createdAt: new Date().toISOString(),
    featured: true,
    isVerified: true,
    contactEmail: 'luxurycars@dubai.ae',
    contactPhone: '+971 50 1234567',
    whatsappNumber: '+971 50 1234567',
    details: { 
      make: 'Mercedes-Benz', 
      model: 'G63 AMG', 
      year: 2025, 
      mileage: 4500, 
      fuelType: 'Petrol', 
      transmission: 'Automatic' 
    }
  }
];