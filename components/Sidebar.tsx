import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  PlusSquare, 
  Home, 
  Inbox, 
  Settings, 
  ShoppingBag, 
  ChevronDown, 
  ChevronUp,
  History,
  ShoppingCart,
  Zap,
  TrendingUp,
  Building2,
  MessageSquare,
  Globe
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  to?: string;
  active?: boolean;
  hasDropdown?: boolean;
  isOpen?: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, to, active, hasDropdown, isOpen, onClick }) => {
  const content = (
    <div 
      className={`flex items-center justify-between px-6 py-3 cursor-pointer transition-all duration-200 group ${
        active 
        ? 'bg-[#eaf7ed] text-[#17933f]' 
        : 'text-[#5f6368] hover:bg-gray-50 hover:text-[#17933f]'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className={`${active ? 'text-[#17933f]' : 'text-[#9aa0a6] group-hover:text-[#17933f]'}`}>
          {icon}
        </div>
        <span className={`text-[15px] font-medium ${active ? 'font-semibold' : ''}`}>
          {label}
        </span>
      </div>
      {hasDropdown && (isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
    </div>
  );

  return to ? <Link to={to} onClick={onClick}>{content}</Link> : content;
};

const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [listingsOpen, setListingsOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] lg:hidden" onClick={onClose} />
      )}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-white border-r border-gray-100 z-[70] transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static`}>
        <div className="flex flex-col h-full py-6">
          <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-hide">
            <SidebarItem icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" to="/" active={isActive('/')} onClick={onClose} />
            <SidebarItem icon={<Building2 className="w-5 h-5" />} label="Premium Homes" to="/homes" active={isActive('/homes')} onClick={onClose} />
            <SidebarItem icon={<Globe className="w-5 h-5" />} label="Institutional Services" to="/services" active={isActive('/services')} onClick={onClose} />
            <SidebarItem icon={<PlusSquare className="w-5 h-5" />} label="Post Listing" to="/post-ad" active={isActive('/post-ad')} onClick={onClose} />
            <SidebarItem icon={<MessageSquare className="w-5 h-5" />} label="Messages" to="/messages" active={isActive('/messages')} onClick={onClose} />
            <SidebarItem icon={<TrendingUp className="w-5 h-5" />} label="Advertise" to="/advertise" active={isActive('/advertise')} onClick={onClose} />
            <SidebarItem icon={<Zap className="w-5 h-5" />} label="Trazot Tools" to="/tools" active={isActive('/tools')} onClick={onClose} />
            <SidebarItem icon={<Home className="w-5 h-5" />} label="Workspace" to="/workspace" active={isActive('/workspace')} onClick={onClose} />
            <SidebarItem icon={<Inbox className="w-5 h-5" />} label="Market Intel" to="/news" active={isActive('/news')} onClick={onClose} />
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;