#!/usr/bin/env python3
"""
Script pour mettre à jour la fonction generatePresentationPatientSection avec support complet des propriétés
"""

# Lire le fichier
with open('Chablon/Generateur_de_Grilles_ECOS.html', 'r', encoding='utf-8') as f:
    content = f.read()

# La fonction améliorée avec support complet
improved_function = '''function generatePresentationPatientSection(presentation) {
    let html = '<div class="presentation-patient">\\n';
    
    // Titre principal avec icône
    let title = presentation.titre || 'Présentation du patient (Station double)';
    if (!title.includes('📑') && !title.includes('🎤') && !title.includes('📋')) {
        title = '📋 ' + title;
    }
    html += '    <h3 class="presentation-main-title">' + title + '</h3>\\n';
    html += '    <div class="presentation-content">\\n';
    
    if (presentation.sections && presentation.sections.length > 0) {
        presentation.sections.forEach((section, index) => {
            let sectionClass = 'presentation-section';
            
            // Identifier le type de section
            if (section.titre) {
                if (section.titre.includes('Checklist') || section.titre.includes('🧩')) {
                    sectionClass += ' section-checklist';
                } else if (section.titre.includes('Version longue') || section.titre.includes('🎤')) {
                    sectionClass += ' section-longue';
                } else if (section.titre.includes('Version express') || section.titre.includes('⚡')) {
                    sectionClass += ' section-express';
                } else if (section.titre.includes('Questions') || section.titre.includes('❓')) {
                    sectionClass += ' section-questions';
                } else if (section.titre.includes('mnémo') || section.titre.includes('🎲')) {
                    sectionClass += ' section-mnemo';
                } else if (section.titre.includes('Introduction')) {
                    sectionClass += ' section-intro';
                } else if (section.titre.includes('Synthèse')) {
                    sectionClass += ' section-synthese';
                }
            }
            
            html += '        <div class="' + sectionClass + '">\\n';
            
            // Titre de la section
            if (section.titre) {
                html += '            <h4 class="presentation-section-title">' + section.titre + '</h4>\\n';
            }
            
            // Contenu principal
            if (section.contenu) {
                // Formatter le contenu avec retours à la ligne et paragraphes
                let formattedContent = section.contenu.replace(/\\n\\n/g, '</p><p>').replace(/\\n/g, '<br>');
                html += '            <div class="presentation-content"><p>' + formattedContent + '</p></div>\\n';
            }
            
            // Points
            if (section.points && section.points.length > 0) {
                html += '            <ul class="presentation-points">\\n';
                section.points.forEach(point => {
                    html += '                <li>' + formatHighlightedText(point) + '</li>\\n';
                });
                html += '            </ul>\\n';
            }
            
            // Mnémo amélioré
            if (section.mnemo) {
                html += generateMnemoSection(section.mnemo);
            }
            
            // Sous-sections (pour les questions de l'examinateur)
            if (section.subsections && section.subsections.length > 0) {
                section.subsections.forEach(subsection => {
                    html += '            <div class="presentation-subsection">\\n';
                    
                    if (subsection.titre) {
                        html += '                <h5>' + subsection.titre + '</h5>\\n';
                    }
                    
                    // Points de la sous-section
                    if (subsection.points && subsection.points.length > 0) {
                        html += '                <ul class="presentation-points">\\n';
                        subsection.points.forEach(point => {
                            html += '                    <li>' + formatHighlightedText(point) + '</li>\\n';
                        });
                        html += '                </ul>\\n';
                    }
                    
                    // Mnémo de la sous-section
                    if (subsection.mnemo) {
                        html += generateMnemoSection(subsection.mnemo);
                    }
                    
                    // Tables de la sous-section
                    if (subsection.tables && subsection.tables.length > 0) {
                        subsection.tables.forEach(table => {
                            if (table.titre) {
                                html += '                <h6 class="table-title">' + table.titre + '</h6>\\n';
                            }
                            html += '                <table class="presentation-table">\\n';
                            if (table.colonnes && table.colonnes.length > 0) {
                                html += '                    <thead><tr>\\n';
                                table.colonnes.forEach(col => {
                                    html += '                        <th>' + col + '</th>\\n';
                                });
                                html += '                    </tr></thead>\\n';
                            }
                            if (table.lignes && table.lignes.length > 0) {
                                html += '                    <tbody>\\n';
                                table.lignes.forEach(ligne => {
                                    html += '                        <tr>\\n';
                                    ligne.forEach((cell, cellIndex) => {
                                        let cellClass = cellIndex === 0 ? ' class="first-col"' : '';
                                        html += '                            <td' + cellClass + '>' + formatHighlightedText(cell) + '</td>\\n';
                                    });
                                    html += '                        </tr>\\n';
                                });
                                html += '                    </tbody>\\n';
                            }
                            html += '                </table>\\n';
                        });
                    }
                    
                    // Questions avec réponses améliorées et support complet
                    if (subsection.questions && subsection.questions.length > 0) {
                        html += '                <div class="qa-container">\\n';
                        subsection.questions.forEach((q, qIndex) => {
                            html += '                <div class="presentation-qa">\\n';
                            
                            // Question
                            if (q.question) {
                                html += '                    <div class="presentation-question">\\n';
                                html += '                        <span class="q-number">Q' + (qIndex + 1) + '</span>\\n';
                                html += '                        <span class="q-text">' + formatHighlightedText(q.question) + '</span>\\n';
                                html += '                    </div>\\n';
                            }
                            
                            // Réponse - Gérer tous les formats possibles
                            if (q.reponse) {
                                // Si c'est un objet avec des propriétés spécifiques (immediat, pour, contre, etc.)
                                if (typeof q.reponse === 'object' && !Array.isArray(q.reponse)) {
                                    // Vérifier si c'est un objet avec pour/contre
                                    if (q.reponse.pour || q.reponse.contre) {
                                        html += '                    <div class="presentation-reponse structured">\\n';
                                        if (q.reponse.pour && q.reponse.pour.length > 0) {
                                            html += '                        <div class="reponse-pour">\\n';
                                            html += '                            <div class="arg-title">✅ Arguments POUR</div>\\n';
                                            html += '                            <ul class="arg-list">\\n';
                                            q.reponse.pour.forEach(arg => {
                                                html += '                                <li>' + formatHighlightedText(arg) + '</li>\\n';
                                            });
                                            html += '                            </ul>\\n';
                                            html += '                        </div>\\n';
                                        }
                                        if (q.reponse.contre && q.reponse.contre.length > 0) {
                                            html += '                        <div class="reponse-contre">\\n';
                                            html += '                            <div class="arg-title">❌ Arguments CONTRE</div>\\n';
                                            html += '                            <ul class="arg-list">\\n';
                                            q.reponse.contre.forEach(arg => {
                                                html += '                                <li>' + formatHighlightedText(arg) + '</li>\\n';
                                            });
                                            html += '                            </ul>\\n';
                                            html += '                        </div>\\n';
                                        }
                                        html += '                    </div>\\n';
                                    } else {
                                        // Autres propriétés d'objet (immediat, etc.)
                                        html += '                    <div class="presentation-reponse">\\n';
                                        Object.keys(q.reponse).forEach(key => {
                                            let keyTitle = key.charAt(0).toUpperCase() + key.slice(1);
                                            let keyColor = '';
                                            if (key === 'immediat') {
                                                keyColor = ' style="color: #ff5722; font-weight: bold;"';
                                                keyTitle = '⚡ Traitement immédiat';
                                            } else if (key === 'longTerme') {
                                                keyTitle = '📅 Long terme';
                                            }
                                            
                                            html += '                        <div class="reponse-section">\\n';
                                            html += '                            <strong' + keyColor + '>' + keyTitle + ' :</strong>\\n';
                                            
                                            if (Array.isArray(q.reponse[key])) {
                                                html += '                            <ul>\\n';
                                                q.reponse[key].forEach(item => {
                                                    html += '                                <li>' + formatHighlightedText(item) + '</li>\\n';
                                                });
                                                html += '                            </ul>\\n';
                                            } else {
                                                html += '                            <p>' + formatHighlightedText(q.reponse[key]) + '</p>\\n';
                                            }
                                            html += '                        </div>\\n';
                                        });
                                        html += '                    </div>\\n';
                                    }
                                } else if (Array.isArray(q.reponse)) {
                                    // Si c'est un tableau
                                    html += '                    <div class="presentation-reponse list">\\n';
                                    html += '                        <ul class="response-list">\\n';
                                    q.reponse.forEach(item => {
                                        html += '                            <li>' + formatHighlightedText(item) + '</li>\\n';
                                    });
                                    html += '                        </ul>\\n';
                                    html += '                    </div>\\n';
                                } else {
                                    // Si c'est une chaîne
                                    html += '                    <div class="presentation-reponse text">' + formatHighlightedText(q.reponse) + '</div>\\n';
                                }
                            }
                            
                            // Résultats (si présents)
                            if (q.resultats) {
                                html += '                    <div class="presentation-results">\\n';
                                html += '                        <strong>📊 Résultats :</strong>\\n';
                                if (Array.isArray(q.resultats)) {
                                    html += '                        <ul>\\n';
                                    q.resultats.forEach(resultat => {
                                        html += '                            <li>' + formatHighlightedText(resultat) + '</li>\\n';
                                    });
                                    html += '                        </ul>\\n';
                                } else {
                                    html += '                        <p>' + formatHighlightedText(q.resultats) + '</p>\\n';
                                }
                                html += '                    </div>\\n';
                            }
                            
                            // Analyse (si présente)
                            if (q.analyse) {
                                html += '                    <div class="presentation-analyse">\\n';
                                html += '                        <span class="analyse-icon">💡</span>\\n';
                                html += '                        <span class="analyse-text">' + formatHighlightedText(q.analyse) + '</span>\\n';
                                html += '                    </div>\\n';
                            }
                            
                            // Astuce (si présente)
                            if (q.astuce) {
                                html += '                    <div class="presentation-astuce">\\n';
                                html += '                        <span class="astuce-icon">💡</span>\\n';
                                html += '                        <span class="astuce-text">' + formatHighlightedText(q.astuce) + '</span>\\n';
                                html += '                    </div>\\n';
                            }
                            
                            html += '                </div>\\n'; // Fermer presentation-qa
                        });
                        html += '                </div>\\n'; // Fermer qa-container
                    }
                    
                    html += '            </div>\\n'; // Fermer presentation-subsection
                });
            }
            
            html += '        </div>\\n'; // Fermer presentation-section
        });
    }
    
    // Questions directes au niveau racine
    if (presentation.questions && presentation.questions.length > 0) {
        html += '        <div class="presentation-section section-questions">\\n';
        html += '            <h4 class="presentation-section-title">❓ Questions et Réponses</h4>\\n';
        html += '            <div class="qa-container">\\n';
        presentation.questions.forEach((q, qIndex) => {
            html += '            <div class="presentation-qa">\\n';
            if (q.question) {
                html += '                <div class="presentation-question">\\n';
                html += '                    <span class="q-text">' + formatHighlightedText(q.question) + '</span>\\n';
                html += '                </div>\\n';
            }
            if (q.reponse) {
                html += '                <div class="presentation-reponse text">' + formatHighlightedText(q.reponse) + '</div>\\n';
            }
            if (q.astuce) {
                html += '                <div class="presentation-astuce">\\n';
                html += '                    <span class="astuce-icon">💡</span>\\n';
                html += '                    <span class="astuce-text">' + formatHighlightedText(q.astuce) + '</span>\\n';
                html += '                </div>\\n';
            }
            html += '            </div>\\n';
        });
        html += '            </div>\\n';
        html += '        </div>\\n';
    }
    
    html += '    </div>\\n'; // Fermer presentation-content
    html += '</div>\\n'; // Fermer presentation-patient
    
    return html;
}'''

# Trouver et remplacer l'ancienne fonction
import re

def find_function_end(content, start_pos):
    brace_count = 1
    pos = start_pos + content[start_pos:].find('{') + 1
    
    while brace_count > 0 and pos < len(content):
        if content[pos] == '{':
            brace_count += 1
        elif content[pos] == '}':
            brace_count -= 1
        pos += 1
    
    return pos

# Trouver le début de la fonction
match = re.search(r'function generatePresentationPatientSection\(presentation\) \{', content)
if match:
    start = match.start()
    end = find_function_end(content, start)
    
    # Remplacer la fonction
    new_content = content[:start] + improved_function + content[end:]
    
    # Sauvegarder
    with open('Chablon/Generateur_de_Grilles_ECOS.html', 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"✓ Fonction generatePresentationPatientSection mise à jour avec support complet")
    print(f"  - Support pour reponse.immediat")
    print(f"  - Support pour propriété 'astuce'")
    print(f"  - Support pour propriété 'resultats'")
else:
    print("✗ Fonction generatePresentationPatientSection non trouvée")