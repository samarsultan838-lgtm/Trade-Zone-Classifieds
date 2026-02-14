import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Search, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize, 
  Filter, 
  ChevronDown, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  Home as HomeIcon
} from 'lucide-react';
import ListingCard from '../components/ListingCard.tsx';
import { storageService } from '../services/storageService.ts';
import { CategoryType, AdStatus, PropertyType } from '../types.ts';

const Homes: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [minBedrooms, setMinBedrooms] = useState<number | 'Any'>('Any');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('All');

  const residentialListings = useMemo(() => {
    return storageService.getListings().filter(l => {
      const isResidential = l.category === CategoryType.PROPERTIES;
      const matchesSearch = !searchQuery || 
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        l.location.city.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesBeds = minBedrooms === 'Any' || 
        (typeof l.details.bedrooms === 'number' && l.details.bedrooms >= Number(minBedrooms)) ||
        (typeof l.details.bedrooms === 'string' && !isNaN(parseInt(l.details.bedrooms)) && parseInt(l.details.bedrooms) >= Number(minBedrooms));

      const matchesType = propertyTypeFilter === 'All' || l.details.propertyType === propertyTypeFilter;

      return isResidential && l.status === AdStatus.ACTIVE && matchesSearch && matchesBeds && matchesType;
    });
  }, [searchQuery, minBedrooms, propertyTypeFilter]);

  const homeTypes = ['All', 'House', 'Flat', 'Penthouse', 'Farm House', 'Villa'];

  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-700">
      <section className="relative rounded-[40px] overflow-hidden bg-emerald-950 h-[380px] flex items-center justify-center text-center px-4">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover opacity-30 grayscale" alt="Luxury Home" />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/80 via-emerald-950/40 to-emerald-950" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-6xl font-serif-italic text-white mb-4 leading-tight">Find Your Dream <span className="text-emerald-500">Sanctuary.</span></h1>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 -mt-16 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {residentialListings.map(item => (
              <ListingCard key={item.id} listing={item} />
            ))}
        </div>
      </section>
    </div>
  );
};

export default Homes;