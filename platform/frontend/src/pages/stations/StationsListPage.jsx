import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Clock,
  Target,
  Star,
  BookOpen,
  ChevronDown
} from 'lucide-react';

export default function StationsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [stations, setStations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    difficulty: searchParams.get('difficulty') || '',
    type: searchParams.get('type') || 'ssp'
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchStations();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/fiche-categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchStations = async () => {
    try {
      let url = `http://localhost:3000/api/v1/fiches?fiche_type=${filters.type}&limit=50`;

      if (filters.search) {
        url += `&search=${encodeURIComponent(filters.search)}`;
      }
      if (filters.difficulty) {
        url += `&difficulty_level=${filters.difficulty}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setStations(data.data);
      }
    } catch (error) {
      console.error('Error fetching stations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setFilters({ ...filters, search: e.target.value });
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setSearchParams({ ...filters, [key]: value });
  };

  const getDifficultyBadge = (level) => {
    const badges = {
      1: { label: 'Débutant', class: 'bg-green-100 text-green-700' },
      2: { label: 'Intermédiaire', class: 'bg-yellow-100 text-yellow-700' },
      3: { label: 'Avancé', class: 'bg-red-100 text-red-700' }
    };
    return badges[level] || badges[2];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Stations SSP
          </h1>
          <p className="text-gray-600">
            {stations.length} stations disponibles • Pratiquez vos compétences cliniques
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Filtres</h3>
                <button
                  onClick={() => setFilters({ search: '', category: '', difficulty: '', type: 'ssp' })}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Réinitialiser
                </button>
              </div>

              {/* Type Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ssp">Stations SSP</option>
                  <option value="skills">Guides</option>
                  <option value="dx">Cas Cliniques</option>
                </select>
              </div>

              {/* Difficulty Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulté
                </label>
                <div className="space-y-2">
                  {[
                    { value: '', label: 'Toutes' },
                    { value: '1', label: 'Débutant' },
                    { value: '2', label: 'Intermédiaire' },
                    { value: '3', label: 'Avancé' }
                  ].map(({ value, label }) => (
                    <label key={value} className="flex items-center">
                      <input
                        type="radio"
                        name="difficulty"
                        value={value}
                        checked={filters.difficulty === value}
                        onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégories
                </label>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleFilterChange('category', category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        filters.category === category.id
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span className="flex-1">{category.name}</span>
                        <span className="text-xs text-gray-500">{category.fiche_count}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={handleSearchChange}
                  placeholder="Rechercher une station, un symptôme, un diagnostic..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            )}

            {/* Stations Grid */}
            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stations.map((station) => {
                  const difficulty = getDifficultyBadge(station.difficulty_level);

                  return (
                    <Link
                      key={station.id}
                      to={`/fiches/${station.slug}`}
                      className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow border border-gray-200 hover:border-blue-500"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-lg text-gray-900 flex-1 line-clamp-2">
                          {station.title}
                        </h3>
                        {station.difficulty_level && (
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${difficulty.class}`}>
                            {difficulty.label}
                          </span>
                        )}
                      </div>

                      {station.subtitle && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {station.subtitle}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {station.estimated_duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{station.estimated_duration} min</span>
                          </div>
                        )}
                        {station.frequency_rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span>{station.frequency_rating}/5</span>
                          </div>
                        )}
                        {station.discipline && (
                          <div className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            <span className="truncate">{station.discipline}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Consulter la Station
                        </button>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Empty State */}
            {!loading && stations.length === 0 && (
              <div className="bg-white rounded-lg p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucune station trouvée
                </h3>
                <p className="text-gray-600 mb-4">
                  Essayez de modifier vos filtres de recherche
                </p>
                <button
                  onClick={() => setFilters({ search: '', category: '', difficulty: '', type: 'ssp' })}
                  className="btn-primary"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
