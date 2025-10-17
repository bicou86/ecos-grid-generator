import { Link } from 'react-router-dom';
import {
  MessageCircle,
  Search as SearchIcon,
  Stethoscope,
  Users,
  AlertCircle,
  Activity,
  BookOpen,
  BarChart,
  User,
  Settings,
  LogOut,
  Heart,
  History,
  ClipboardList,
  BookMarked
} from 'lucide-react';

const dropdownConfigs = {
  resources: {
    title: 'Ressources d\'Apprentissage',
    sections: [
      {
        title: 'Stations SSP',
        links: [
          { to: '/stations', icon: Stethoscope, label: 'Toutes les Stations', badge: '294' },
          { to: '/stations/categories', icon: MessageCircle, label: 'Par Catégorie' },
          { to: '/stations/circuits', icon: Activity, label: 'Circuits ECOS', badge: '8' },
        ]
      },
      {
        title: 'Guides Pratiques',
        links: [
          { to: '/guides', icon: BookMarked, label: 'Tous les Guides', badge: '118' },
          { to: '/fiches?type=skills', icon: BookOpen, label: 'Parcourir les Fiches' },
        ]
      },
      {
        title: 'Cas Cliniques',
        links: [
          { to: '/cases', icon: ClipboardList, label: 'Tous les Cas', badge: '134' },
          { to: '/catalog', icon: SearchIcon, label: 'Catalogue Complet' },
        ]
      }
    ]
  },
  stations: {
    title: 'Stations SSP',
    sections: [
      {
        title: 'Explorer',
        links: [
          { to: '/stations', icon: SearchIcon, label: 'Toutes les Stations', badge: '294' },
          { to: '/stations/categories', icon: MessageCircle, label: 'Par Catégorie' },
          { to: '/stations/circuits', icon: Activity, label: 'Circuits ECOS', badge: '8' },
        ]
      },
      {
        title: 'Personnel',
        links: [
          { to: '/stations/my-stations', icon: Heart, label: 'Mes Stations' },
          { to: '/stations/performance', icon: BarChart, label: 'Ma Performance' },
        ]
      }
    ]
  },
  guides: {
    title: 'Guides Cliniques',
    sections: [
      {
        title: 'Explorer',
        links: [
          { to: '/guides', icon: BookOpen, label: 'Tous les Guides', badge: '118' },
          { to: '/guides/anamnese', icon: MessageCircle, label: 'Anamnèse' },
          { to: '/guides/examen', icon: Stethoscope, label: 'Examen Clinique' },
          { to: '/guides/procedures', icon: Activity, label: 'Procédures' },
        ]
      },
      {
        title: 'Personnel',
        links: [
          { to: '/guides/bookmarks', icon: Heart, label: 'Guides Favoris' },
        ]
      }
    ]
  },
  cases: {
    title: 'Cas Cliniques',
    sections: [
      {
        title: 'Explorer',
        links: [
          { to: '/catalog', icon: SearchIcon, label: 'Tous les Cas', badge: '134' },
          { to: '/cases/mock-exams', icon: AlertCircle, label: 'Examens Blancs' },
          { to: '/cases/disciplines', icon: Users, label: 'Par Discipline' },
        ]
      },
      {
        title: 'Personnel',
        links: [
          { to: '/cases/my-cases', icon: Heart, label: 'Mes Cas' },
          { to: '/cases/performance', icon: BarChart, label: 'Ma Performance' },
        ]
      }
    ]
  },
  user: {
    title: 'Mon Compte',
    sections: [
      {
        links: [
          { to: '/dashboard', icon: BarChart, label: 'Tableau de Bord' },
          { to: '/dashboard/progress', icon: Activity, label: 'Ma Progression' },
          { to: '/dashboard/bookmarks', icon: Heart, label: 'Mes Favoris' },
          { to: '/dashboard/history', icon: History, label: 'Historique' },
        ]
      },
      {
        links: [
          { to: '/settings', icon: Settings, label: 'Paramètres' },
          { to: '/logout', icon: LogOut, label: 'Déconnexion' },
        ]
      }
    ]
  }
};

export default function DropdownMenu({ type, onClose, user, setUser }) {
  const config = dropdownConfigs[type];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (setUser) setUser(null);
    onClose();
    window.location.href = '/';
  };

  if (!config) return null;

  return (
    <div
      className="absolute md:top-full top-0 left-0 md:left-0 md:mt-2 w-full md:w-72 bg-white md:rounded-xl rounded-b-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[calc(100vh-100px)] md:max-h-[600px] overflow-y-auto"
      style={{
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 25px rgba(0, 0, 0, 0.1)'
      }}
      id={type === 'resources' ? 'resources-menu' : undefined}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="px-4 py-2 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">{config.title}</h3>
        {user && type === 'user' && (
          <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
        )}
      </div>

      {/* Sections */}
      {config.sections.map((section, sectionIdx) => (
        <div
          key={sectionIdx}
          className={sectionIdx > 0 ? 'border-t border-gray-100 mt-2 pt-2' : 'mt-2'}
        >
          {section.title && (
            <div className="px-4 py-2">
              <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                {section.title}
              </h4>
            </div>
          )}

          <div className="px-2">
            {section.links.map((link, linkIdx) => {
              const Icon = link.icon;

              // Special handling for logout
              if (link.to === '/logout') {
                return (
                  <button
                    key={linkIdx}
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-150"
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="flex-1 text-sm text-left font-medium">{link.label}</span>
                  </button>
                );
              }

              return (
                <Link
                  key={linkIdx}
                  to={link.to}
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-150"
                >
                  <Icon className="w-5 h-5 flex-shrink-0 text-gray-500" />
                  <span className="flex-1 text-sm font-medium">{link.label}</span>
                  {link.badge && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-600 rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
