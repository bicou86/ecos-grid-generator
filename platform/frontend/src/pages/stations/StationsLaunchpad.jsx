import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Stethoscope,
  Clock,
  Target,
  TrendingUp,
  PlayCircle,
  Shuffle,
  Plus,
  ArrowRight
} from 'lucide-react';

export default function StationsLaunchpad() {
  const [categories, setCategories] = useState([]);
  const [circuits, setCircuits] = useState([]);
  const [stats, setStats] = useState({
    totalStations: 294,
    completed: 0,
    avgScore: 0,
    studyTime: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesRes, circuitsRes] = await Promise.all([
        fetch('http://localhost:3000/api/v1/fiche-categories'),
        fetch('http://localhost:3000/api/v1/circuits?type=predefined')
      ]);

      const categoriesData = await categoriesRes.json();
      const circuitsData = await circuitsRes.json();

      if (categoriesData.success) {
        setCategories(categoriesData.data);
      }

      if (circuitsData.success) {
        setCircuits(circuitsData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-6">
              <Stethoscope className="w-5 h-5" />
              <span className="text-sm font-medium">Stations Standardisées Patient</span>
            </div>

            <h1 className="text-5xl font-bold mb-6">
              Maîtrisez vos ECOS avec 294 Stations
            </h1>

            <p className="text-xl text-blue-100 mb-8">
              Pratiquez vos compétences cliniques avec des stations authentiques,
              organisées par catégories et circuits d'apprentissage
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                to="/stations"
                className="btn-primary bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg inline-flex items-center gap-2"
              >
                <PlayCircle className="w-5 h-5" />
                Commencer une Station
              </Link>

              <Link
                to="/stations/random"
                className="bg-white/20 hover:bg-white/30 px-8 py-3 rounded-lg font-medium text-lg inline-flex items-center gap-2 transition-all"
              >
                <Shuffle className="w-5 h-5" />
                Station Aléatoire
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="container mx-auto px-4 -mt-8 mb-12">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-3">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stats.totalStations}
              </div>
              <div className="text-sm text-gray-600">Stations Disponibles</div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-3">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stats.completed}
              </div>
              <div className="text-sm text-gray-600">Stations Complétées</div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-3">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stats.avgScore}%
              </div>
              <div className="text-sm text-gray-600">Score Moyen</div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-3">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stats.studyTime}h
              </div>
              <div className="text-sm text-gray-600">Temps d'Étude</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        {/* Categories Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Explorer par Catégorie
              </h2>
              <p className="text-gray-600">
                Choisissez un type de station pour commencer votre pratique
              </p>
            </div>

            <Link
              to="/stations/categories"
              className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2"
            >
              Voir toutes
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                  <div className="h-12 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.slice(0, 6).map(category => (
                <Link
                  key={category.id}
                  to={`/stations/category/${category.id}`}
                  className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-500"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      {category.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {category.fiche_count} stations
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {category.description}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Circuits Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Circuits d'Apprentissage
              </h2>
              <p className="text-gray-600">
                Suivez des parcours structurés pour progresser efficacement
              </p>
            </div>

            <Link
              to="/stations/circuits"
              className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2"
            >
              Voir tous
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {circuits.slice(0, 4).map(circuit => {
                const difficultyColors = {
                  1: { bg: 'bg-green-100', text: 'text-green-700', label: 'Débutant' },
                  2: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Intermédiaire' },
                  3: { bg: 'bg-red-100', text: 'text-red-700', label: 'Avancé' }
                };
                const difficulty = difficultyColors[circuit.difficulty_level] || difficultyColors[2];

                return (
                  <Link
                    key={circuit.id}
                    to={`/stations/circuit/${circuit.id}`}
                    className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow border border-gray-200 hover:border-blue-500"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-xl text-gray-900 flex-1">
                        {circuit.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${difficulty.bg} ${difficulty.text}`}>
                        {difficulty.label}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {circuit.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        <span>{circuit.fiche_count} stations</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{circuit.total_duration} min</span>
                      </div>
                    </div>

                    <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                      <PlayCircle className="w-5 h-5" />
                      Commencer le Circuit
                    </button>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Create Custom Circuit */}
          <div className="mt-6">
            <Link
              to="/stations/circuit/create"
              className="block bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-6 hover:shadow-md transition-shadow border-2 border-dashed border-purple-300"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">
                    Créer un Circuit Personnalisé
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Composez votre propre parcours d'apprentissage avec vos stations préférées
                  </p>
                </div>
                <ArrowRight className="w-6 h-6 text-purple-600" />
              </div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
