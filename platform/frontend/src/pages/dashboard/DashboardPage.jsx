import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Target,
  Clock,
  Award,
  BookOpen,
  Heart,
  Activity,
  ChevronRight,
  Calendar,
  BarChart3
} from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalStudied: 0,
    totalTime: 0,
    completedCircuits: 0,
    bookmarksCount: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    // Mock data for now - replace with API call when backend is ready
    setTimeout(() => {
      setStats({
        totalStudied: 42,
        totalTime: 340,
        completedCircuits: 3,
        bookmarksCount: 15,
        recentActivity: [
          { id: 1, type: 'circuit', title: 'Circuit Urgences', date: '2025-10-14', score: 85 },
          { id: 2, type: 'station', title: 'SSP - Anamnèse Cardiovasculaire', date: '2025-10-13', score: 92 },
          { id: 3, type: 'station', title: 'Examen Neurologique', date: '2025-10-13', score: 78 },
          { id: 4, type: 'circuit', title: 'Circuit Pédiatrie', date: '2025-10-12', score: 88 }
        ]
      });
      setLoading(false);
    }, 500);
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de Bord</h1>
          <p className="text-gray-600">
            Bienvenue, {user?.name || user?.email?.split('@')[0] || 'étudiant'}!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalStudied}</h3>
            <p className="text-sm text-gray-600">Stations étudiées</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{formatTime(stats.totalTime)}</h3>
            <p className="text-sm text-gray-600">Temps d'étude</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.completedCircuits}</h3>
            <p className="text-sm text-gray-600">Circuits complétés</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-pink-50 rounded-lg">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.bookmarksCount}</h3>
            <p className="text-sm text-gray-600">Favoris</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Activity className="w-6 h-6 text-blue-600" />
                  Activité Récente
                </h2>
                <Link to="/dashboard/history" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  Voir tout
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-4">
                {stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white rounded-lg">
                        {activity.type === 'circuit' ? (
                          <Target className="w-5 h-5 text-blue-600" />
                        ) : (
                          <BookOpen className="w-5 h-5 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{activity.title}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(activity.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(activity.score)}`}>
                      {activity.score}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Actions Rapides</h2>
              <div className="space-y-3">
                <Link to="/stations/circuits" className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Commencer un circuit</span>
                </Link>
                <Link to="/stations" className="flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-900">Parcourir les stations</span>
                </Link>
                <Link to="/dashboard/bookmarks" className="flex items-center gap-3 p-3 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors">
                  <Heart className="w-5 h-5 text-pink-600" />
                  <span className="font-medium text-gray-900">Mes favoris</span>
                </Link>
                <Link to="/dashboard/progress" className="flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-900">Ma progression</span>
                </Link>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-md p-6 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5" />
                <h3 className="font-semibold">Prochaine Session</h3>
              </div>
              <p className="text-blue-100 text-sm mb-4">
                Continuez votre progression avec une session d'étude quotidienne
              </p>
              <Link to="/stations/circuits" className="block text-center px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                Commencer maintenant
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-3">
                <Award className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Score Moyen</h3>
              <p className="text-3xl font-bold text-yellow-600 mb-2">85%</p>
              <p className="text-sm text-gray-600">Excellent travail! Continuez comme ça</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
