import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Home,
  Library,
  Zap,
  User,
  ChevronDown,
  Search,
  LogIn,
  UserPlus
} from 'lucide-react';
import DropdownMenu from './DropdownMenu';
import LoginModal from '@/components/auth/LoginModal';
import RegisterModal from '@/components/auth/RegisterModal';

export default function TopNav() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const navigate = useNavigate();

  // Check for logged in user on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }

    // Listen for login events
    const handleUserLoggedIn = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    };

    window.addEventListener('userLoggedIn', handleUserLoggedIn);
    return () => window.removeEventListener('userLoggedIn', handleUserLoggedIn);
  }, []);

  const handleDropdownToggle = (menuName) => {
    setActiveDropdown(activeDropdown === menuName ? null : menuName);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/fiches?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="bg-white/95 shadow-sm border-b border-gray-200 sticky top-0 z-50 backdrop-blur-md">
      <nav className="w-full">
        {/* Main Navigation Bar - Container with max-width */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px] gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
              <BookOpen className="w-8 h-8 text-blue-600 group-hover:text-blue-700 transition-colors" />
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                ECOS Platform
              </span>
            </Link>

            {/* Main Menu */}
            <div className="flex items-center gap-7">
              {/* Home */}
              <Link
                to="/"
                className="px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50/80 rounded-xl transition-all duration-200 flex items-center gap-2.5 font-medium"
              >
                <Home className="w-5 h-5" />
                <span className="hidden lg:inline">Accueil</span>
              </Link>

              {/* Ressources Dropdown (Stations SSP, Guides, Cas Cliniques) */}
              <div className="relative">
                <button
                  onClick={() => handleDropdownToggle('resources')}
                  className={`px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50/80 rounded-xl transition-all duration-200 flex items-center gap-2.5 font-medium ${
                    activeDropdown === 'resources' ? 'bg-blue-50/80 text-blue-600' : ''
                  }`}
                  aria-expanded={activeDropdown === 'resources'}
                  aria-haspopup="true"
                  aria-controls="resources-menu"
                >
                  <Library className="w-5 h-5" />
                  <span className="hidden lg:inline">Ressources</span>
                  <ChevronDown className={`w-4.5 h-4.5 transition-transform duration-200 ${
                    activeDropdown === 'resources' ? 'rotate-180' : ''
                  }`} />
                </button>
                {activeDropdown === 'resources' && (
                  <DropdownMenu
                    type="resources"
                    onClose={() => setActiveDropdown(null)}
                  />
                )}
              </div>

              {/* Générateur */}
              <Link
                to="/generate"
                className="px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50/80 rounded-xl transition-all duration-200 flex items-center gap-2.5 font-medium"
              >
                <Zap className="w-5 h-5" />
                <span className="hidden lg:inline">Générateur</span>
              </Link>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="relative hidden md:block flex-1 max-w-[420px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className="w-full h-11 pl-11 pr-4 border-[1.5px] border-gray-300 rounded-[10px] text-[15px] bg-gray-50 hover:bg-white hover:border-gray-400 focus:outline-none focus:ring-[3px] focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all duration-200 placeholder:text-gray-400"
                aria-label="Rechercher dans ECOS Platform"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </form>

            {/* Auth Buttons with Divider */}
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200 flex-shrink-0">
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => handleDropdownToggle('user')}
                      className="flex items-center gap-2.5 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200"
                      aria-expanded={activeDropdown === 'user'}
                      aria-haspopup="true"
                    >
                      <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="hidden xl:inline text-[15px] font-medium max-w-[120px] truncate">
                        {user.name || user.email?.split('@')[0] || 'Utilisateur'}
                      </span>
                      <ChevronDown className="w-4 h-4 hidden xl:block" />
                    </button>
                    {activeDropdown === 'user' && (
                      <DropdownMenu
                        type="user"
                        onClose={() => setActiveDropdown(null)}
                        user={user}
                        setUser={setUser}
                      />
                    )}
                  </div>
                ) : (
                  <>
                    {/* Connexion - Secondary Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowLoginModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 text-gray-600 font-medium text-[15px] border-[1.5px] border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50 rounded-lg transition-all duration-200"
                    >
                      <LogIn className="w-[18px] h-[18px]" />
                      <span className="hidden sm:inline">Connexion</span>
                    </button>

                    {/* S'inscrire - Primary CTA with Gradient */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowRegisterModal(true);
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 text-white font-semibold text-[15px] rounded-lg transition-all duration-200 shadow-[0_1px_3px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_12px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 active:translate-y-0"
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
                      }}
                    >
                      <UserPlus className="w-[18px] h-[18px]" />
                      <span>S'inscrire</span>
                    </button>
                  </>
                )}
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden pb-3 px-6">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une fiche, un cas..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </form>
          </div>
        </div>
      </nav>

      {/* Auth Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />

      {/* Backdrop when dropdown is open */}
      {activeDropdown && (
        <div
          className="fixed inset-0 bg-black bg-opacity-10 z-40"
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </header>
  );
}
