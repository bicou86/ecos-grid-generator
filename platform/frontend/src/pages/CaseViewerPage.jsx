import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { casesAPI } from '../services/api';
import './CaseViewerPage.css';

const SECTION_LABELS = {
  anamnese_section: 'Anamnèse',
  examen_section: 'Examen clinique',
  management_section: 'Management',
  communication_section: 'Communication',
  cloture_section: 'Clôture',
  presentation_section: 'Présentation',
  raisonement_section: 'Raisonnement',
  examens_section: 'Examens complémentaires',
};

const SECTION_ORDER = [
  'anamnese_section',
  'examen_section',
  'management_section',
  'communication_section',
  'raisonement_section',
  'examens_section',
  'cloture_section',
];

const DEFAULT_SECTION_WEIGHTS = {
  anamnese_section: 0.25,
  examen_section: 0.25,
  management_section: 0.25,
  communication_section: 0.25,
  raisonement_section: 0.25,
  examens_section: 0.25,
  cloture_section: 0,
};

const highlightText = (text) =>
  typeof text === 'string'
    ? text.replace(/\[([^\]]+)\]/g, '<span class="patient-response-highlight">$1</span>')
    : '';

const renderBulletList = (items, keyPrefix) => {
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <ul className="criteria-points">
      {items.map((item, idx) => (
        <li key={`${keyPrefix}-${idx}`} dangerouslySetInnerHTML={{ __html: highlightText(item) }} />
      ))}
    </ul>
  );
};

const renderExamples = (examples, keyPrefix) => {
  if (!Array.isArray(examples) || examples.length === 0) return null;

  return (
    <div className="exemples-phrases">
      {examples.map((example, idx) => (
        <div key={`${keyPrefix}-example-${idx}`} className="exemple-phrase" dangerouslySetInnerHTML={{ __html: highlightText(example) }} />
      ))}
    </div>
  );
};

const renderDifferentialSection = (ddSection) => {
  if (!ddSection) return null;

  return (
    <div className="dd-section">
      {ddSection.title && <h4>{ddSection.title}</h4>}
      {Array.isArray(ddSection.categories) &&
        ddSection.categories.map((category, idx) => (
          <div key={`dd-${idx}`} className="dd-category">
            {category.name && <h5>{category.name}</h5>}
            {Array.isArray(category.items) &&
              category.items.map((item, itemIdx) => (
                <div key={`dd-${idx}-${itemIdx}`} className="dd-item">
                  <p className="dd-item-title" dangerouslySetInnerHTML={{ __html: highlightText(item.text) }} />
                  {item.cause && <p className="dd-item-desc" dangerouslySetInnerHTML={{ __html: highlightText(item.cause) }} />}
                  {item.test && <p className="dd-item-test" dangerouslySetInnerHTML={{ __html: highlightText(item.test) }} />}
                </div>
              ))}
          </div>
        ))}
    </div>
  );
};

const renderTherapySection = (therapySection) => {
  if (!therapySection) return null;

  return (
    <div className="therapy-section">
      {Array.isArray(therapySection.categories) &&
        therapySection.categories.map((category, idx) => (
          <div key={`therapy-${idx}`} className="therapy-category">
            {category.title && <h5>{category.title}</h5>}
            {category.content && (
              <pre className="therapy-content" dangerouslySetInnerHTML={{ __html: highlightText(category.content) }} />
            )}
          </div>
        ))}
    </div>
  );
};

const renderRedFlagsSection = (redflagsSection) => {
  if (!redflagsSection) return null;

  return (
    <div className="redflags-main-section">
      {redflagsSection.title && <h4>{redflagsSection.title}</h4>}
      {Array.isArray(redflagsSection.items) &&
        redflagsSection.items.map((item, idx) => (
          <div key={`redflag-${idx}`} className="redflags-item">
            <span className="redflags-text" dangerouslySetInnerHTML={{ __html: highlightText(item.text) }} />
            {item.description && (
              <span className="redflags-description" dangerouslySetInnerHTML={{ __html: highlightText(item.description) }} />
            )}
          </div>
        ))}
    </div>
  );
};

