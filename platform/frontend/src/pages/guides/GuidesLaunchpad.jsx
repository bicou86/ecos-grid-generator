import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookMarked,
  Clock,
  TrendingUp,
  PlayCircle,
  Heart,
  ArrowRight,
  MessageCircle,
  Stethoscope,
  Activity,
  Search
} from 'lucide-react';
import { fichesAPI } from '@/services/api';

export default function GuidesLaunchpad() {
  const [stats, setStats] = useState({ total: 0, completed: 0, bookmarked: 0 });
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuidesData();
  }, []);

  const fetchGuidesData = async () => {
    try {
      const data = await fichesAPI.getAll({ fiche_type: 'skills', limit: 50 });

      if (data.success) {
        setGuides(data.data);
        setStats({
          total: data.data.length,
          completed: 12, // Mock data
          bookmarked: 5   // Mock data
        });
      }
    } catch (error) {
      console.error('Error fetching guides:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 1, name: 'Anamnèse', icon: '💬', color: '#3B82F6', count: 35 },
    { id: 2, name: 'Examen Clinique', icon: '🔍', color: '#10B981', count: 45 },
    { id: 3, name: 'Procédures', icon: '💉', color: '#EC4899', count: 28 },
    { id: 4, name: 'Communication', icon: '🗣️', color: '#F59E0B', count: 15 }
  ];

  const featuredGuides = guides.slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Maîtrisez les Compétences Cliniques
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              {stats.total} guides pratiques pour perfectionner vos techniques d'anamnèse, d'examen et de procédures
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/guides/list"
                className="px-8 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors inline-flex items-center gap-2"
              >
                Parcourir les Guides
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/guides/bookmarks"
                className="px-8 py-3 bg-blue-700 hover:bg-blue-800 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
              >
                <Heart className="w-5 h-5" />
                Mes Favoris
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
              <div className="p-3 bg-purple-100 rounded-lg">
                <BookMarked className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
                <p className="text-sm text-gray-600">Guides Disponibles</p>
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
                <p className="text-sm text-gray-600">Guides Étudiés</p>
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

      {/* Categories */}
      <div className="container mx-auto px-4 mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Explorer par Catégorie</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/guides/category/${category.id}`}
              className="bg-white rounded-lg p-6 hover:shadow-xl transition-all duration-200 border border-gray-200 group"
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-2xl mb-4"
                style={{ backgroundColor: category.color }}
              >
                {category.icon}
              </div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {category.name}
              </h3>
              <p className="text-sm text-gray-600">{category.count} guides</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Guides */}
      <div className="container mx-auto px-4 mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Guides Recommandés</h2>
          <Link
            to="/guides/list"
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
          >
            Voir tous les guides
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
            {featuredGuides.map((guide) => (
              <Link
                key={guide.id}
                to={`/fiches/${guide.slug}`}
                className="bg-white rounded-lg p-6 hover:shadow-xl transition-all duration-200 border border-gray-200 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg text-gray-900 flex-1 group-hover:text-blue-600 transition-colors">
                    {guide.title}
                  </h3>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{guide.estimated_duration || 10} min</span>
                  </div>
                </div>

                {guide.subtitle && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {guide.subtitle}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à Améliorer Vos Compétences?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Accédez à tous nos guides pratiques et devenez expert en techniques cliniques
          </p>
          <Link
            to="/guides/list"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            <PlayCircle className="w-5 h-5" />
            Commencer Maintenant
          </Link>
        </div>
      </div>
    </div>
  );
}
