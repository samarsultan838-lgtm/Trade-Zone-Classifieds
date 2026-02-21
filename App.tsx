import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { LocationProvider, useLocation } from './contexts/LocationContext';
import ConnectionStatus from './components/ConnectionStatus';
import LocationSelector from './components/LocationSelector';

// Simple placeholder components to avoid missing imports
const HomePage = () => <div className="p-8 text-center">Home Page</div>;
const ListingsPage = () => <div className="p-8 text-center">Listings Page</div>;
const ListingDetailPage = () => {
  const params = useParams();
  return <div className="p-8 text-center">Listing Detail: {params.id}</div>;
};
const NewsPage = () => <div className="p-8 text-center">News Page</div>;
const NewsDetailPage = () => {
  const params = useParams();
  return <div className="p-8 text-center">News Detail: {params.id}</div>;
};
const AboutPage = () => <div className="p-8 text-center">About Page</div>;
const ContactPage = () => <div className="p-8 text-center">Contact Page</div>;
const TermsPage = () => <div className="p-8 text-center">Terms Page</div>;
const PrivacyPage = () => <div className="p-8 text-center">Privacy Page</div>;
const AdminPanel = () => <div className="p-8 text-center">Admin Panel</div>;

// Import necessary hooks
import { useParams } from 'react-router-dom';

// Constants
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

// Navigation Component
const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  
  // Safely use location context with fallback
  let selectedCountry = 'United Arab Emirates';
  let selectedCity = 'Dubai';
  
  try {
    const location = useLocation();
    selectedCountry = location.selectedCountry;
    selectedCity = location.selectedCity;
  } catch (e) {
    console.log('Location context not available yet');
  }

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Listings', path: '/listings' },
    { name: 'News', path: '/news' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-950 rounded-xl flex items-center justify-center text-white font-bold text-xl">
              T
            </div>
            <span className="text-xl font-serif-italic text-emerald-950 hidden sm:block">
              Trazot
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            <Link 
              to="/admin" 
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              Admin
            </Link>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Menu
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-3">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// Footer Component
const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  // Safely use location context with fallback
  let selectedCountry = 'United Arab Emirates';
  
  try {
    const location = useLocation();
    selectedCountry = location.selectedCountry;
  } catch (e) {
    console.log('Location context not available in footer yet');
  }
  
  const currency = CURRENCIES[selectedCountry] || CURRENCIES['United Arab Emirates'];

  return (
    <footer className="bg-emerald-950 text-white mt-20 py-8">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p>© {currentYear} Trazot. All rights reserved.</p>
        <p className="text-emerald-300 text-sm mt-2">
          Currency: {currency.symbol} {currency.code}
        </p>
      </div>
    </footer>
  );
};

// Main App Content
const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ConnectionStatus />
      <Navigation />
      
      <main className="flex-grow pt-24">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/listing/:id" element={<ListingDetailPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:id" element={<NewsDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/*" element={<AdminPanel />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <Router>
      <LocationProvider>
        <AppContent />
      </LocationProvider>
    </Router>
  );
};

export default App;
