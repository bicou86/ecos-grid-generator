import { useParams, Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import ImageGallery from '../components/ImageGallery';
import { casesAPI } from '../services/api';

const difficultyLabels = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
};

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800',
};

const highlightPatientText = (text) =>
  typeof text === 'string'
    ? text.replace(/\[([^\]]+)\]/g, '<span class="text-blue-600 font-semibold">$1</span>')
    : '';

const renderPoints = (items) => {
  if (!items) return null;
  const list = Array.isArray(items) ? items : [items];
  if (list.length === 0) return null;

  return (
    <ul className="list-disc space-y-2 pl-6">
      {list.map((point, index) => (
        <li
          key={`${point}-${index}`}
          className="text-gray-700"
          dangerouslySetInnerHTML={{ __html: highlightPatientText(point) }}
        />
      ))}
    </ul>
  );
};

const renderKeyValueList = (entries) => {
  if (!entries || entries.length === 0) return null;

  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {entries.map(({ label, value }) => (
        <div key={label} className="bg-gray-50 rounded-lg p-3">
          <dt className="text-sm font-semibold text-gray-500">{label}</dt>
          <dd className="mt-1 text-gray-800" dangerouslySetInnerHTML={{ __html: highlightPatientText(value) }} />
        </div>
      ))}
    </dl>
  );
};

const InfoPill = ({ children, colorClass = 'bg-gray-100 text-gray-800' }) => (
  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
    {children}
  </span>
);

