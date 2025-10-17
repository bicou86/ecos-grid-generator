import { Outlet, Link } from 'react-router-dom';
import TopNav from '@/components/Navigation/TopNav';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* New Top Navigation */}
      <TopNav />

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">ECOS Platform</h3>
              <p className="text-gray-400">
                Plateforme de révision pour les examens cliniques objectifs structurés
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Liens utiles</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="/catalog" className="hover:text-white transition-colors">
                    Catalogue
                  </Link>
                </li>
                <li>
                  <Link to="/fiches" className="hover:text-white transition-colors">
                    Fiches de Révision
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="hover:text-white transition-colors">
                    Tarifs
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-white transition-colors">
                    À propos
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Contact</h3>
              <p className="text-gray-400">
                Email: contact@ecos-platform.com
              </p>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} ECOS Platform. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
