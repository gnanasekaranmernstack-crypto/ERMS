import React from 'react';
import { HiOutlineMenuAlt2, HiOutlineLogout } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.includes('/exams')) return 'Exams';
    if (path.includes('/results')) return 'Results';
    if (path.includes('/profile')) return 'My Profile';
    return 'ERMS';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="lg:hidden text-2xl text-text-secondary hover:text-primary transition-colors">
          <HiOutlineMenuAlt2 />
        </button>
        <h2 className="text-xl font-bold text-text-primary hidden md:block tracking-tight">{getPageTitle()}</h2>
      </div>
      
      <div className="flex items-center gap-4">
        <div 
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1 rounded-xl transition-all duration-200 group"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">{user?.name}</p>
            <p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">{user?.department}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold shadow-md group-hover:scale-105 transition-all">
            {user?.name?.charAt(0)}
          </div>
        </div>
        
        <div className="h-6 w-px bg-gray-200"></div>
        
        <button 
          onClick={handleLogout}
          className="p-2 rounded-lg text-text-secondary hover:text-red-600 hover:bg-red-50 transition-all duration-300"
          title="Logout"
        >
          <HiOutlineLogout className="text-2xl" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
