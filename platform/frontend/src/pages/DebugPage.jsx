import { useState, useEffect } from 'react';
import { casesAPI, fichesAPI, statsAPI } from '../services/api';

export default function DebugPage() {
  const [results, setResults] = useState({});
  const [errors, setErrors] = useState({});
  const [cacheCleared, setCacheCleared] = useState(false);

  const handleClearCache = () => {
    // Clear localStorage
    localStorage.clear();
    // Clear sessionStorage
    sessionStorage.clear();
    setCacheCleared(true);
    // Force reload without cache
    setTimeout(() => {
      window.location.reload(true);
    }, 1000);
  };

  useEffect(() => {
    const testAPIs = async () => {
      // Test Stats API
      try {
        console.log('Testing stats API...');
        const statsResult = await statsAPI.getStats();
        console.log('Stats result:', statsResult);
        setResults(prev => ({ ...prev, stats: statsResult }));
      } catch (error) {
        console.error('Stats error:', error);
        setErrors(prev => ({ ...prev, stats: error.message }));
      }

      // Test Cases API
      try {
        console.log('Testing cases API...');
        const casesResult = await casesAPI.getAll({ limit: 5 });
        console.log('Cases result:', casesResult);
        setResults(prev => ({ ...prev, cases: casesResult }));
      } catch (error) {
        console.error('Cases error:', error);
        setErrors(prev => ({ ...prev, cases: error.message }));
      }

      // Test Fiches API
      try {
        console.log('Testing fiches API...');
        const fichesResult = await fichesAPI.getAll({ limit: 5 });
        console.log('Fiches result:', fichesResult);
        setResults(prev => ({ ...prev, fiches: fichesResult }));
      } catch (error) {
        console.error('Fiches error:', error);
        setErrors(prev => ({ ...prev, fiches: error.message }));
      }
    };

    testAPIs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API Debug Page</h1>

        {/* Cache Clear Section */}
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-yellow-800 mb-4">⚠️ Problème de cache détecté</h2>
          <p className="text-yellow-700 mb-4">
            Si vous voyez 0 cas cliniques et 0 fiches sur la page d'accueil, c'est probablement un problème de cache du navigateur.
          </p>
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-yellow-800 mb-2">Solution 1 : Rechargement forcé (recommandé)</p>
              <ul className="list-disc list-inside text-yellow-700 space-y-1 ml-4">
                <li><strong>Mac Chrome/Edge/Firefox</strong>: Cmd + Shift + R</li>
                <li><strong>Mac Safari</strong>: Cmd + Option + R</li>
                <li><strong>Windows</strong>: Ctrl + Shift + R ou Ctrl + F5</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-yellow-800 mb-2">Solution 2 : Bouton automatique</p>
              <button
                onClick={handleClearCache}
                className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 font-semibold"
                disabled={cacheCleared}
              >
                {cacheCleared ? '✅ Cache vidé - Rechargement...' : '🔄 Vider le cache et recharger'}
              </button>
              {cacheCleared && (
                <p className="text-green-600 mt-2">La page va se recharger automatiquement...</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats API */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Stats API</h2>
          {errors.stats && (
            <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
              Error: {errors.stats}
            </div>
          )}
          {results.stats && (
            <div>
              <p className="text-green-600 font-semibold mb-2">✅ Success!</p>
              <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                {JSON.stringify(results.stats, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Cases API */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Cases API</h2>
          {errors.cases && (
            <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
              Error: {errors.cases}
            </div>
          )}
          {results.cases && (
            <div>
              <p className="text-green-600 font-semibold mb-2">✅ Success!</p>
              <p className="mb-2">
                Received {results.cases.data?.length || 0} cases
              </p>
              <p className="mb-2">
                Total in database: {results.cases.pagination?.total || 'Unknown'}
              </p>
              <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
                {JSON.stringify(results.cases, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Fiches API */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Fiches API</h2>
          {errors.fiches && (
            <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
              Error: {errors.fiches}
            </div>
          )}
          {results.fiches && (
            <div>
              <p className="text-green-600 font-semibold mb-2">✅ Success!</p>
              <p className="mb-2">
                Received {results.fiches.data?.length || 0} fiches
              </p>
              <p className="mb-2">
                Total in database: {results.fiches.pagination?.total || 'Unknown'}
              </p>
              <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
                {JSON.stringify(results.fiches, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