const getGrade = (score) => {
  if (score >= 90) return { grade: 'A', color: 'note-a' };
  if (score >= 80) return { grade: 'B', color: 'note-b' };
  if (score >= 70) return { grade: 'C', color: 'note-c' };
  if (score >= 60) return { grade: 'D', color: 'note-d' };
  return { grade: 'E', color: 'note-e' };
};

const determineMaxPoints = (criterion) => {
  if (typeof criterion.pointScale === 'number') return criterion.pointScale;
  if (criterion.binaryOnly) return 2;
  return 2;
};

const buildSections = (caseData) => {
  if (!caseData) return [];

  return Object.entries(caseData)
    .filter(([key, value]) => key.endsWith('_section') && value)
    .map(([key, value]) => ({
      key,
      label: SECTION_LABELS[key] || key.replace('_section', '').replace(/_/g, ' '),
      data: value,
      weight: value.weight ?? DEFAULT_SECTION_WEIGHTS[key] ?? 0,
    }))
    .sort((a, b) => SECTION_ORDER.indexOf(a.key) - SECTION_ORDER.indexOf(b.key));
};

const createHeaderLabels = (optionValues) => {
  if (!Array.isArray(optionValues) || optionValues.length === 0) return [];

  return optionValues.map((value, index) => {
    if (index === 0) return 'Oui';
    if (index === optionValues.length - 1) return 'Non';
    if (optionValues.length === 3 && index === 1) return '±';
    return `Score ${value}`;
  });
};