export default function CaseDetailPage() {
  const { slug } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        setLoading(true);
        const response = await casesAPI.getById(slug);
        setCaseData(response.data);
      } catch (error) {
        console.error('Error fetching case:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCase();
  }, [slug]);

  const annexes = caseData?.annexes || {};

  const galleryImages = useMemo(() => {
    if (!annexes.images) return [];
    return annexes.images
      .map((image, index) => ({
        id: image.id || `${image.title}-${index}`,
        url: image.data || image.url || image.path,
        description: image.description || image.title,
      }))
      .filter((image) => Boolean(image.url));
  }, [annexes.images]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!caseData) {
    return <div className="container-custom py-8">Cas non trouvé</div>;
  }

  const difficultyLabel = difficultyLabels[caseData.difficulty_level] || caseData.difficulty_level;
  const difficultyColor = difficultyColors[caseData.difficulty_level] || 'bg-gray-100 text-gray-800';

  const expertInformation = annexes.informationsExpert;
  const resume = annexes.resume;
  const presentation = annexes.presentationPatient;
  const theory = annexes.theoriePratique;
  const scenario = annexes.scenarioPatienteStandardisee;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8 space-y-8">
        <section className="bg-white rounded-lg shadow-md p-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{caseData.title}</h1>
                <p className="text-lg text-gray-600">{caseData.patient_description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {caseData.source && <InfoPill colorClass="bg-blue-100 text-blue-700">{caseData.source}</InfoPill>}
                {difficultyLabel && <InfoPill colorClass={difficultyColor}>{difficultyLabel}</InfoPill>}
                {caseData.estimated_time_minutes && (
                  <InfoPill colorClass="bg-purple-100 text-purple-700">
                    {caseData.estimated_time_minutes} min
                  </InfoPill>
                )}
                {caseData.category_name && (
                  <InfoPill colorClass="bg-amber-100 text-amber-700">{caseData.category_name}</InfoPill>
                )}
              </div>
            </div>

            {caseData.setting && (
              <div className="border border-blue-100 rounded-lg p-4 bg-blue-50 text-blue-800">
                <h2 className="text-sm uppercase tracking-wide font-semibold mb-1">Contexte clinique</h2>
                <p>{caseData.setting}</p>
              </div>
            )}

            {Array.isArray(caseData.specialties) && caseData.specialties.length > 0 && (
              <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                {caseData.specialties.map((specialty) => (
                  <span key={specialty} className="px-3 py-1 bg-gray-100 rounded-full">
                    {specialty}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {caseData.vitals && Object.keys(caseData.vitals).length > 0 && (
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Signes vitaux</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(caseData.vitals).map(([key, value]) => (
                <div key={key} className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-center">
                  <div className="text-sm uppercase tracking-wide text-gray-500 font-semibold">{key}</div>
                  <div className="text-xl font-bold text-gray-900 mt-2">{value}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {galleryImages.length > 0 && (
          <section className="bg-white rounded-lg shadow-md p-6">
            <ImageGallery images={galleryImages} type="ecos" />
          </section>
        )}

        {resume && (
          <section className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{resume.titre || 'Résumé clinique'}</h2>
              {resume.description && <p className="mt-2 text-gray-600">{resume.description}</p>}
            </div>

            {Array.isArray(resume.sections) &&
              resume.sections.map((section) => (
                <div key={section.titre} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{section.titre}</h3>
                  {renderPoints(section.points)}
                  {Array.isArray(section.subsections) && (
                    <div className="mt-3 space-y-3">
                      {section.subsections.map((subsection) => (
                        <div key={subsection.titre}>
                          <h4 className="font-semibold text-gray-800">{subsection.titre}</h4>
                          {renderPoints(subsection.points)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </section>
        )}

        {presentation && (
          <section className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{presentation.titre}</h2>
              {presentation.description && <p className="mt-2 text-gray-600">{presentation.description}</p>}
            </div>
            {Array.isArray(presentation.sections) &&
              presentation.sections.map((section) => (
                <div key={section.titre} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{section.titre}</h3>
                  {renderPoints(section.points)}
                  {section.contenu && <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: highlightPatientText(section.contenu) }} />}
                </div>
              ))}
          </section>
        )}

        {expertInformation && (
          <section className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">{expertInformation.titre}</h2>
            {expertInformation.dossierMedical && (
              <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: highlightPatientText(expertInformation.dossierMedical) }} />
            )}
            {renderPoints(expertInformation.pointsCles)}
            {renderPoints(expertInformation.rolesInterventions)}
          </section>
        )}

        {theory && (
          <section className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">{theory.titre}</h2>
            {Array.isArray(theory.sections) &&
              theory.sections.map((section) => (
                <div key={section.titre} className="border border-gray-100 rounded-lg p-4 bg-gray-50 space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{section.titre}</h3>
                    {section.contenu && (
                      <p className="mt-1 text-gray-700" dangerouslySetInnerHTML={{ __html: highlightPatientText(section.contenu) }} />
                    )}
                  </div>
                  {renderPoints(section.points)}
                </div>
              ))}

            {(Array.isArray(theory.rappelsTherapeutiques) || Array.isArray(theory.examensComplementaires)) && (
              <div className="grid gap-4 md:grid-cols-2">
                {renderPoints(theory.rappelsTherapeutiques)}
                {renderPoints(theory.examensComplementaires)}
              </div>
            )}
          </section>
        )}

        {scenario && (
          <section className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">{scenario.titre || 'Scénario patient standardisé'}</h2>

            <div className="grid gap-4 md:grid-cols-2">
              {renderKeyValueList(
                [
                  scenario.nom && { label: 'Nom', value: scenario.nom },
                  scenario.age && { label: 'Âge', value: scenario.age },
                  scenario.contexte && { label: 'Contexte', value: scenario.contexte },
                ].filter(Boolean)
              )}
            </div>

            {scenario.motifConsultation && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Motif de consultation</h3>
                {renderPoints(Object.values(scenario.motifConsultation))}
              </div>
            )}

            {Array.isArray(scenario.consignes) && scenario.consignes.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Consignes pour le jeu de rôle</h3>
                {renderPoints(scenario.consignes)}
              </div>
            )}

            {scenario.histoireActuelle && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Histoire actuelle</h3>
                {Object.entries(scenario.histoireActuelle).map(([sectionKey, values]) => (
                  <div key={sectionKey}>
                    <h4 className="font-semibold text-gray-800 capitalize">{sectionKey.replace(/([A-Z])/g, ' $1')}</h4>
                    {renderPoints(values)}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <div className="flex justify-center">
          <Link
            to={`/case/${caseData.id}/view`}
            className="btn-primary text-lg px-10 py-3 shadow-md hover:shadow-lg transition"
          >
            Commencer l'évaluation
          </Link>
        </div>
      </div>
    </div>
  );
}
