export const COUNTRIES: Record<string, string[]> = {
  'Pakistan': ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad'],
  'India': ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'],
  'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah'],
  'Saudi Arabia': ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam'],
  'Qatar': ['Doha', 'Al Wakrah', 'Al Khor', 'Al Rayyan'],
  'Kuwait': ['Kuwait City', 'Hawalli', 'Salmiya', 'Farwaniya'],
  'Oman': ['Muscat', 'Salalah', 'Sohar', 'Nizwa'],
  'Bahrain': ['Manama', 'Riffa', 'Muharraq', 'Hamad Town']
};

export const CITIES = COUNTRIES;

export const COUNTRY_CODES: Record<string, string> = {
  'Pakistan': 'PK',
  'India': 'IN',
  'United Arab Emirates': 'AE',
  'Saudi Arabia': 'SA',
  'Qatar': 'QA',
  'Kuwait': 'KW',
  'Oman': 'OM',
  'Bahrain': 'BH'
};

export const CURRENCIES: Record<string, { code: string; symbol: string }> = {
  'Pakistan': { code: 'PKR', symbol: '₨' },
  'India': { code: 'INR', symbol: '₹' },
  'United Arab Emirates': { code: 'AED', symbol: 'د.إ' },
  'Saudi Arabia': { code: 'SAR', symbol: '﷼' },
  'Qatar': { code: 'QAR', symbol: '﷼' },
  'Kuwait': { code: 'KWD', symbol: 'د.ك' },
  'Oman': { code: 'OMR', symbol: '﷼' },
  'Bahrain': { code: 'BHD', symbol: '.د.ب' }
};