export default function CaseViewerPage() {
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState({});
  const [maxScores, setMaxScores] = useState({});
  const [sectionResults, setSectionResults] = useState({});
  const [weightedTotal, setWeightedTotal] = useState(0);
  const [weightSum, setWeightSum] = useState(0);
  const [normalizedTotal, setNormalizedTotal] = useState(0);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const response = await casesAPI.getById(id);
        setCaseData(response.data);
      } catch (error) {
        console.error('Error fetching case:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCase();
  }, [id]);

  const sections = useMemo(() => buildSections(caseData), [caseData]);
  const scoringSections = useMemo(() => sections.filter((section) => (section.weight ?? 0) > 0 && Array.isArray(section.data?.criteria) && section.data.criteria.length > 0), [sections]);

  useEffect(() => {
    if (!scoringSections.length) {
      setScores({});
      setMaxScores({});
      return;
    }

    const initialScores = {};
    const max = {};

    scoringSections.forEach(({ key, data }) => {
      data.criteria.forEach((criterion, index) => {
        const criterionId = criterion.id || `${key}-${index}`;
        initialScores[criterionId] = 0;
        max[criterionId] = determineMaxPoints(criterion);
      });
    });

    setScores(initialScores);
    setMaxScores(max);
  }, [scoringSections]);

  useEffect(() => {
    if (!scoringSections.length) {
      setSectionResults({});
      setWeightedTotal(0);
      setWeightSum(0);
      setNormalizedTotal(0);
      return;
    }

    const results = {};
    let totalWeighted = 0;
    let totalWeight = 0;

    scoringSections.forEach(({ key, data, weight }) => {
      const criteria = data.criteria || [];

      let achieved = 0;
      let maxTotal = 0;

      criteria.forEach((criterion, index) => {
        const criterionId = criterion.id || `${key}-${index}`;
        const maxPoints = maxScores[criterionId] ?? determineMaxPoints(criterion);
        maxTotal += maxPoints;
        const value = scores[criterionId] ?? 0;
        achieved += Math.min(Math.max(value, 0), maxPoints);
      });

      const rawPercentage = maxTotal > 0 ? (achieved / maxTotal) * 100 : 0;
      const effectiveWeight = weight ?? DEFAULT_SECTION_WEIGHTS[key] ?? 0;
      const weighted = rawPercentage * effectiveWeight;

      if (maxTotal > 0 && effectiveWeight > 0) {
        totalWeighted += weighted;
        totalWeight += effectiveWeight;
      }

      results[key] = {
        raw: rawPercentage,
        weighted,
        weight: effectiveWeight,
        achieved,
        max: maxTotal,
      };
    });

    setSectionResults(results);
    setWeightedTotal(totalWeighted);
    setWeightSum(totalWeight);
    setNormalizedTotal(totalWeight > 0 ? totalWeighted / totalWeight : 0);
  }, [scoringSections, scores, maxScores]);

  const updateScore = (criterionId, value) => {
    setScores((prev) => ({ ...prev, [criterionId]: Number(value) }));
  };

  const renderCriterion = (sectionKey, sectionOptionTemplate, criterion, index) => {
    const criterionId = criterion.id || `${sectionKey}-${index}`;
    const optionValues = (() => {
      const maxPoints = maxScores[criterionId] ?? determineMaxPoints(criterion);
      if (criterion.binaryOnly) {
        return [maxPoints, 0];
      }
      const values = [];
      for (let value = maxPoints; value >= 0; value -= 1) {
        values.push(value);
      }
      return values;
    })();

    const radioCells = sectionOptionTemplate.map((templateValue, templateIndex) => {
      const valueIndex = optionValues.indexOf(templateValue);

      if (valueIndex === -1) {
        return <div key={`${criterionId}-option-${templateIndex}`} className="checkbox-group" />;
      }

      return (
        <div key={`${criterionId}-option-${templateIndex}`} className="checkbox-group">
          <input
            type="radio"
            name={criterionId}
            value={templateValue}
            checked={scores[criterionId] === templateValue}
            onChange={(e) => updateScore(criterionId, e.target.value)}
          />
        </div>
      );
    });

    return (
      <div key={criterionId} className="criteria-row">
        <div className="criteria-main">
          <div className="criteria-text">
            <span className="criteria-number">{index + 1}.</span>{' '}
            <span dangerouslySetInnerHTML={{ __html: highlightText(criterion.text) }} />
            {criterion.patientComment && (
              <span className="patient-response"> [{criterion.patientComment}]</span>
            )}
          </div>
          {criterion.description && (
            <div className="criteria-description" dangerouslySetInnerHTML={{ __html: highlightText(criterion.description) }} />
          )}
          {criterion.subheader && <div className="criteria-subheader">{criterion.subheader}</div>}
          {renderBulletList(criterion.details, `${criterionId}-detail`)}
          {criterion.scoringRule && <div className="scoring-rule">{criterion.scoringRule}</div>}
          {renderExamples(criterion.exemplesPhrases, criterionId)}
          {renderDifferentialSection(criterion.ddSection)}
          {renderTherapySection(criterion.therapySection)}
          {renderRedFlagsSection(criterion.redflagsSection)}
        </div>
        {radioCells}
        <div className="points-display">{scores[criterionId] ?? 0}</div>
      </div>
    );
  };

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

  const totalGrade = getGrade(normalizedTotal);

  return (
    <div className="ecos-viewer">
      <div className="container">
        <div className="header">
          <h1>Grille d'évaluation ECOS - {caseData.title}</h1>
          {caseData.setting && <p>Contexte : {caseData.setting}</p>}
          {caseData.patient_description && <p>Patient : {caseData.patient_description}</p>}

          {caseData.vitals && Object.keys(caseData.vitals).length > 0 && (
            <div className="vital-signs">
              {Object.entries(caseData.vitals).map(([key, value]) => (
                <div key={key} className="vital-sign">
                  <div className="vital-sign-label">{key.toUpperCase()}</div>
                  <div className="vital-sign-value">{value}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="total-sections">
          <div className={`total-section ${totalGrade.color}`}>
            <div className="total-label">Score total</div>
            <div className="total-body">
              <div className="total-score">{normalizedTotal.toFixed(1)}%</div>
            </div>
          </div>

          <div className="total-section">
            <div className="total-label">% par section</div>
            <div className="total-pourcent-body">
              <div className="total-pourcent-sections">
                {scoringSections.map(({ key, label }) => {
                  const sectionResult = sectionResults[key];
                  const { color } = getGrade(sectionResult?.raw ?? 0);
                  return (
                    <div key={key} className={`total-pourcent-section ${color}`}>
                      <div className="total-section-label">
                        {label} ({Math.round((sectionResult?.weight ?? 0) * 100)}%)
                      </div>
                      <div className="pourcent-body">
                        <div className="total-pourcent-value">{(sectionResult?.raw ?? 0).toFixed(1)}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className={`total-section ${totalGrade.color}`}>
            <div className="total-label">Note globale</div>
            <div className="total-body">
              <div className="total-note-globale">{totalGrade.grade}</div>
            </div>
          </div>
        </div>

        {sections.map(({ key, label, data, weight }) => {
          const criteria = Array.isArray(data?.criteria) ? data.criteria : [];
          const sectionResult = sectionResults[key];
          const isScoringSection = scoringSections.some((section) => section.key === key);

          if (criteria.length === 0) {
            if (Array.isArray(data?.content)) {
              return (
                <div key={key} className="section note-neutral">
                  <div className="section-header">
                    <span>{label}</span>
                  </div>
                  <div className="section-content info-section">
                    {data.content.map((item, idx) => (
                      <p key={`${key}-content-${idx}`} dangerouslySetInnerHTML={{ __html: highlightText(item) }} />
                    ))}
                  </div>
                </div>
              );
            }

            return null;
          }

          if (!isScoringSection) {
            return (
              <div key={key} className="section note-neutral">
                <div className="section-header">
                  <span>{label}</span>
                </div>
                <div className="section-content info-section">
                  {criteria.map((criterion, idx) => (
                    <div key={criterion.id || `${key}-${idx}`} className="info-criterion">
                      <h4 dangerouslySetInnerHTML={{ __html: highlightText(criterion.text) }} />
                      {criterion.content && (
                        <p dangerouslySetInnerHTML={{ __html: highlightText(criterion.content) }} />
                      )}
                      {renderBulletList(criterion.details, `${key}-info-${idx}`)}
                      {renderExamples(criterion.exemplesPhrases, `${key}-info-${idx}`)}
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          const sectionOptionTemplate = (() => {
            const templateCriterion = criteria.reduce((best, criterion) => {
              const criterionId = criterion.id || `${key}-${criteria.indexOf(criterion)}`;
              const options = (() => {
                const maxPoints = maxScores[criterionId] ?? determineMaxPoints(criterion);
                if (criterion.binaryOnly) return [maxPoints, 0];
                const values = [];
                for (let value = maxPoints; value >= 0; value -= 1) {
                  values.push(value);
                }
                return values;
              })();
              if (!best || options.length > best.options.length) {
                return { criterionId, options };
              }
              return best;
            }, null);

            return templateCriterion ? templateCriterion.options : [2, 1, 0];
          })();

          const headerLabels = createHeaderLabels(sectionOptionTemplate);
          const sectionGrade = sectionResult ? getGrade(sectionResult.raw) : getGrade(0);

          return (
            <div key={key} className={`section ${sectionGrade.color}`}>
              <div className="section-header">
                <span>
                  {label} ({Math.round((weight ?? DEFAULT_SECTION_WEIGHTS[key] ?? 0) * 100)}%)
                </span>
                {sectionResult && <span className="score">Score : {sectionResult.raw.toFixed(1)}%</span>}
              </div>
              <div className="section-content">
                <div
                  className="header-row"
                  style={{ gridTemplateColumns: `2fr repeat(${sectionOptionTemplate.length}, 80px) 80px` }}
                >
                  <div>Critères</div>
                  {headerLabels.map((label, idx) => (
                    <div key={`${key}-header-${idx}`}>{label}</div>
                  ))}
                  <div>Points</div>
                </div>
                {criteria.map((criterion, idx) => renderCriterion(key, sectionOptionTemplate, criterion, idx))}
              </div>
            </div>
          );
        })}

        <div className="text-center mt-8">
          <Link to={`/cases/${caseData.slug}`} className="btn-secondary text-lg px-8 py-3 inline-block">
            ← Retour aux détails du cas
          </Link>
        </div>
      </div>
    </div>
  );
}
