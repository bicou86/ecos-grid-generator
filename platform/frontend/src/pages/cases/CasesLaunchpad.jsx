import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Clock,
  TrendingUp,
  PlayCircle,
  Heart,
  ArrowRight,
  Users,
  AlertCircle,
  Target,
  Award
} from 'lucide-react';
import { fichesAPI } from '@/services/api';

export default function CasesLaunchpad() {
  const [stats, setStats] = useState({ total: 0, completed: 0, bookmarked: 0 });
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCasesData();
  }, []);

  const fetchCasesData = async () => {
    try {
      const data = await fichesAPI.getAll({ fiche_type: 'dx', limit: 50 });

      if (data.success) {
        setCases(data.data);
        setStats({
          total: data.data.length,
          completed: 23, // Mock data
          bookmarked: 8   // Mock data
        });
      }
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const disciplines = [
    { id: 1, name: 'Médecine Interne', icon: '🏥', color: '#3B82F6', count: 42 },
    { id: 2, name: 'Cardiologie', icon: '❤️', color: '#EF4444', count: 18 },
    { id: 3, name: 'Neurologie', icon: '🧠', color: '#8B5CF6', count: 15 },
    { id: 4, name: 'Pédiatrie', icon: '👶', color: '#14B8A6', count: 12 },
    { id: 5, name: 'Psychiatrie', icon: '🧠', color: '#A855F7', count: 10 },
    { id: 6, name: 'Urgences', icon: '🚨', color: '#F59E0B', count: 25 }
  ];

  const featuredCases = cases.slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Cas Cliniques ECOS
            </h1>
            <p className="text-xl text-red-100 mb-8">
              {stats.total} cas cliniques complets pour maîtriser le raisonnement diagnostique et la prise en charge
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/catalog"
                className="px-8 py-3 bg-white text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors inline-flex items-center gap-2"
              >
                Parcourir les Cas
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/cases/my-cases"
                className="px-8 py-3 bg-red-700 hover:bg-red-800 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
              >
                <Heart className="w-5 h-5" />
                Mes Cas
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <ClipboardList className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
                <p className="text-sm text-gray-600">Cas Disponibles</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{stats.completed}</h3>
                <p className="text-sm text-gray-600">Cas Résolus</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-pink-100 rounded-lg">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{stats.bookmarked}</h3>
                <p className="text-sm text-gray-600">Favoris</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Disciplines */}
      <div className="container mx-auto px-4 mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Explorer par Discipline</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {disciplines.map((discipline) => (
            <Link
              key={discipline.id}
              to={`/cases/discipline/${discipline.id}`}
              className="bg-white rounded-lg p-6 hover:shadow-xl transition-all duration-200 border border-gray-200 group"
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-2xl mb-4"
                style={{ backgroundColor: discipline.color }}
              >
                {discipline.icon}
              </div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                {discipline.name}
              </h3>
              <p className="text-sm text-gray-600">{discipline.count} cas cliniques</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Cases */}
      <div className="container mx-auto px-4 mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Cas Cliniques Recommandés</h2>
          <Link
            to="/catalog"
            className="text-red-600 hover:text-red-700 flex items-center gap-2"
          >
            Voir tous les cas
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCases.map((caseItem) => (
              <Link
                key={caseItem.id}
                to={`/fiches/${caseItem.slug}`}
                className="bg-white rounded-lg p-6 hover:shadow-xl transition-all duration-200 border border-gray-200 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg text-gray-900 flex-1 group-hover:text-red-600 transition-colors">
                    {caseItem.title}
                  </h3>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{caseItem.estimated_duration || 15} min</span>
                  </div>
                </div>

                {caseItem.subtitle && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {caseItem.subtitle}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Practice Exams Section */}
      <div className="container mx-auto px-4 mb-12">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white rounded-lg">
              <Award className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Examens Blancs</h2>
              <p className="text-yellow-100">Simulez des conditions d'examen réelles</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <Link
              to="/cases/mock-exams"
              className="bg-white text-orange-600 rounded-lg p-4 hover:bg-yellow-50 transition-colors"
            >
              <h3 className="font-semibold mb-1">Examen Blanc Complet</h3>
              <p className="text-sm text-gray-600">12 cas cliniques • 3 heures</p>
            </Link>
            <Link
              to="/cases/mock-exams"
              className="bg-white text-orange-600 rounded-lg p-4 hover:bg-yellow-50 transition-colors"
            >
              <h3 className="font-semibold mb-1">Mini-Examen</h3>
              <p className="text-sm text-gray-600">5 cas cliniques • 1 heure</p>
            </Link>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à Résoudre des Cas Cliniques?</h2>
          <p className="text-xl text-red-100 mb-8">
            Développez votre raisonnement clinique avec nos cas complets et détaillés
          </p>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
          >
            <PlayCircle className="w-5 h-5" />
            Commencer Maintenant
          </Link>
        </div>
      </div>
    </div>
  );
}
