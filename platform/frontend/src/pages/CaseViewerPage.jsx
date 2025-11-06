import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { casesAPI } from '../services/api';
import './CaseViewerPage.css';

export default function CaseViewerPage() {
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState({});
  const [sectionScores, setSectionScores] = useState({
    anamnese: 0,
    examen: 0,
    management: 0,
    communication: 0
  });

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const data = await casesAPI.getById(id);
        const caseInfo = data.data;
        setCaseData(caseInfo);

        // Initialize scores
        const initialScores = {};
        ['anamnese', 'examen', 'management'].forEach(section => {
          if (caseInfo[`${section}_section`]?.criteria) {
            caseInfo[`${section}_section`].criteria.forEach((criterion, idx) => {
              initialScores[`${section[0]}${idx + 1}`] = 0;
            });
          }
        });
        setScores(initialScores);
      } catch (error) {
        console.error('Error fetching case:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCase();
  }, [id]);

  const updateScore = (section, criterionId, value) => {
    setScores(prev => ({
      ...prev,
      [criterionId]: parseInt(value)
    }));
  };

  // Calculate section scores
  useEffect(() => {
    if (!caseData) return;

    const calculateSectionScore = (sectionKey) => {
      const section = caseData[`${sectionKey}_section`];
      if (!section?.criteria) return 0;

      let totalPoints = 0;
      section.criteria.forEach((_, idx) => {
        const key = `${sectionKey[0]}${idx + 1}`;
        totalPoints += scores[key] || 0;
      });

      const maxPoints = section.criteria.length * 2;
      const percentage = maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0;
      return (percentage * (section.weight || 0.25)).toFixed(1);
    };

    setSectionScores({
      anamnese: calculateSectionScore('anamnese'),
      examen: calculateSectionScore('examen'),
      management: calculateSectionScore('management'),
      communication: 25 // Default communication score
    });
  }, [scores, caseData]);

  const getTotalScore = () => {
    return (
      parseFloat(sectionScores.anamnese) +
      parseFloat(sectionScores.examen) +
      parseFloat(sectionScores.management) +
      parseFloat(sectionScores.communication)
    ).toFixed(1);
  };

  const getGrade = (score) => {
    if (score >= 90) return { grade: 'A', color: 'note-a' };
    if (score >= 80) return { grade: 'B', color: 'note-b' };
    if (score >= 70) return { grade: 'C', color: 'note-c' };
    if (score >= 60) return { grade: 'D', color: 'note-d' };
    return { grade: 'E', color: 'note-e' };
  };

  const renderCriteria = (section, sectionKey, sectionLabel) => {
    if (!section?.criteria) return null;

    return section.criteria.map((criterion, idx) => {
      const criterionId = `${sectionKey[0]}${idx + 1}`;
      const isBinaryOnly = criterion.binaryOnly || false;

      return (
        <div key={criterionId} className="criteria-row">
          <div>
            <div className="criteria-text">
              {idx + 1}. {criterion.text}
              {criterion.patientComment && (
                <span className="patient-response"> [{criterion.patientComment}]</span>
              )}
            </div>
            {criterion.details && (
              <div className="sub-criteria">
                {criterion.details.map((detail, dIdx) => (
                  <div key={dIdx} dangerouslySetInnerHTML={{ __html: detail }} />
                ))}
              </div>
            )}
            {criterion.scoringRule && (
              <div className="scoring-rule">{criterion.scoringRule}</div>
            )}
          </div>
          <div className="checkbox-group">
            <input
              type="radio"
              name={criterionId}
              value="2"
              onChange={(e) => updateScore(sectionKey, criterionId, e.target.value)}
            />
          </div>
          <div className="checkbox-group">
            <input
              type="radio"
              name={criterionId}
              value="1"
              disabled={isBinaryOnly}
              onChange={(e) => updateScore(sectionKey, criterionId, e.target.value)}
            />
          </div>
          <div className="checkbox-group">
            <input
              type="radio"
              name={criterionId}
              value="0"
              onChange={(e) => updateScore(sectionKey, criterionId, e.target.value)}
            />
          </div>
          <div className="points-display">{scores[criterionId] || 0}</div>
        </div>
      );
    });
  };

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

  const totalScore = getTotalScore();
  const { grade, color } = getGrade(parseFloat(totalScore));

  return (
    <div className="ecos-viewer">
      <div className="container">
        {/* Header */}
        <div className="header">
          <h1>Grille d'évaluation ECOS - {caseData.title}</h1>
          <p>Contexte : {caseData.setting}</p>
          <p>Patient : {caseData.patient_description}</p>

          {/* Vital Signs */}
          {caseData.vitals && Object.keys(caseData.vitals).length > 0 && (
            <div className="vital-signs">
              {caseData.vitals.ta && (
                <div className="vital-sign">
                  <div className="vital-sign-label">TA</div>
                  <div className="vital-sign-value">{caseData.vitals.ta}</div>
                </div>
              )}
              {caseData.vitals.fc && (
                <div className="vital-sign">
                  <div className="vital-sign-label">FC</div>
                  <div className="vital-sign-value">{caseData.vitals.fc}</div>
                </div>
              )}
              {caseData.vitals.fr && (
                <div className="vital-sign">
                  <div className="vital-sign-label">FR</div>
                  <div className="vital-sign-value">{caseData.vitals.fr}</div>
                </div>
              )}
              {caseData.vitals.temperature && (
                <div className="vital-sign">
                  <div className="vital-sign-label">T°</div>
                  <div className="vital-sign-value">{caseData.vitals.temperature}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Total Scores */}
        <div className="total-sections">
          <div className={`total-section ${color}`}>
            <div className="total-label">Score Total</div>
            <div className="total-body">
              <div className="total-score">{totalScore}%</div>
            </div>
          </div>

          <div className="total-section">
            <div className="total-label">% par Section</div>
            <div className="total-pourcent-body">
              <div className="total-pourcent-sections">
                {['anamnese', 'examen', 'management', 'communication'].map(section => {
                  const sectionScore = parseFloat(sectionScores[section]);
                  const { color: sectionColor } = getGrade(sectionScore / 0.25);
                  return (
                    <div key={section} className={`total-pourcent-section ${sectionColor}`}>
                      <div className="total-section-label">
                        {section.charAt(0).toUpperCase() + section.slice(1)}
                      </div>
                      <div className="pourcent-body">
                        <div className="total-pourcent-value">{sectionScore}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className={`total-section ${color}`}>
            <div className="total-label">Note Globale</div>
            <div className="total-body">
              <div className="total-note-globale">{grade}</div>
            </div>
          </div>
        </div>

        {/* Anamnèse Section */}
        {caseData.anamnese_section && (
          <div className="section">
            <div className="section-header">
              <span>Anamnèse ({(caseData.anamnese_section.weight * 100).toFixed(0)}%)</span>
              <span className="score">
                Score: {sectionScores.anamnese}%
              </span>
            </div>
            <div className="section-content">
              <div className="header-row">
                <div>Critères</div>
                <div>Oui</div>
                <div>±</div>
                <div>Non</div>
                <div>Points</div>
              </div>
              {renderCriteria(caseData.anamnese_section, 'anamnese', 'Anamnèse')}
            </div>
          </div>
        )}

        {/* Examen Clinique Section */}
        {caseData.examen_section && (
          <div className="section">
            <div className="section-header">
              <span>Examen clinique ({(caseData.examen_section.weight * 100).toFixed(0)}%)</span>
              <span className="score">
                Score: {sectionScores.examen}%
              </span>
            </div>
            <div className="section-content">
              <div className="header-row">
                <div>Critères</div>
                <div>Oui</div>
                <div>±</div>
                <div>Non</div>
                <div>Points</div>
              </div>
              {renderCriteria(caseData.examen_section, 'examen', 'Examen clinique')}
            </div>
          </div>
        )}

        {/* Management Section */}
        {caseData.management_section && (
          <div className="section">
            <div className="section-header">
              <span>Management ({(caseData.management_section.weight * 100).toFixed(0)}%)</span>
              <span className="score">
                Score: {sectionScores.management}%
              </span>
            </div>
            <div className="section-content">
              <div className="header-row">
                <div>Critères</div>
                <div>Oui</div>
                <div>±</div>
                <div>Non</div>
                <div>Points</div>
              </div>
              {renderCriteria(caseData.management_section, 'management', 'Management')}
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="text-center mt-8">
          <Link
            to={`/cases/${id}`}
            className="btn-secondary text-lg px-8 py-3 inline-block"
          >
            ← Retour aux détails du cas
          </Link>
        </div>
      </div>
    </div>
  );
}
