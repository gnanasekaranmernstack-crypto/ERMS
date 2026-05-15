import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  HiOutlineViewGrid, 
  HiOutlineClipboardList, 
  HiOutlineAcademicCap, 
  HiOutlineLogout,
  HiOutlineX,
  HiOutlineMenu,
  HiOutlineUserCircle,
  HiChevronDown,
  HiChevronRight
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ isOpen, toggleSidebar, isCollapsed, toggleCollapse }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});

  useEffect(() => {
    if (isOpen && window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const toggleMenu = (name) => {
    if (isCollapsed) {
      toggleCollapse(); // Expand sidebar if clicking a menu while collapsed
      setOpenMenus({ [name]: true });
    } else {
      setOpenMenus(prev => ({ ...prev, [name]: !prev[name] }));
    }
  };

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: HiOutlineViewGrid },
    { 
      name: 'Exams', 
      icon: HiOutlineClipboardList,
      subItems: [
        { name: 'Exam Time Table', path: '/exams/timetable' },
        { name: 'Semester Exam', path: '/exams/semester' },
        { name: 'Arrear Exam', path: '/exams/arrear' },
      ]
    },
    { 
      name: 'Results', 
      icon: HiOutlineAcademicCap,
      subItems: [
        { name: 'Semester Result', path: '/results/semester' },
        { name: 'Arrear Result', path: '/results/arrear' },
      ]
    },
    { name: 'Profile', path: '/profile', icon: HiOutlineUserCircle },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isChildActive = (subItems) => {
    return subItems.some(item => location.pathname === item.path);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside 
        onMouseEnter={() => {
          if (window.innerWidth >= 1024) {
            document.body.style.overflow = 'hidden';
          }
        }}
        onMouseLeave={() => {
          document.body.style.overflow = 'auto';
        }}
        className={`fixed top-0 left-0 h-full bg-primary z-50 transition-all duration-300 transform 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 flex flex-col
        ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <div>
              <h1 className="text-white text-2xl font-black tracking-tight leading-none">ERMS</h1>
              <p className="text-indigo-200 text-[10px] uppercase font-bold tracking-widest mt-1 whitespace-nowrap">Admin System</p>
            </div>
          )}
          
          <button 
            onClick={toggleSidebar} 
            className="lg:hidden text-white text-2xl"
          >
            <HiOutlineX />
          </button>
        </div>

        {/* Desktop Toggle Button */}
        <div className={`hidden lg:flex px-6 mb-4 ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
          <button 
            onClick={toggleCollapse}
            className={`flex items-center gap-3 p-2 rounded-lg text-indigo-200 hover:bg-white/10 hover:text-white transition-all duration-200
              ${isCollapsed ? 'justify-center' : ''}`}
          >
            <HiOutlineMenu className="text-xl" />
            {!isCollapsed && <span className="text-xs font-bold uppercase tracking-widest">Menu</span>}
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto scrollbar-hide">
          {menuItems.map((item) => {
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isMenuOpen = openMenus[item.name];
            const isActive = item.path ? location.pathname === item.path : isChildActive(item.subItems || []);

            return (
              <div key={item.name} className="space-y-1">
                {hasSubItems ? (
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 font-medium
                      ${isActive ? 'bg-white/10 text-white' : 'text-indigo-200 hover:bg-white/10 hover:text-white'}
                      ${isCollapsed ? 'justify-center px-0' : 'justify-between'}`}
                    title={isCollapsed ? item.name : ''}
                  >
                    <div className="flex items-center gap-4">
                      <item.icon className="text-xl flex-shrink-0" />
                      {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
                    </div>
                    {!isCollapsed && (
                      <div className="transition-transform duration-300">
                        {isMenuOpen ? <HiChevronDown /> : <HiChevronRight />}
                      </div>
                    )}
                  </button>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => 
                      `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 font-medium
                      ${isActive ? 'bg-white/20 text-white shadow-lg' : 'text-indigo-200 hover:bg-white/10 hover:text-white'}
                      ${isCollapsed ? 'justify-center px-0' : ''}`
                    }
                    onClick={() => isOpen && toggleSidebar()}
                    title={isCollapsed ? item.name : ''}
                  >
                    <item.icon className="text-xl flex-shrink-0" />
                    {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
                  </NavLink>
                )}

                {/* Submenu */}
                <AnimatePresence>
                  {hasSubItems && isMenuOpen && !isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pl-10 space-y-1"
                    >
                      {item.subItems.map((sub) => (
                        <NavLink
                          key={sub.name}
                          to={sub.path}
                          className={({ isActive }) => 
                            `block px-4 py-2 rounded-lg text-sm transition-all duration-200
                            ${isActive ? 'text-white font-bold' : 'text-indigo-300 hover:text-white hover:bg-white/5'}`
                          }
                          onClick={() => toggleSidebar()}
                        >
                          {sub.name}
                        </NavLink>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-4">
          {!isCollapsed && (
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold border border-white/20">
                {user?.name?.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-white text-sm font-bold truncate">{user?.name}</p>
                <p className="text-indigo-200 text-[10px] truncate">{user?.department}</p>
              </div>
            </div>
          )}
          
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-indigo-200 hover:bg-white/10 hover:text-white transition-all duration-300 font-medium
              ${isCollapsed ? 'justify-center px-0' : ''}`}
            title={isCollapsed ? 'Logout' : ''}
          >
            <HiOutlineLogout className="text-xl flex-shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
