import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, Clock, Target, TrendingUp } from 'lucide-react';

export default function CircuitsListPage() {
  const [circuits, setCircuits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCircuits();
  }, []);

  const fetchCircuits = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/circuits?type=predefined');
      const data = await response.json();
      if (data.success) {
        setCircuits(data.data);
      }
    } catch (error) {
      console.error('Error fetching circuits:', error);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold mb-4">Circuits d'Apprentissage ECOS</h1>
          <p className="text-xl text-purple-100">
            Parcours structurés pour progresser efficacement
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {circuits.map((circuit) => {
              const difficulty = getDifficultyBadge(circuit.difficulty_level);

              return (
                <Link
                  key={circuit.id}
                  to={`/stations/circuit/${circuit.id}`}
                  className="bg-white rounded-lg p-6 hover:shadow-xl transition-shadow border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-xl text-gray-900 flex-1">
                      {circuit.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${difficulty.class}`}>
                      {difficulty.label}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4">
                    {circuit.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      <span>{circuit.fiche_count} stations</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{circuit.total_duration} min</span>
                    </div>
                    {circuit.times_used > 0 && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>{circuit.times_used} utilisations</span>
                      </div>
                    )}
                  </div>

                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                    <PlayCircle className="w-5 h-5" />
                    Commencer ce Circuit
                  </button>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
