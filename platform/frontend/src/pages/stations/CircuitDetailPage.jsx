import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Clock,
  Target,
  CheckCircle,
  Circle,
  TrendingUp
} from 'lucide-react';

export default function CircuitDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [circuit, setCircuit] = useState(null);
  const [fiches, setFiches] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(13 * 60); // 13 minutes in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  // Progress tracking
  const [completedFiches, setCompletedFiches] = useState(new Set());
  const [sessionStartTime, setSessionStartTime] = useState(null);

  useEffect(() => {
    fetchCircuitData();

    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [id]);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimerEnd();
            return 0;
          }

          // 2-minute warning sound
          if (prev === 120) {
            playSound('warning');
          }

          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning]);

  const fetchCircuitData = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/circuits/${id}`);
      const data = await response.json();

      if (data.success) {
        // API returns { circuit: {...}, fiches: [...] }
        setCircuit(data.data.circuit || data.data);
        setFiches(data.data.fiches || []);
      }
    } catch (error) {
      console.error('Error fetching circuit:', error);
    } finally {
      setLoading(false);
    }
  };

  const playSound = (type) => {
    // Simple beep using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === 'warning') {
      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.3;
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);

      // Double beep
      setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.frequency.value = 800;
        gain2.gain.value = 0.3;
        osc2.start();
        osc2.stop(audioContext.currentTime + 0.2);
      }, 300);
    } else if (type === 'end') {
      oscillator.frequency.value = 600;
      gainNode.gain.value = 0.3;
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  };

  const handleStartTimer = () => {
    if (!hasStarted) {
      setHasStarted(true);
      setSessionStartTime(new Date());
      playSound('start');
    }
    setIsTimerRunning(true);
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimeRemaining(13 * 60);
    setHasStarted(false);
    setSessionStartTime(null);
  };

  const handleTimerEnd = () => {
    setIsTimerRunning(false);
    playSound('end');

    // Mark current fiche as completed
    setCompletedFiches(prev => new Set([...prev, currentIndex]));
  };

  const handleNextFiche = () => {
    if (currentIndex < fiches.length - 1) {
      setCurrentIndex(currentIndex + 1);
      handleResetTimer();
    }
  };

  const handlePreviousFiche = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      handleResetTimer();
    }
  };

  const handleMarkComplete = () => {
    setCompletedFiches(prev => new Set([...prev, currentIndex]));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeRemaining <= 120) return 'text-red-600';
    if (timeRemaining <= 300) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!circuit || fiches.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Circuit introuvable</h2>
          <Link to="/stations/circuits" className="text-blue-600 hover:text-blue-700">
            Retour aux circuits
          </Link>
        </div>
      </div>
    );
  }

  const currentFiche = fiches[currentIndex];
  const progress = ((completedFiches.size / fiches.length) * 100).toFixed(0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/stations/circuits')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour aux circuits
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{circuit.title}</h1>
              <p className="text-gray-600 mt-1">{circuit.description}</p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-sm text-gray-500">Progression</div>
                <div className="text-2xl font-bold text-blue-600">{progress}%</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Complétées</div>
                <div className="text-2xl font-bold text-green-600">
                  {completedFiches.size}/{fiches.length}
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - Fiche List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Stations du Circuit
              </h2>

              <div className="space-y-2">
                {fiches.map((fiche, index) => (
                  <button
                    key={fiche.id}
                    onClick={() => {
                      setCurrentIndex(index);
                      handleResetTimer();
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      index === currentIndex
                        ? 'bg-blue-50 border-2 border-blue-600'
                        : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {completedFiches.has(index) ? (
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          )}
                          <span className="text-sm font-medium text-gray-900 line-clamp-2">
                            {fiche.title}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 ml-7">
                          {fiche.estimated_duration || 13} min
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Area - Current Fiche */}
          <div className="lg:col-span-2">
            {/* Timer Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-xl">Station {currentIndex + 1} / {fiches.length}</h2>
                <div className={`text-4xl font-mono font-bold ${getTimerColor()}`}>
                  {formatTime(timeRemaining)}
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={isTimerRunning ? handlePauseTimer : handleStartTimer}
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    isTimerRunning
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isTimerRunning ? (
                    <>
                      <Pause className="w-5 h-5" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      {hasStarted ? 'Reprendre' : 'Démarrer'}
                    </>
                  )}
                </button>

                <button
                  onClick={handleResetTimer}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Réinitialiser
                </button>
              </div>

              {timeRemaining <= 120 && timeRemaining > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  ⚠️ Plus que 2 minutes restantes !
                </div>
              )}

              {timeRemaining === 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                  ✅ Temps écoulé ! Passez à la station suivante.
                </div>
              )}
            </div>

            {/* Current Fiche Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">{currentFiche.title}</h3>
                <button
                  onClick={handleMarkComplete}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    completedFiches.has(currentIndex)
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {completedFiches.has(currentIndex) ? '✓ Complétée' : 'Marquer comme complétée'}
                </button>
              </div>

              {currentFiche.context_patient && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Contexte</h4>
                  <p className="text-gray-700 leading-relaxed">{currentFiche.context_patient}</p>
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{currentFiche.estimated_duration || 13} minutes</span>
                </div>
                {currentFiche.difficulty_level && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>
                      {currentFiche.difficulty_level === 1 && 'Débutant'}
                      {currentFiche.difficulty_level === 2 && 'Intermédiaire'}
                      {currentFiche.difficulty_level === 3 && 'Avancé'}
                    </span>
                  </div>
                )}
              </div>

              <Link
                to={`/fiches/${currentFiche.slug}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Ouvrir la Station
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={handlePreviousFiche}
                disabled={currentIndex === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  currentIndex === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                Station Précédente
              </button>

              <button
                onClick={handleNextFiche}
                disabled={currentIndex === fiches.length - 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  currentIndex === fiches.length - 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Station Suivante
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
