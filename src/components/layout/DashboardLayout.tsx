import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, UserCog, FileText, Utensils, ClipboardList, SprayCan as Spray, Image, PackageSearch, PackagePlus, PackageMinus, Settings, Menu, X, Bell, LogOut, Search, ChevronDown, Heart, Wrench, Video, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../Logo';
import NotificationBell from '../notifications/NotificationBell';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, hasModuleAccess, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  // Define all navigation items with their permission requirements
  const allNavigationItems = [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: Home, 
      current: location.pathname === '/dashboard',
      module: 'Dashboard'
    },
    { 
      name: 'Case Paper', 
      path: '/casepaper', 
      icon: FileText, 
      current: location.pathname === '/casepaper',
      module: 'Case Management'
    },
    { 
      name: 'Helpline Call Record', 
      path: '/helpline', 
      icon: Phone, 
      current: location.pathname === '/helpline',
      module: 'Case Management'
    },
    {
      name: 'User Management',
      icon: Users,
      module: 'User Management',
      children: [
        { 
          name: 'Users', 
          path: '/users', 
          icon: Users, 
          current: location.pathname === '/users',
          module: 'User Management'
        },
        { 
          name: 'Roles', 
          path: '/roles', 
          icon: UserCog, 
          current: location.pathname === '/roles',
          module: 'Role Management'
        }
      ]
    },
    {
      name: 'Feeding',
      icon: Utensils,
      module: 'Animal Care',
      children: [
        { 
          name: 'Menu', 
          path: '/menu', 
          icon: Utensils, 
          current: location.pathname === '/menu',
          module: 'Animal Care'
        },
        { 
          name: 'Feeding Record', 
          path: '/feedingrecord', 
          icon: ClipboardList, 
          current: location.pathname === '/feedingrecord',
          module: 'Animal Care'
        }
      ]
    },
    { 
      name: 'Permanent Animals', 
      path: '/permanentanimals', 
      icon: Heart, 
      current: location.pathname === '/permanentanimals',
      module: 'Animal Care'
    },
    { 
      name: 'Cleaning', 
      path: '/cleaning', 
      icon: Spray, 
      current: location.pathname === '/cleaning',
      module: 'Facility Management'
    },
    {
      name: 'Media',
      icon: Image,
      module: 'Media Library',
      children: [
        { 
          name: 'General Media', 
          path: '/media', 
          icon: Image, 
          current: location.pathname === '/media',
          module: 'Media Library'
        },
        { 
          name: 'Special Events', 
          path: '/specialevents', 
          icon: Video, 
          current: location.pathname === '/specialevents',
          module: 'Media Library'
        }
      ]
    },
    {
      name: 'Inward/Outward',
      icon: PackageSearch,
      path: '/inventory',
      current: location.pathname === '/inventory',
      module: 'Inventory'
    },
    { 
      name: 'Maintenance', 
      path: '/maintenance', 
      icon: Wrench, 
      current: location.pathname === '/maintenance',
      module: 'Facility Management'
    },
    { 
      name: 'Settings', 
      path: '/settings', 
      icon: Settings, 
      current: location.pathname === '/settings',
      module: 'Dashboard'
    }
  ];

  // Filter navigation items based on user permissions
  const navigation = allNavigationItems.filter(item => {
    // Check if user has access to the main module
    if (!hasModuleAccess(item.module)) {
      return false;
    }

    // If item has children, filter them too
    if (item.children) {
      const accessibleChildren = item.children.filter(child => 
        hasModuleAccess(child.module)
      );
      
      // Only show parent if at least one child is accessible
      if (accessibleChildren.length > 0) {
        // Update the item with filtered children
        item.children = accessibleChildren;
        return true;
      }
      return false;
    }

    return true;
  });

  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuName) 
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    );
  };

  const renderMenuItem = (item: any) => {
    if (item.children) {
      const isExpanded = expandedMenus.includes(item.name);
      
      return (
        <div key={item.name}>
          <button
            onClick={() => toggleMenu(item.name)}
            className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-primary-50 hover:text-primary-700"
          >
            <item.icon className="h-5 w-5 text-gray-400 group-hover:text-primary-500 min-w-[20px] mr-3" />
                <span className="flex-1 text-left">{item.name}</span>
                <ChevronDown className={`h-4 w-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
          {isExpanded && (
            <div className="ml-8 space-y-1">
              {item.children.map((child: any) => (
                <button
                  key={child.name}
                  onClick={() => navigate(child.path)}
                  className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-primary-50 hover:text-primary-700"
                >
                  <child.icon className="h-4 w-4 text-gray-400 group-hover:text-primary-500 min-w-[16px] mr-3" />
                  {child.name}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        key={item.name}
        onClick={() => navigate(item.path)}
        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
          item.current
            ? 'bg-primary-50 text-primary-700'
            : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700'
        }`}
      >
        <item.icon className={`h-5 w-5 min-w-[20px] mr-3 ${
          item.current ? 'text-primary-500' : 'text-gray-400 group-hover:text-primary-500'
        }`} />
        {item.name}
      </button>
    );
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <Logo size="lg" />
            <button
              className="lg:hidden -mr-2 p-2 rounded-md text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={toggleSidebar}
            >
              <span className="sr-only">Close sidebar</span>
              <X className="h-6 w-6" />
            </button>
              </div>

          <div className="flex-1 overflow-y-auto">
            <nav className="px-2 py-4 space-y-1">
                {navigation.map(renderMenuItem)}
              </nav>
            </div>

          <div className="flex-shrink-0 p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-9 w-9 rounded-full bg-primary-100 text-primary-500 flex items-center justify-center">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  </div>
              <div className="ml-3">
                    <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                    <p className="text-xs font-medium text-gray-500 capitalize">{user?.role}</p>
              </div>
                    <div className="ml-auto flex items-center space-x-2">
                      <button 
                        onClick={() => navigate('/settings')}
                        className="p-1 rounded-full text-gray-400 hover:text-gray-500"
                        title="Settings"
                      >
                        <Settings size={16} />
                      </button>
                      <button 
                        onClick={logout}
                        className="p-1 rounded-full text-gray-400 hover:text-gray-500"
                        title="Logout"
                      >
                        <LogOut size={16} />
                      </button>
                    </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm lg:shadow-none z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
          <button
                  type="button"
                  className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
            onClick={toggleSidebar}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>
              </div>

              <div className="flex-1 px-4 flex items-center justify-between">
            <div className="flex-1 flex">
                  <div className="w-full max-w-lg lg:max-w-xs">
                    <label htmlFor="search" className="sr-only">Search</label>
                    <div className="relative text-gray-400 focus-within:text-gray-600">
                      <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                    <Search className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <input
                        id="search"
                        className="block w-full bg-white py-2 pl-10 pr-3 border border-gray-300 rounded-md leading-5 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Search"
                    type="search"
                  />
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <NotificationBell />
            </div>
          </div>
        </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
              </div>
            </div>
          </div>
          
          {/* Footer - Fixed at bottom */}
          <footer className="bg-white border-t border-gray-200 flex-shrink-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="text-center text-sm text-gray-600">
                Developed by <span className="font-semibold text-primary-600">VB Entreprise</span>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;