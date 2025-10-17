import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, BookOpen, ChevronRight } from 'lucide-react';
import { casesAPI, categoriesAPI } from '../services/api';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cases, setCases] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  const currentPage = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesAPI.getAll();
        setCategories(data.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchCases = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: 20,
        };

        if (selectedCategory) params.category = selectedCategory;
        if (selectedDifficulty) params.difficulty = selectedDifficulty;
        if (searchQuery) params.search = searchQuery;

        const data = await casesAPI.getAll(params);
        setCases(data.data);
        setPagination(data.pagination);
      } catch (error) {
        console.error('Error fetching cases:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, [currentPage, selectedCategory, selectedDifficulty, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ page: '1' });
  };

  const handleCategoryChange = (categorySlug) => {
    setSelectedCategory(categorySlug);
    setSearchParams({ page: '1', category: categorySlug });
  };

  const handleDifficultyChange = (difficulty) => {
    setSelectedDifficulty(difficulty);
    setSearchParams({ page: '1' });
  };

  const handlePageChange = (newPage) => {
    const params = { page: newPage.toString() };
    if (selectedCategory) params.category = selectedCategory;
    setSearchParams(params);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'Débutant';
      case 'intermediate':
        return 'Intermédiaire';
      case 'advanced':
        return 'Avancé';
      default:
        return difficulty;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Catalogue de cas cliniques
        </h1>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un cas clinique..."
                  className="input pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary">
                Rechercher
              </button>
            </div>
          </form>

          <div className="flex flex-wrap gap-4">
            {/* Category Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="inline w-4 h-4 mr-1" />
                Catégorie
              </label>
              <select
                className="input"
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="">Toutes les catégories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name} ({cat.case_count})
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulté
              </label>
              <select
                className="input"
                value={selectedDifficulty}
                onChange={(e) => handleDifficultyChange(e.target.value)}
              >
                <option value="">Toutes les difficultés</option>
                <option value="beginner">Débutant</option>
                <option value="intermediate">Intermédiaire</option>
                <option value="advanced">Avancé</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="mb-4 text-gray-600">
              {pagination.total} cas trouvés
            </div>

            <div className="grid grid-cols-1 gap-6 mb-8">
              {cases.map((caseItem) => (
                <Link
                  key={caseItem.id}
                  to={`/cases/${caseItem.slug}`}
                  className="card-hover flex items-start gap-4"
                >
                  <div className="flex-shrink-0 w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-blue-600" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {caseItem.title}
                      </h3>
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </div>

                    <p className="text-gray-600 mb-3">
                      {caseItem.patient_description}
                    </p>

                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-500">{caseItem.setting}</span>
                      <span className="text-gray-300">•</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(caseItem.difficulty_level)}`}>
                        {getDifficultyLabel(caseItem.difficulty_level)}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-blue-600 font-medium">{caseItem.category_name}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>

                <div className="flex items-center gap-2">
                  {[...Array(Math.min(pagination.totalPages, 5))].map((_, idx) => {
                    const pageNum = pagination.page - 2 + idx;
                    if (pageNum < 1 || pageNum > pagination.totalPages) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-4 py-2 rounded-lg font-medium ${
                          pageNum === pagination.page
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
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
