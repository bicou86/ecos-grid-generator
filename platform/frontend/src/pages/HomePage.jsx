import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, BookOpen, TrendingUp, Award, FileText, Star, ArrowRight } from 'lucide-react';
import { statsAPI, categoriesAPI, fichesAPI } from '../services/api';

export default function HomePage() {
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [fichesStats, setFichesStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, categoriesData, fichesData] = await Promise.all([
          statsAPI.getStats(),
          categoriesAPI.getAll(),
          fichesAPI.getStats(),
        ]);
        setStats(statsData.data);
        setCategories(categoriesData.data);
        setFichesStats(fichesData.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium" role="status" aria-live="polite">
            Chargement des données...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Cache Warning Banner - Only show if data is 0 */}
      {stats && stats.totalCases === 0 && (
        <div className="bg-yellow-500 text-white py-3 px-4">
          <div className="container-custom flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-bold">Problème de cache détecté</p>
                <p className="text-sm">Les données ne s'affichent pas à cause du cache du navigateur</p>
              </div>
            </div>
            <div className="text-sm">
              <p className="font-semibold mb-1">Solution rapide:</p>
              <p>Mac: <kbd className="bg-yellow-600 px-2 py-1 rounded">Cmd+Shift+R</kbd></p>
              <p>Windows: <kbd className="bg-yellow-600 px-2 py-1 rounded">Ctrl+Shift+R</kbd></p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="container-custom py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            ECOS Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Plateforme de révision pour les examens cliniques objectifs structurés
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              to="/catalog"
              className="btn-primary text-lg px-8 py-3 hover:scale-105 hover:shadow-xl transition-all duration-300 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
              aria-label="Explorer tous les cas cliniques disponibles"
            >
              Explorer les cas
            </Link>
            <Link
              to="/pricing"
              className="btn-outline text-lg px-8 py-3 hover:scale-105 hover:shadow-lg transition-all duration-300 focus:ring-4 focus:ring-gray-300 focus:ring-opacity-50"
              aria-label="Voir les tarifs et options d'abonnement"
            >
              Tarifs
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16" role="region" aria-label="Statistiques de la plateforme">
          <div className="card text-center hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer" role="article" aria-label="Nombre de cas cliniques">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center" aria-hidden="true">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h3 className="text-5xl font-bold bg-gradient-to-br from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">
              {stats?.totalCases || 0}
            </h3>
            <p className="text-gray-700 font-medium">Cas cliniques</p>
          </div>

          <div className="card text-center hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer" role="article" aria-label="Nombre de catégories">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center" aria-hidden="true">
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-5xl font-bold bg-gradient-to-br from-green-600 to-green-700 bg-clip-text text-transparent mb-2">
              {stats?.totalCategories || 0}
            </h3>
            <p className="text-gray-700 font-medium">Catégories</p>
          </div>

          <div className="card text-center hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer" role="article" aria-label="Nombre de spécialités">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center" aria-hidden="true">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <h3 className="text-5xl font-bold bg-gradient-to-br from-purple-600 to-purple-700 bg-clip-text text-transparent mb-2">
              {stats?.totalSpecialties || 0}
            </h3>
            <p className="text-gray-700 font-medium">Spécialités</p>
          </div>

          <div className="card text-center hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer" role="article" aria-label="Nombre de cas avancés">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center" aria-hidden="true">
                <Award className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <h3 className="text-5xl font-bold bg-gradient-to-br from-yellow-600 to-yellow-700 bg-clip-text text-transparent mb-2">
              {stats?.difficultyBreakdown?.advanced || 0}
            </h3>
            <p className="text-gray-700 font-medium">Cas avancés</p>
          </div>
        </div>

        {/* Categories Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Catégories disponibles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" role="list">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/catalog?category=${category.slug}`}
                className="group relative bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-transparent hover:shadow-xl transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
                style={{
                  borderLeftWidth: '4px',
                  borderLeftColor: category.color
                }}
                role="listitem"
                aria-label={`Catégorie ${category.name} avec ${category.case_count} cas cliniques`}
              >
                {/* Gradient overlay on hover */}
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                  style={{ backgroundColor: category.color }}
                />

                <div className="relative">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-800">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <span
                      className="text-lg font-bold"
                      style={{ color: category.color }}
                    >
                      {category.case_count} cas
                    </span>
                    <span className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Cas cliniques complets
            </h3>
            <p className="text-gray-600">
              Plus de 674 cas cliniques avec anamnèse, examen et management
            </p>
          </div>

          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Suivi de progression
            </h3>
            <p className="text-gray-600">
              Suivez votre évolution et identifiez vos points à améliorer
            </p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Contenu validé
            </h3>
            <p className="text-gray-600">
              Cas cliniques validés selon les standards ECOS
            </p>
          </div>
        </div>
      </div>

      {/* Fiches Section */}
      {fichesStats && (
        <div className="py-16 bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Fiches de Révision ECOS
              </h2>
              <p className="text-xl text-gray-600">
                {fichesStats.total_fiches} fiches synthétiques pour réviser efficacement
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-6 text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">{fichesStats.ssp_count}</div>
                <div className="text-gray-700 font-medium mb-1">SSP</div>
                <div className="text-sm text-gray-600">Situations cliniques</div>
              </div>

              <div className="bg-green-50 rounded-lg p-6 text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2">{fichesStats.dx_count}</div>
                <div className="text-gray-700 font-medium mb-1">Diagnostics</div>
                <div className="text-sm text-gray-600">Pathologies clés</div>
              </div>

              <div className="bg-purple-50 rounded-lg p-6 text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-2">{fichesStats.skills_count}</div>
                <div className="text-gray-700 font-medium mb-1">Skills</div>
                <div className="text-sm text-gray-600">Techniques médicales</div>
              </div>
            </div>

            <div className="text-center">
              <Link
                to="/fiches"
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
              >
                Accéder aux fiches
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
