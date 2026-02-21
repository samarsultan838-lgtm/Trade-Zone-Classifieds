import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { LocationProvider, useLocation } from './contexts/LocationContext';
import ConnectionStatus from './components/ConnectionStatus';
import LocationSelector from './components/LocationSelector';
import AdminPanel from './pages/AdminPanel';
import HomePage from './pages/HomePage';
import ListingsPage from './pages/ListingsPage';
import ListingDetailPage from './pages/ListingDetailPage';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import { Menu, X, Globe, User, ChevronDown, Bell, Search } from 'lucide-react';

// Constants from your file
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { selectedCountry, selectedCity } = useLocation();

  useEffect(() => {
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
          <div className="flex items-center gap-4">
            {/* Location Selector */}
            <div className="hidden lg:block">
              <LocationSelector />
            </div>

            {/* Search Button */}
            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <Search className="w-5 h-5 text-gray-600" />
            </button>

            {/* Notifications */}
            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="relative group">
              <button className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-xl transition-colors">
                <User className="w-5 h-5 text-gray-600" />
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profile</Link>
                <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Dashboard</Link>
                <Link to="/messages" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Messages</Link>
                <hr className="my-2 border-gray-100" />
                <Link to="/admin" className="block px-4 py-2 text-sm text-emerald-600 hover:bg-gray-50">Admin Panel</Link>
                <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">Sign Out</button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Location Selector */}
        <div className="lg:hidden py-3 border-t border-gray-100">
          <LocationSelector />
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-in slide-in-from-top">
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
              <hr className="border-gray-100" />
              <Link
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
              >
                Profile
              </Link>
              <Link
                to="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/admin"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-2 text-emerald-600 hover:bg-gray-50 rounded-xl transition-colors"
              >
                Admin Panel
              </Link>
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
  const { selectedCountry } = useLocation();
  const currency = CURRENCIES[selectedCountry] || CURRENCIES['United Arab Emirates'];

  return (
    <footer className="bg-emerald-950 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-serif-italic mb-6">Trazot</h3>
            <p className="text-emerald-200 text-sm leading-relaxed">
              Your premier marketplace for trading goods and services across the Middle East and South Asia.
            </p>
            <div className="mt-4 flex items-center gap-2 text-emerald-300 text-sm">
              <Globe className="w-4 h-4" />
              <span>Operating in {Object.keys(COUNTRIES).length} countries</span>
            </div>
            <div className="mt-2 text-emerald-300 text-sm">
              <span>Current Region: {selectedCountry}</span>
              <span className="mx-2">•</span>
              <span>Currency: {currency.symbol} {currency.code}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-widest text-emerald-400">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-emerald-200 hover:text-white text-sm transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-emerald-200 hover:text-white text-sm transition-colors">Contact</Link></li>
              <li><Link to="/terms" className="text-emerald-200 hover:text-white text-sm transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-emerald-200 hover:text-white text-sm transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Countries */}
          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-widest text-emerald-400">Our Regions</h4>
            <ul className="grid grid-cols-2 gap-2">
              {Object.keys(COUNTRIES).slice(0, 6).map(country => (
                <li key={country}>
                  <Link 
                    to={`/listings?country=${encodeURIComponent(country)}`}
                    className="text-emerald-200 hover:text-white text-sm transition-colors"
                  >
                    {country}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-widest text-emerald-400">Contact Us</h4>
            <ul className="space-y-2 text-emerald-200 text-sm">
              <li>Email: support@trazot.com</li>
              <li>Phone: +971 4 123 4567</li>
              <li>Hours: 24/7 Support</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-emerald-800 mt-12 pt-8 text-center text-emerald-400 text-sm">
          <p>© {currentYear} Trazot. All rights reserved. | Made with ❤️ for the global trading community</p>
        </div>
      </div>
    </footer>
  );
};

// Main App Component
const AppContent: React.FC = () => {
  const { selectedCountry, selectedCity } = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ConnectionStatus />
      <Navigation />
      
      <main className="flex-grow pt-32 lg:pt-28">
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
          <Route path="/admin/*" element={<AdminPanel />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

// Wrapped App with Providers
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
