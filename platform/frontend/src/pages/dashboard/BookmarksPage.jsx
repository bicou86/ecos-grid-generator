import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Trash2,
  BookOpen,
  Clock,
  Star,
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'ssp', 'skills', 'dx'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/bookmarks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setBookmarks(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBookmark = async (ficheId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_BASE_URL}/bookmarks/${ficheId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setBookmarks(bookmarks.filter(b => b.fiche_id !== ficheId));
      }
    } catch (error) {
      console.error('Error deleting bookmark:', error);
    }
  };

  const getFicheTypeLabel = (type) => {
    const labels = {
      'ssp': 'Station SSP',
      'skills': 'Guide Pratique',
      'dx': 'Cas Clinique'
    };
    return labels[type] || type;
  };

  const getFicheTypeColor = (type) => {
    const colors = {
      'ssp': 'bg-blue-100 text-blue-700',
      'skills': 'bg-purple-100 text-purple-700',
      'dx': 'bg-red-100 text-red-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesFilter = filter === 'all' || bookmark.fiche_type === filter;
    const matchesSearch = bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          bookmark.subtitle?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Heart className="w-8 h-8 text-pink-600" />
            Mes Favoris
          </h1>
          <p className="text-gray-600">
            {filteredBookmarks.length} {filteredBookmarks.length === 1 ? 'favori enregistré' : 'favoris enregistrés'}
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher dans mes favoris..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="all">Tous les types</option>
                <option value="ssp">Stations SSP</option>
                <option value="skills">Guides Pratiques</option>
                <option value="dx">Cas Cliniques</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookmarks List */}
        {filteredBookmarks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || filter !== 'all' ? 'Aucun favori trouvé' : 'Aucun favori enregistré'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filter !== 'all'
                ? 'Essayez de modifier vos filtres de recherche'
                : 'Commencez à ajouter des fiches à vos favoris pour les retrouver ici'}
            </p>
            {!searchTerm && filter === 'all' && (
              <div className="flex justify-center gap-4">
                <Link
                  to="/stations"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                  <BookOpen className="w-5 h-5" />
                  Explorer les Stations
                </Link>
                <Link
                  to="/guides"
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
                >
                  <BookOpen className="w-5 h-5" />
                  Explorer les Guides
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredBookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200 border border-gray-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getFicheTypeColor(bookmark.fiche_type)}`}>
                        {getFicheTypeLabel(bookmark.fiche_type)}
                      </span>
                      {bookmark.frequency_rating && (
                        <div className="flex items-center gap-1">
                          {[...Array(bookmark.frequency_rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      )}
                    </div>

                    <Link
                      to={`/fiches/${bookmark.slug}`}
                      className="block group"
                    >
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-pink-600 transition-colors mb-2">
                        {bookmark.title}
                      </h3>
                      {bookmark.subtitle && (
                        <p className="text-gray-600 mb-3">{bookmark.subtitle}</p>
                      )}
                    </Link>

                    {bookmark.discipline && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        <BookOpen className="w-4 h-4" />
                        <span>{bookmark.discipline}</span>
                      </div>
                    )}

                    {bookmark.notes && (
                      <div className="mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                        <p className="text-sm text-gray-700 italic">Note: {bookmark.notes}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Ajouté le {new Date(bookmark.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Link
                      to={`/fiches/${bookmark.slug}`}
                      className="p-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                      title="Voir la fiche"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDeleteBookmark(bookmark.fiche_id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Retirer des favoris"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
