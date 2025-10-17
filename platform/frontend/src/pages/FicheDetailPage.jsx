import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { fichesAPI } from '../services/api';
import ImageGallery from '../components/ImageGallery';
import axios from 'axios';
import {
  ArrowLeft,
  BookOpen,
  Star,
  AlertCircle,
  Bookmark,
  BookmarkCheck,
  Clock,
  Eye,
  Share2,
  Printer,
  Tag,
  Stethoscope,
  Brain,
  Activity
} from 'lucide-react';

export default function FicheDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [fiche, setFiche] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const fetchFiche = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fichesAPI.getById(slug);
        setFiche(response.data);

        // Fetch images for this fiche
        try {
          const imagesResponse = await axios.get(`/api/v1/fiches/${slug}/images`);
          if (imagesResponse.data.success) {
            setImages(imagesResponse.data.data);
          }
        } catch (imgError) {
          console.log('No images found for this fiche');
        }
      } catch (error) {
        console.error('Error fetching fiche:', error);
        setError(error.response?.data?.error || 'Erreur lors du chargement de la fiche');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchFiche();
    }
  }, [slug]);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'ssp': return <Stethoscope className="w-5 h-5" />;
      case 'skills': return <Brain className="w-5 h-5" />;
      case 'dx': return <Activity className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'ssp': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'skills': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'dx': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'ssp': return 'SSP - Situation Starting Point';
      case 'skills': return 'Skills - Technique';
      case 'dx': return 'Dx - Diagnostic';
      default: return type;
    }
  };

  const renderFrequencyStars = (rating) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        <span className="text-sm text-gray-600 mr-1">Fréquence ECOS:</span>
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating}/5)</span>
      </div>
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: fiche.title,
          text: fiche.subtitle || fiche.description,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié dans le presse-papiers');
    }
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: Call API to save/remove bookmark
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Chargement de la fiche...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/fiches')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour aux fiches
          </button>
        </div>
      </div>
    );
  }

  if (!fiche) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b print:border-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Back Button */}
          <button
            onClick={() => navigate('/fiches')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 print:hidden"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour aux fiches
          </button>

          {/* Title Section */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border font-medium ${getTypeBadgeColor(fiche.fiche_type)}`}>
                    {getTypeIcon(fiche.fiche_type)}
                    {getTypeLabel(fiche.fiche_type)}
                  </span>
                  {fiche.is_urgent && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 text-red-700 border border-red-200 font-medium">
                      <AlertCircle className="w-4 h-4" />
                      Urgence
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{fiche.title}</h1>
                {fiche.subtitle && (
                  <p className="text-lg text-gray-600">{fiche.subtitle}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 ml-4 print:hidden">
                <button
                  onClick={toggleBookmark}
                  className={`p-2 rounded-lg border transition-colors ${
                    isBookmarked
                      ? 'bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100'
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                  title="Ajouter aux favoris"
                >
                  {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                  title="Partager"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  onClick={handlePrint}
                  className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                  title="Imprimer"
                >
                  <Printer className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              {fiche.discipline && (
                <div className="flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4" />
                  <span>{fiche.discipline}</span>
                </div>
              )}
              {fiche.frequency_rating && (
                <div className="flex items-center">
                  {renderFrequencyStars(fiche.frequency_rating)}
                </div>
              )}
              {fiche.view_count > 0 && (
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  <span>{fiche.view_count} vues</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-8 print:shadow-none print:border-0">
          {/* Markdown Content */}
          <div className="prose prose-blue max-w-none">
            <style>{`
              .prose {
                color: #374151;
              }
              .prose h1 {
                color: #111827;
                font-weight: 700;
                font-size: 2em;
                margin-top: 0;
                margin-bottom: 0.8em;
              }
              .prose h2 {
                color: #1f2937;
                font-weight: 600;
                font-size: 1.5em;
                margin-top: 2em;
                margin-bottom: 1em;
                padding-bottom: 0.3em;
                border-bottom: 2px solid #e5e7eb;
              }
              .prose h3 {
                color: #374151;
                font-weight: 600;
                font-size: 1.25em;
                margin-top: 1.6em;
                margin-bottom: 0.6em;
              }
              .prose h4 {
                color: #4b5563;
                font-weight: 600;
                font-size: 1.1em;
                margin-top: 1.5em;
                margin-bottom: 0.5em;
              }
              .prose ul {
                list-style-type: disc;
                padding-left: 1.5em;
                margin: 1em 0;
              }
              .prose ul ul {
                list-style-type: circle;
                margin: 0.5em 0;
              }
              .prose ol {
                list-style-type: decimal;
                padding-left: 1.5em;
                margin: 1em 0;
              }
              .prose li {
                margin: 0.5em 0;
              }
              .prose p {
                margin: 1em 0;
                line-height: 1.7;
              }
              .prose strong {
                color: #111827;
                font-weight: 600;
              }
              .prose em {
                font-style: italic;
              }
              .prose code {
                background-color: #f3f4f6;
                padding: 0.2em 0.4em;
                border-radius: 0.25rem;
                font-size: 0.9em;
                color: #dc2626;
              }
              .prose pre {
                background-color: #1f2937;
                color: #f9fafb;
                padding: 1em;
                border-radius: 0.5rem;
                overflow-x: auto;
              }
              .prose pre code {
                background: transparent;
                padding: 0;
                color: inherit;
              }
              .prose blockquote {
                border-left: 4px solid #3b82f6;
                padding-left: 1em;
                margin: 1.5em 0;
                color: #4b5563;
                font-style: italic;
              }
              .prose table {
                width: 100%;
                border-collapse: collapse;
                margin: 1.5em 0;
              }
              .prose th {
                background-color: #f3f4f6;
                font-weight: 600;
                text-align: left;
                padding: 0.75em;
                border: 1px solid #d1d5db;
              }
              .prose td {
                padding: 0.75em;
                border: 1px solid #d1d5db;
              }
              .prose tr:nth-child(even) {
                background-color: #f9fafb;
              }
              .prose a {
                color: #2563eb;
                text-decoration: underline;
              }
              .prose a:hover {
                color: #1d4ed8;
              }
              .prose hr {
                border: none;
                border-top: 2px solid #e5e7eb;
                margin: 2em 0;
              }
              /* Checkbox styles */
              .prose input[type="checkbox"] {
                margin-right: 0.5em;
              }
              /* Print styles */
              @media print {
                .prose {
                  font-size: 12pt;
                }
                .prose h1 {
                  font-size: 18pt;
                }
                .prose h2 {
                  font-size: 16pt;
                  page-break-after: avoid;
                }
                .prose h3 {
                  font-size: 14pt;
                  page-break-after: avoid;
                }
              }
            `}</style>

            {/* Image Gallery */}
            {images.length > 0 && (
              <div className="mb-8 print:hidden">
                <ImageGallery images={images} type="fiches" />
              </div>
            )}

            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {fiche.content_markdown}
            </ReactMarkdown>
          </div>

          {/* Tags */}
          {fiche.tags && fiche.tags.length > 0 && (
            <div className="mt-8 pt-8 border-t print:hidden">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-700">Tags</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {fiche.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
