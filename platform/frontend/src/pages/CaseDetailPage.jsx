import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { casesAPI } from '../services/api';
import ImageGallery from '../components/ImageGallery';
import axios from 'axios';

export default function CaseDetailPage() {
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const data = await casesAPI.getById(id);
        setCaseData(data.data);

        // Fetch images for this case
        try {
          const imagesResponse = await axios.get(`/api/v1/cases/${id}/images`);
          if (imagesResponse.data.success) {
            setImages(imagesResponse.data.data);
          }
        } catch (imgError) {
          console.log('No images found for this case');
        }
      } catch (error) {
        console.error('Error fetching case:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCase();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!caseData) {
    return <div className="container-custom py-8">Cas non trouvé</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{caseData.title}</h1>
        <p className="text-xl text-gray-600 mb-6">{caseData.patient_description}</p>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Contexte</h2>
          <p className="text-gray-700">{caseData.setting}</p>
        </div>

        {caseData.vitals && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Signes vitaux</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(caseData.vitals).map(([key, value]) => (
                <div key={key} className="p-3 bg-gray-50 rounded">
                  <span className="font-medium text-gray-700">{key}: </span>
                  <span className="text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image Gallery */}
        {images.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <ImageGallery images={images} type="cases" />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 py-8">
          <Link
            to={`/case/${caseData.id}/view`}
            className="btn-primary text-lg px-8 py-3 inline-block"
          >
            Commencer l'évaluation
          </Link>
        </div>
      </div>
    </div>
  );
}
