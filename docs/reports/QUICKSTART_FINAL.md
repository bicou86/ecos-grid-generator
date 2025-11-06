# 🚀 QUICKSTART - Système ECOS v3.0

## ✅ Installation Complète Terminée!

Votre système ECOS est maintenant entièrement configuré avec:
- **374 cas cliniques** harmonisés et enrichis
- **748 fichiers JSON** pour la formation (cas + feuilles-porte)
- **Interface web interactive** pour consultation et recherche
- **17 catégories médicales** avec codification SSP PROFILES

## 🎯 Démarrage en 1 Commande

```bash
./start_ecos.sh
```

Choisissez ensuite:
- **Option 1** : Interface interactive (recommandé)
- **Option 2** : Page de test des cas
- **Option 3** : Régénérer les fichiers

## 🌐 Interface Web Interactive

### Démarrage Manuel
```bash
cd platform/ecos-viewer
python3 server.py
```

Puis ouvrez: http://localhost:8080

### Fonctionnalités
- 🔍 **Recherche** par diagnostic, symptôme, SSP
- 🎛️ **Filtres** par année, catégorie, complétude
- 📊 **3 vues** : Cartes, Tableau, Détaillée
- 📈 **Graphiques** interactifs
- 💾 **Export** en CSV, JSON, PDF

## 📚 Utilisation pour Formation

### 1. Sélectionner un Cas
- Ouvrir `test_cases_ecos.html`
- Choisir un cas par complétude/catégorie
- Cliquer sur "📊 Générer Grille"

### 2. Mode Examen ECOS
- Timer 13 minutes automatique
- Scoring en temps réel
- Export PDF du résultat

### 3. Mode Révision
- Pas de timer
- Indices disponibles
- Identification des lacunes

## 📁 Fichiers Clés

| Fichier | Description | Utilisation |
|---------|-------------|-------------|
| `ECOS_*_FINAL_*.csv` | Base de données complète | Analyses statistiques |
| `ECOS_*_FINAL_*.xlsx` | Version Excel | Consultation manuelle |
| `json_files_v3/*.json` | Cas individuels | Génération de grilles |
| `test_cases_ecos.html` | Page de test | Accès rapide aux cas |
| `ECOS_Master_Index.json` | Index principal | API/Intégration |

## 🔧 Personnalisation

### Modifier un Cas
1. Éditer le fichier JSON dans `json_files_v3/`
2. Structure à respecter:
```json
{
  "title": "...",
  "context": {...},
  "sections": {
    "anamnese": {...},
    "examen": {...},
    "management": {...}
  }
}
```

### Ajouter un Nouveau Cas
```python
python3 scripts/export_to_ecos_platform.py
# Modifiez d'abord le CSV source
```

## 📊 Statistiques Actuelles

- **Total**: 374 cas
- **Haute qualité (≥50%)**: 20 cas
- **Catégories**: 17 spécialités
- **Période**: 2011-2025
- **Codes SSP**: 265 codes standardisés
- **Taux de complétude moyen**: ~40%

### Top 3 Catégories
1. Cardiovasculaire (10.7%)
2. Gastroentérologie (10.2%)
3. Neurologie (10.2%)

## 🆘 Résolution Rapide

| Problème | Solution |
|----------|----------|
| Interface ne démarre pas | Vérifier Python 3 installé |
| Données non visibles | Relancer `./start_ecos.sh` |
| Export PDF échoue | Installer `jspdf` |
| Port 8080 occupé | Modifier dans `server.py` |

## 💡 Commandes Utiles

```bash
# Voir tous les cas haute qualité
grep "Score_Complétude_Pct" data-stat/*FINAL*.csv | awk -F';' '$NF >= 50'

# Compter les cas par catégorie
cut -d';' -f3 data-stat/*FINAL*.csv | sort | uniq -c

# Chercher un diagnostic spécifique
grep -i "diabète" json_files_v3/*.json

# Lancer directement le générateur
open Chablon/Generateur_de_Grilles_ECOS.html
```

## 🎓 Pour les Formateurs

1. **Préparer une Session**
   - Sélectionner les cas via l'interface
   - Exporter en JSON
   - Charger dans le générateur

2. **Mode Examen**
   - Utiliser les feuilles-porte (`feuille-porte/json/`)
   - Activer le timer 13 minutes
   - Désactiver les aides

3. **Évaluation**
   - Scoring automatique (4×25%)
   - Export PDF des résultats
   - Statistiques de groupe disponibles

## ✨ Prochaines Étapes

- [ ] Enrichir les 354 cas restants
- [ ] Ajouter des images médicales
- [ ] Créer des vidéos patient standardisé
- [ ] Intégrer avec LMS existant
- [ ] Développer app mobile

---

**Support**: Consultez `ECOS_DOCUMENTATION.md` pour plus de détails
**Version**: 3.0 | **Date**: 24/10/2025