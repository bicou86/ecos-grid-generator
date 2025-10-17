import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fichesAPI } from '../services/api';
import {
  Search,
  Filter,
  BookOpen,
  AlertCircle,
  Star,
  ChevronRight,
  Stethoscope,
  Brain,
  Activity
} from 'lucide-react';

export default function FichesListPage() {
  const [fiches, setFiches] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState('');
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const ficheTypes = [
    { value: '', label: 'Tous les types', icon: BookOpen },
    { value: 'ssp', label: 'SSP (Situations)', icon: Stethoscope },
    { value: 'skills', label: 'Skills (Techniques)', icon: Brain },
    { value: 'dx', label: 'Dx (Diagnostics)', icon: Activity }
  ];

  // Fetch stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fichesAPI.getStats();
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  // Fetch fiches with filters
  useEffect(() => {
    const fetchFiches = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: 20
        };

        if (searchQuery) params.search = searchQuery;
        if (selectedType) params.type = selectedType;
        if (selectedDiscipline) params.discipline = selectedDiscipline;
        if (urgentOnly) params.urgent_only = 'true';

        const response = await fichesAPI.getAll(params);
        setFiches(response.data);
        setPagination(response.pagination);
      } catch (error) {
        console.error('Error fetching fiches:', error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timer = setTimeout(() => {
      fetchFiches();
    }, 300);

    return () => clearTimeout(timer);
  }, [currentPage, searchQuery, selectedType, selectedDiscipline, urgentOnly]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedType, selectedDiscipline, urgentOnly]);

  const getTypeIcon = (type) => {
    const typeConfig = ficheTypes.find(t => t.value === type);
    const Icon = typeConfig?.icon || BookOpen;
    return <Icon className="w-4 h-4" />;
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'ssp': return 'bg-blue-100 text-blue-700';
      case 'skills': return 'bg-purple-100 text-purple-700';
      case 'dx': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const renderFrequencyStars = (rating) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Fiches de Révision ECOS
              </h1>
              <p className="text-gray-600">
                Fiches synthétiques pour réviser efficacement les stations ECOS
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{stats.total_fiches}</div>
                <div className="text-sm text-blue-700">Total Fiches</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">{stats.ssp_count}</div>
                <div className="text-sm text-purple-700">SSP</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">{stats.dx_count}</div>
                <div className="text-sm text-green-700">Diagnostics</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600">{stats.urgent_count}</div>
                <div className="text-sm text-red-700">Urgences</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher dans les fiches (titre, contenu)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3 mb-4">
            {ficheTypes.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setSelectedType(value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  selectedType === value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Additional Filters */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setUrgentOnly(!urgentOnly)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                urgentOnly
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-red-300'
              }`}
            >
              <AlertCircle className="w-4 h-4" />
              Urgences uniquement
            </button>
          </div>

          {/* Active Filters Summary */}
          {(searchQuery || selectedType || urgentOnly) && (
            <div className="mt-4 pt-4 border-t flex items-center gap-2 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              <span>Filtres actifs:</span>
              {searchQuery && <span className="px-2 py-1 bg-gray-100 rounded">Recherche: "{searchQuery}"</span>}
              {selectedType && <span className="px-2 py-1 bg-gray-100 rounded">Type: {ficheTypes.find(t => t.value === selectedType)?.label}</span>}
              {urgentOnly && <span className="px-2 py-1 bg-red-100 text-red-700 rounded">Urgences</span>}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('');
                  setUrgentOnly(false);
                }}
                className="ml-auto text-blue-600 hover:text-blue-800"
              >
                Réinitialiser
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Chargement des fiches...</p>
          </div>
        ) : fiches.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucune fiche trouvée avec ces critères</p>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-4 text-sm text-gray-600">
              {pagination && (
                <span>
                  Affichage {((currentPage - 1) * pagination.limit) + 1} - {Math.min(currentPage * pagination.limit, pagination.total)} sur {pagination.total} fiches
                </span>
              )}
            </div>

            {/* Fiches Grid */}
            <div className="grid gap-4 mb-8">
              {fiches.map((fiche) => (
                <Link
                  key={fiche.id}
                  to={`/fiches/${fiche.slug}`}
                  className="bg-white rounded-lg border hover:border-blue-300 hover:shadow-md transition-all p-6 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {getTypeIcon(fiche.fiche_type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {fiche.title}
                        </h3>
                        {fiche.subtitle && (
                          <p className="text-sm text-gray-600 mt-1">{fiche.subtitle}</p>
                        )}
                        {fiche.description && (
                          <p className="text-sm text-gray-600 mt-2">{fiche.description}</p>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Type Badge */}
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(fiche.fiche_type)}`}>
                      {getTypeIcon(fiche.fiche_type)}
                      {fiche.fiche_type.toUpperCase()}
                    </span>

                    {/* Discipline */}
                    {fiche.discipline && (
                      <span className="text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                        {fiche.discipline}
                      </span>
                    )}

                    {/* Urgent Badge */}
                    {fiche.is_urgent && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        <AlertCircle className="w-3 h-3" />
                        Urgence
                      </span>
                    )}

                    {/* Frequency Rating */}
                    {fiche.frequency_rating && (
                      <div className="flex items-center gap-1">
                        {renderFrequencyStars(fiche.frequency_rating)}
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="ml-auto text-xs text-gray-500 flex items-center gap-3">
                      {fiche.section_count > 0 && (
                        <span>{fiche.section_count} sections</span>
                      )}
                      {fiche.tag_count > 0 && (
                        <span>{fiche.tag_count} tags</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Précédent
                </button>

                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                    const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                    if (pageNum > pagination.pages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={currentPage === pagination.pages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
