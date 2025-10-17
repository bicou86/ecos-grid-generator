#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const JSON_DIR = './json_files';

// Critères d'évaluation globale standardisés
const GLOBAL_CRITERIA = {
    anamnese: {
        text: "Évaluation globale de la qualité de l'anamnèse",
        binaryOnly: false,
        details: [
            "Anamnèse générale ciblée et bien conduite"
        ],
        scoringRule: "Bien = oui, suffisant = ±, insuffisant = non"
    },
    examen: {
        text: "Évaluation globale de la qualité de l'examen clinique",
        binaryOnly: false,
        details: [
            "Status général ciblé et bien conduit"
        ],
        scoringRule: "Bien = oui, suffisant = ±, insuffisant = non"
    },
    management: {
        text: "Évaluation globale de la qualité de la prise en charge",
        binaryOnly: false,
        details: [
            "Prise en charge générale cohérente et bien conduite"
        ],
        scoringRule: "Bien = oui, suffisant = ±, insuffisant = non"
    }
};

function getNextId(existingIds, prefix) {
    let maxNum = 0;
    existingIds.forEach(id => {
        if (id.startsWith(prefix)) {
            const num = parseInt(id.substring(prefix.length));
            if (!isNaN(num) && num > maxNum) {
                maxNum = num;
            }
        }
    });
    return prefix + (maxNum + 1);
}

function hasGlobalCriteria(criteria) {
    return criteria.some(criterion => 
        criterion.text && (
            criterion.text.includes('Évaluation globale') || 
            criterion.text.includes('évaluation globale') ||
            criterion.text.includes('qualité de l\'anamnèse') ||
            criterion.text.includes('qualité de l\'examen') ||
            criterion.text.includes('qualité de la prise en charge')
        )
    );
}

function standardizeJsonFiles() {
    const files = fs.readdirSync(JSON_DIR).filter(file => file.endsWith('.json'));
    console.log(`📋 Traitement de ${files.length} fichiers JSON...`);

    let modifiedCount = 0;

    files.forEach(file => {
        const filePath = path.join(JSON_DIR, file);
        console.log(`\n🔍 Vérification: ${file}`);
        
        try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            let modified = false;

            // Traiter chaque section
            Object.keys(data.sections).forEach(sectionKey => {
                const section = data.sections[sectionKey];
                
                if (!section.criteria || !Array.isArray(section.criteria)) {
                    console.log(`  ⚠️  Section ${sectionKey} n'a pas de critères`);
                    return;
                }

                // Vérifier si cette section a déjà un critère d'évaluation globale
                if (hasGlobalCriteria(section.criteria)) {
                    console.log(`  ✅ Section ${sectionKey} a déjà un critère d'évaluation globale`);
                    return;
                }

                // Obtenir le template du critère global pour cette section
                const globalTemplate = GLOBAL_CRITERIA[sectionKey];
                if (!globalTemplate) {
                    console.log(`  ⚠️  Pas de template pour la section ${sectionKey}`);
                    return;
                }

                // Générer l'ID pour le nouveau critère
                const existingIds = section.criteria.map(c => c.id);
                const prefix = sectionKey.charAt(0);
                const newId = getNextId(existingIds, prefix);

                // Créer le nouveau critère
                const newCriterion = {
                    id: newId,
                    ...globalTemplate
                };

                // Ajouter le critère à la fin de la section
                section.criteria.push(newCriterion);
                modified = true;
                console.log(`  ➕ Ajouté critère d'évaluation globale: ${newId}`);
            });

            // Sauvegarder si modifié
            if (modified) {
                fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
                console.log(`  💾 Fichier mis à jour: ${file}`);
                modifiedCount++;
            }

        } catch (error) {
            console.error(`  ❌ Erreur lors du traitement de ${file}:`, error.message);
        }
    });

    console.log(`\n📊 Résumé:`);
    console.log(`   - Fichiers traités: ${files.length}`);
    console.log(`   - Fichiers modifiés: ${modifiedCount}`);
    console.log(`   - Fichiers inchangés: ${files.length - modifiedCount}`);
}

// Exécuter la standardisation
standardizeJsonFiles();