import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Star, ChevronRight, Filter } from 'lucide-react';

export default function CategoryStationsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    difficulty: '',
    sort: 'title'
  });

  useEffect(() => {
    fetchCategoryData();
  }, [id, filters]);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);

      // Fetch category with its fiches
      const response = await fetch(`http://localhost:3000/api/v1/fiche-categories/${id}?limit=100`);
      const data = await response.json();

      if (data.success) {
        setCategory(data.data.category);
        let fetchedStations = data.data.fiches || [];

        // Apply difficulty filter
        if (filters.difficulty) {
          fetchedStations = fetchedStations.filter(
            s => s.difficulty_level === parseInt(filters.difficulty)
          );
        }

        // Apply sorting
        if (filters.sort === 'title') {
          fetchedStations.sort((a, b) => a.title.localeCompare(b.title));
        } else if (filters.sort === 'difficulty') {
          fetchedStations.sort((a, b) => (a.difficulty_level || 2) - (b.difficulty_level || 2));
        } else if (filters.sort === 'duration') {
          fetchedStations.sort((a, b) => (a.estimated_duration || 13) - (b.estimated_duration || 13));
        }

        setStations(fetchedStations);
      }
    } catch (error) {
      console.error('Error fetching category:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyBadge = (level) => {
    const badges = {
      1: { label: 'Débutant', class: 'bg-green-100 text-green-700' },
      2: { label: 'Intermédiaire', class: 'bg-yellow-100 text-yellow-700' },
      3: { label: 'Avancé', class: 'bg-red-100 text-red-700' }
    };
    return badges[level] || badges[2];
  };

  const getFrequencyStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < (rating || 3) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/stations')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour aux Stations
          </button>

          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-lg flex items-center justify-center text-white text-2xl"
              style={{ backgroundColor: category.color }}
            >
              {category.icon}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
              <p className="text-gray-600 mt-1">
                {stations.length} station{stations.length > 1 ? 's' : ''} {filters.difficulty ? 'trouvée' + (stations.length > 1 ? 's' : '') : 'disponible' + (stations.length > 1 ? 's' : '')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtres:</span>
            </div>

            <select
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Toutes difficultés</option>
              <option value="1">Débutant</option>
              <option value="2">Intermédiaire</option>
              <option value="3">Avancé</option>
            </select>

            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="title">Trier par: Titre</option>
              <option value="difficulty">Trier par: Difficulté</option>
              <option value="duration">Trier par: Durée</option>
            </select>

            {(filters.difficulty || filters.sort !== 'title') && (
              <button
                onClick={() => setFilters({ difficulty: '', sort: 'title' })}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stations Grid */}
      <div className="container mx-auto px-4 py-12">
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
        ) : stations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucune station trouvée
            </h3>
            <p className="text-gray-600">
              Essayez d'ajuster vos filtres ou explorez d'autres catégories
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stations.map((station) => {
              const difficulty = getDifficultyBadge(station.difficulty_level);

              return (
                <Link
                  key={station.id}
                  to={`/fiches/${station.slug}`}
                  className="bg-white rounded-lg p-6 hover:shadow-xl transition-all duration-200 border border-gray-200 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg text-gray-900 flex-1 group-hover:text-blue-600 transition-colors">
                      {station.title}
                    </h3>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficulty.class}`}>
                      {difficulty.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{station.estimated_duration || 13} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {getFrequencyStars(station.frequency_rating)}
                    </div>
                  </div>

                  {station.context_patient && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {station.context_patient}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
