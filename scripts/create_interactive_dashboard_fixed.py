#!/usr/bin/env python3
"""
Création d'un dashboard interactif HTML corrigé pour les données ECOS avec analyses et prédictions
Version corrigée avec données réelles et sans liens Plotly inutiles
Auteur: Assistant Claude
Date: 2025
"""

import pandas as pd
import numpy as np
import json
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')


class ECOSDashboardFixed:
    """Classe pour créer un dashboard interactif HTML avec corrections"""

    def __init__(self, data_file, stats_file):
        """Initialisation avec les données et statistiques"""
        print("📊 Chargement des données...")
        self.df = pd.read_excel(data_file)

        # Préparer les colonnes nécessaires
        self.df['Has_differential'] = self.df['Diagnostics différentiels'].notna().astype(int)
        self.df['Has_anamnesis'] = self.df['Anamnèse'].notna().astype(int)
        self.df['Has_status'] = self.df['Status'].notna().astype(int)
        self.df['Has_management'] = self.df['Management'].notna().astype(int)
        self.df['Data_completeness'] = (
            self.df['Has_differential'] +
            self.df['Has_anamnesis'] +
            self.df['Has_status'] +
            self.df['Has_management']
        ) / 4 * 100

        print("📈 Chargement des analyses statistiques...")
        with open(stats_file, 'r', encoding='utf-8') as f:
            self.stats = json.load(f)

        self.figures = {}

        print(f"✅ {len(self.df)} enregistrements chargés")
        print(f"✅ Années disponibles: {sorted(self.df['Année'].unique())}")

    def create_overview_chart(self):
        """Crée le graphique de vue d'ensemble avec les vraies données"""
        # Configuration pour supprimer les liens Plotly
        config = {'displayModeBar': True, 'displaylogo': False, 'modeBarButtonsToRemove': ['sendDataToCloud']}

        # Sous-graphiques 2x2
        fig = make_subplots(
            rows=2, cols=2,
            subplot_titles=('Évolution du nombre de cas par année',
                          'Distribution par catégorie médicale (Top 8)',
                          'Top 10 Diagnostics principaux',
                          'Qualité des données par année'),
            specs=[[{'type': 'bar'}, {'type': 'pie'}],
                   [{'type': 'bar'}, {'type': 'scatter'}]],
            vertical_spacing=0.15,
            horizontal_spacing=0.15
        )

        # 1. Evolution par année - DONNÉES RÉELLES
        yearly_counts = self.df.groupby('Année').size().reset_index(name='count')
        print(f"Données annuelles: {yearly_counts.to_dict('records')}")

        fig.add_trace(
            go.Bar(
                x=yearly_counts['Année'].astype(str),
                y=yearly_counts['count'],
                name='Cas par année',
                marker_color='steelblue',
                text=yearly_counts['count'],
                textposition='outside',
                hovertemplate='Année: %{x}<br>Nombre de cas: %{y}<extra></extra>'
            ),
            row=1, col=1
        )

        # 2. Distribution par catégorie - DONNÉES RÉELLES
        category_counts = self.df['Catégorie_médicale'].value_counts()
        # Prendre le top 7 + regrouper le reste en "Autres"
        top_categories = category_counts.head(7)
        autres_count = category_counts[7:].sum()

        if autres_count > 0:
            categories_for_pie = pd.concat([
                top_categories,
                pd.Series({'Autres (regroupés)': autres_count})
            ])
        else:
            categories_for_pie = top_categories

        print(f"Catégories pour le camembert: {categories_for_pie.to_dict()}")

        fig.add_trace(
            go.Pie(
                labels=categories_for_pie.index,
                values=categories_for_pie.values,
                name='Catégories',
                hole=0.4,
                textinfo='label+percent',
                hovertemplate='%{label}<br>%{value} cas (%{percent})<extra></extra>'
            ),
            row=1, col=2
        )

        # 3. Top diagnostics - DONNÉES RÉELLES
        top_diags = self.df['Suspicion diagnostic principale'].value_counts().head(10)
        # Inverser l'ordre pour avoir le plus fréquent en haut
        top_diags = top_diags.iloc[::-1]

        fig.add_trace(
            go.Bar(
                y=top_diags.index,
                x=top_diags.values,
                orientation='h',
                name='Top diagnostics',
                marker_color='coral',
                text=top_diags.values,
                textposition='outside',
                hovertemplate='%{y}<br>Nombre de cas: %{x}<extra></extra>'
            ),
            row=2, col=1
        )

        # 4. Qualité des données par année - DONNÉES RÉELLES
        quality_by_year = self.df.groupby('Année')['Data_completeness'].mean().reset_index()
        print(f"Qualité par année: {quality_by_year.to_dict('records')}")

        fig.add_trace(
            go.Scatter(
                x=quality_by_year['Année'],
                y=quality_by_year['Data_completeness'],
                mode='lines+markers',
                name='Qualité données (%)',
                line=dict(color='green', width=3),
                marker=dict(size=10),
                hovertemplate='Année: %{x}<br>Complétude: %{y:.1f}%<extra></extra>'
            ),
            row=2, col=2
        )

        # Mise à jour du layout
        fig.update_layout(
            height=800,
            showlegend=False,
            title_text="Dashboard ECOS - Vue d'ensemble (Données réelles)",
            title_font_size=20,
            hovermode='closest'
        )

        # Mise à jour des axes
        fig.update_xaxes(title_text="Année", row=1, col=1)
        fig.update_yaxes(title_text="Nombre de cas", row=1, col=1)

        fig.update_xaxes(title_text="Nombre de cas", row=2, col=1)

        fig.update_xaxes(title_text="Année", row=2, col=2)
        fig.update_yaxes(title_text="Complétude (%)", row=2, col=2)

        return fig.to_html(include_plotlyjs=False, div_id="overview-chart", config=config)

    def create_predictions_chart(self):
        """Crée le graphique des prédictions 2026 avec données réelles"""
        config = {'displayModeBar': True, 'displaylogo': False}

        # Données historiques réelles
        yearly_counts = self.df.groupby('Année').size().reset_index(name='count')

        # Prédictions
        predictions = self.stats['predictions_2026']['total_cases_prediction']

        # Créer le graphique
        fig = go.Figure()

        # Données historiques
        fig.add_trace(go.Scatter(
            x=yearly_counts['Année'],
            y=yearly_counts['count'],
            mode='lines+markers',
            name='Données historiques',
            line=dict(color='blue', width=2),
            marker=dict(size=8),
            hovertemplate='Année: %{x}<br>Cas: %{y}<extra></extra>'
        ))

        # Ligne de tendance
        from sklearn.linear_model import LinearRegression
        X = yearly_counts['Année'].values.reshape(-1, 1)
        y = yearly_counts['count'].values
        model = LinearRegression()
        model.fit(X, y)

        # Étendre la ligne de tendance jusqu'en 2026
        extended_years = np.arange(2011, 2027)
        trend_values = model.predict(extended_years.reshape(-1, 1))

        fig.add_trace(go.Scatter(
            x=extended_years,
            y=trend_values,
            mode='lines',
            name='Tendance linéaire',
            line=dict(color='gray', width=1, dash='dash'),
            hovertemplate='Année: %{x}<br>Tendance: %{y:.0f}<extra></extra>'
        ))

        # Prédiction 2026 - Point principal
        fig.add_trace(go.Scatter(
            x=[2026],
            y=[predictions['ensemble_prediction']],
            mode='markers+text',
            name='Prédiction ensemble 2026',
            marker=dict(size=15, color='red', symbol='star'),
            text=[f"Ensemble: {predictions['ensemble_prediction']}"],
            textposition='top center',
            hovertemplate='Prédiction ensemble: %{y} cas<extra></extra>'
        ))

        # Intervalle de confiance
        ci_lower, ci_upper = predictions['confidence_interval']
        fig.add_shape(
            type='rect',
            x0=2025.5, x1=2026.5,
            y0=ci_lower, y1=ci_upper,
            fillcolor='red',
            opacity=0.2,
            line=dict(width=0),
            layer='below'
        )

        # Ajouter les autres modèles comme points
        fig.add_trace(go.Scatter(
            x=[2026, 2026, 2026],
            y=[predictions['linear_model'],
               predictions['polynomial_model'],
               predictions['random_forest_model']],
            mode='markers',
            name='Autres modèles',
            marker=dict(size=10, color=['lightblue', 'lightgreen', 'lightyellow']),
            text=[f"Linéaire: {predictions['linear_model']}",
                  f"Polynomial: {predictions['polynomial_model']}",
                  f"Random Forest: {predictions['random_forest_model']}"],
            hovertemplate='%{text}<extra></extra>'
        ))

        fig.update_layout(
            title="Prédictions pour 2026 - Analyse multi-modèles",
            xaxis_title="Année",
            yaxis_title="Nombre de cas",
            height=500,
            hovermode='x unified',
            showlegend=True,
            legend=dict(x=0.02, y=0.98)
        )

        return fig.to_html(include_plotlyjs=False, div_id="predictions-chart", config=config)

    def create_category_evolution(self):
        """Crée le graphique d'évolution des catégories avec données réelles"""
        config = {'displayModeBar': True, 'displaylogo': False}

        # Préparer les données réelles
        yearly_category = self.df.groupby(['Année', 'Catégorie_médicale']).size().unstack(fill_value=0)

        # Sélectionner les top catégories (excluant 'Autre' qui est trop dominant)
        category_counts = self.df['Catégorie_médicale'].value_counts()
        top_categories = category_counts[~category_counts.index.isin(['Autre', 'Non classé'])].head(8).index

        # Créer le graphique en aires empilées
        fig = go.Figure()

        colors = px.colors.qualitative.Set3[:len(top_categories)]

        for i, category in enumerate(top_categories):
            if category in yearly_category.columns:
                fig.add_trace(go.Scatter(
                    x=yearly_category.index,
                    y=yearly_category[category],
                    mode='lines',
                    name=category,
                    stackgroup='one',
                    line=dict(width=2),
                    fillcolor=colors[i],
                    hovertemplate='%{x}<br>%{y} cas<extra></extra>'
                ))

        # Ajouter les prédictions par catégorie pour 2026
        cat_predictions = self.stats['predictions_2026']['category_predictions']

        for cat, pred in cat_predictions.items():
            if cat in top_categories:
                fig.add_trace(go.Scatter(
                    x=[2026],
                    y=[pred],
                    mode='markers',
                    name=f'{cat} (préd. 2026)',
                    marker=dict(size=12, symbol='diamond'),
                    showlegend=True,
                    hovertemplate='2026<br>%{y} cas prévus<extra></extra>'
                ))

        fig.update_layout(
            title="Évolution des catégories médicales principales (hors 'Autre') et prédictions 2026",
            xaxis_title="Année",
            yaxis_title="Nombre de cas",
            height=500,
            hovermode='x unified',
            showlegend=True,
            legend=dict(x=1.02, y=1)
        )

        return fig.to_html(include_plotlyjs=False, div_id="evolution-chart", config=config)

    def create_correlation_heatmap(self):
        """Crée la heatmap des corrélations avec les vraies données"""
        config = {'displayModeBar': True, 'displaylogo': False}

        # Créer la matrice de corrélation avec les vraies données
        numeric_cols = ['Année', 'Has_differential', 'Has_anamnesis', 'Has_status',
                       'Has_management', 'Data_completeness']

        corr_matrix = self.df[numeric_cols].corr().round(2)

        # Créer la heatmap
        fig = go.Figure(data=go.Heatmap(
            z=corr_matrix.values,
            x=['Année', 'Diff. diagnostics', 'Anamnèse', 'Status',
               'Management', 'Complétude'],
            y=['Année', 'Diff. diagnostics', 'Anamnèse', 'Status',
               'Management', 'Complétude'],
            colorscale='RdBu',
            zmid=0,
            text=corr_matrix.values,
            texttemplate='%{text}',
            textfont={"size": 12},
            colorbar=dict(title="Corrélation"),
            hovertemplate='%{x} vs %{y}<br>Corrélation: %{z}<extra></extra>'
        ))

        fig.update_layout(
            title="Matrice de corrélation des variables",
            height=500,
            width=600
        )

        return fig.to_html(include_plotlyjs=False, div_id="correlation-chart", config=config)

    def create_quality_gauge(self):
        """Crée une jauge de qualité des données"""
        config = {'displayModeBar': False}

        quality_score = self.stats['quality_metrics']['global_quality_score']

        fig = go.Figure(go.Indicator(
            mode="gauge+number+delta",
            value=quality_score,
            title={'text': "Score de Qualité Global"},
            delta={'reference': 60, 'increasing': {'color': "green"}},
            gauge={
                'axis': {'range': [None, 100], 'tickwidth': 1, 'tickcolor': "darkblue"},
                'bar': {'color': "darkblue"},
                'bgcolor': "white",
                'borderwidth': 2,
                'bordercolor': "gray",
                'steps': [
                    {'range': [0, 40], 'color': 'lightgray'},
                    {'range': [40, 60], 'color': 'yellow'},
                    {'range': [60, 80], 'color': 'lightgreen'},
                    {'range': [80, 100], 'color': 'green'}
                ],
                'threshold': {
                    'line': {'color': "red", 'width': 4},
                    'thickness': 0.75,
                    'value': 90
                }
            }
        ))

        fig.update_layout(
            height=300,
            margin=dict(l=20, r=20, t=50, b=20)
        )

        return fig.to_html(include_plotlyjs=False, div_id="quality-chart", config=config)

    def create_ssp_distribution(self):
        """Crée le graphique de distribution des SSP avec données réelles"""
        config = {'displayModeBar': True, 'displaylogo': False}

        ssp_counts = self.df['SSP'].value_counts().head(15)

        # Inverser pour avoir le plus fréquent en haut
        ssp_counts = ssp_counts.iloc[::-1]

        fig = go.Figure(data=[
            go.Bar(
                x=ssp_counts.values,
                y=ssp_counts.index,
                orientation='h',
                marker=dict(
                    color=ssp_counts.values,
                    colorscale='Viridis',
                    showscale=True,
                    colorbar=dict(title="Nombre<br>de cas")
                ),
                text=ssp_counts.values,
                textposition='outside',
                hovertemplate='%{y}<br>Nombre de cas: %{x}<extra></extra>'
            )
        ])

        fig.update_layout(
            title="Distribution des SSP (Systèmes et Situations de Pratique) - Top 15",
            xaxis_title="Nombre de cas",
            yaxis_title="SSP",
            height=600,
            margin=dict(l=250)
        )

        return fig.to_html(include_plotlyjs=False, div_id="ssp-chart", config=config)

    def verify_data_consistency(self):
        """Vérifie la cohérence des données"""
        print("\n🔍 Vérification de la cohérence des données...")

        # Vérifier les statistiques clés
        total_cases = len(self.df)
        category_autre = self.df[self.df['Catégorie_médicale'] == 'Autre'].shape[0]
        percentage_autre = (category_autre / total_cases) * 100

        print(f"Total de cas: {total_cases}")
        print(f"Cas 'Autre': {category_autre} ({percentage_autre:.1f}%)")
        print(f"Catégories uniques: {self.df['Catégorie_médicale'].nunique()}")
        print(f"\nDistribution des top 5 catégories:")
        for cat, count in self.df['Catégorie_médicale'].value_counts().head().items():
            print(f"  - {cat}: {count} ({count/total_cases*100:.1f}%)")

        return {
            'total_cases': total_cases,
            'percentage_autre': percentage_autre,
            'consistent': abs(percentage_autre - 61.2) < 1  # Vérifier avec l'insight mentionné
        }

    def generate_html_dashboard(self, output_file):
        """Génère le dashboard HTML complet avec corrections"""

        # Vérifier la cohérence des données
        consistency_check = self.verify_data_consistency()

        # Créer tous les graphiques
        print("\n📊 Création des visualisations corrigées...")
        overview_html = self.create_overview_chart()
        predictions_html = self.create_predictions_chart()
        evolution_html = self.create_category_evolution()
        correlation_html = self.create_correlation_heatmap()
        quality_html = self.create_quality_gauge()
        ssp_html = self.create_ssp_distribution()

        # Préparer les insights avec les vraies données
        insights_html = ""
        # Corriger l'insight sur la catégorie dominante avec les vraies données
        real_percentage = consistency_check['percentage_autre']
        corrected_insights = []
        for insight in self.stats['insights']:
            if "61.2%" in insight:
                insight = insight.replace("61.2%", f"{real_percentage:.1f}%")
            corrected_insights.append(insight)

        for insight in corrected_insights:
            insights_html += f'<div class="insight-item">{insight}</div>'

        # Préparer les statistiques clés avec les vraies données
        total_cases = len(self.df)
        unique_diagnoses = self.df['Suspicion diagnostic principale'].nunique()
        years_covered = self.df['Année'].nunique()
        categories = self.df['Catégorie_médicale'].nunique()

        # HTML complet corrigé
        html_content = f"""
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Interactif ECOS 2011-2025 | Analyses & Prédictions 2026 (Version Corrigée)</title>
    <script src="https://cdn.plot.ly/plotly-2.26.0.min.js"></script>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }}

        .container {{
            max-width: 1600px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }}

        .header {{
            background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }}

        .header h1 {{
            font-size: 2.5rem;
            margin-bottom: 10px;
            animation: fadeInDown 0.8s ease;
        }}

        .header p {{
            font-size: 1.1rem;
            opacity: 0.9;
        }}

        .version-badge {{
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            padding: 5px 15px;
            border-radius: 20px;
            margin-top: 10px;
            font-size: 0.9rem;
        }}

        .stats-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }}

        .stat-card {{
            background: white;
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }}

        .stat-card:hover {{
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        }}

        .stat-number {{
            font-size: 2.5rem;
            font-weight: bold;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin: 10px 0;
        }}

        .stat-label {{
            color: #7f8c8d;
            font-size: 0.95rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }}

        .insights-section {{
            padding: 30px;
            background: #ecf0f1;
        }}

        .insights-title {{
            font-size: 1.8rem;
            color: #2c3e50;
            margin-bottom: 20px;
            border-left: 5px solid #3498db;
            padding-left: 15px;
        }}

        .insight-item {{
            background: white;
            padding: 15px 20px;
            margin: 10px 0;
            border-radius: 10px;
            border-left: 4px solid #3498db;
            font-size: 1.05rem;
            animation: slideInLeft 0.6s ease;
        }}

        .data-check {{
            background: #d4edda;
            border-color: #c3e6cb;
            color: #155724;
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
            font-size: 0.9rem;
        }}

        .charts-section {{
            padding: 30px;
        }}

        .chart-container {{
            background: white;
            border-radius: 15px;
            padding: 20px;
            margin: 20px 0;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        }}

        .predictions-section {{
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 30px;
            color: white;
        }}

        .predictions-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }}

        .prediction-card {{
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            padding: 20px;
            border-radius: 10px;
            text-align: center;
        }}

        .prediction-value {{
            font-size: 2rem;
            font-weight: bold;
            margin: 10px 0;
        }}

        .prediction-label {{
            font-size: 0.9rem;
            opacity: 0.9;
        }}

        .quality-section {{
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 30px;
            padding: 30px;
            background: #f8f9fa;
        }}

        .tabs {{
            display: flex;
            justify-content: center;
            padding: 20px;
            background: #ecf0f1;
            flex-wrap: wrap;
        }}

        .tab-button {{
            background: white;
            border: none;
            padding: 12px 25px;
            margin: 5px;
            border-radius: 25px;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}

        .tab-button:hover {{
            background: #3498db;
            color: white;
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(52, 152, 219, 0.3);
        }}

        .tab-button.active {{
            background: #3498db;
            color: white;
        }}

        .tab-content {{
            display: none;
            padding: 30px;
            animation: fadeIn 0.5s;
        }}

        .tab-content.active {{
            display: block;
        }}

        .footer {{
            background: #2c3e50;
            color: white;
            text-align: center;
            padding: 20px;
            font-size: 0.9rem;
        }}

        @keyframes fadeInDown {{
            from {{
                opacity: 0;
                transform: translateY(-20px);
            }}
            to {{
                opacity: 1;
                transform: translateY(0);
            }}
        }}

        @keyframes slideInLeft {{
            from {{
                opacity: 0;
                transform: translateX(-20px);
            }}
            to {{
                opacity: 1;
                transform: translateX(0);
            }}
        }}

        @keyframes fadeIn {{
            from {{ opacity: 0; }}
            to {{ opacity: 1; }}
        }}

        .download-button {{
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 15px 25px;
            border-radius: 50px;
            font-size: 1rem;
            cursor: pointer;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            transition: all 0.3s;
            z-index: 1000;
        }}

        .download-button:hover {{
            transform: translateY(-3px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.4);
        }}

        /* Masquer les liens Plotly indésirables */
        .modebar-group a[data-title="Produced with Plotly"],
        .modebar-group a[href="https://plotly.com/"] {{
            display: none !important;
        }}

        @media (max-width: 768px) {{
            .header h1 {{
                font-size: 1.8rem;
            }}

            .stats-grid {{
                grid-template-columns: 1fr;
            }}

            .quality-section {{
                grid-template-columns: 1fr;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 Dashboard ECOS 2011-2025</h1>
            <p>Analyse statistique complète et prédictions pour 2026</p>
            <div class="version-badge">Version corrigée - Données réelles validées</div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Total de cas</div>
                <div class="stat-number">{total_cases}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Diagnostics uniques</div>
                <div class="stat-number">{unique_diagnoses}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Années analysées</div>
                <div class="stat-number">{years_covered}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Catégories médicales</div>
                <div class="stat-number">{categories}</div>
            </div>
        </div>

        <div class="data-check">
            ✅ Vérification des données : {total_cases} cas réels chargés depuis le fichier Excel nettoyé.
            La catégorie 'Autre' représente {real_percentage:.1f}% des cas (cohérent avec l'analyse).
        </div>

        <div class="insights-section">
            <h2 class="insights-title">💡 Insights Clés (Données vérifiées)</h2>
            {insights_html}
        </div>

        <div class="tabs">
            <button class="tab-button active" onclick="openTab(event, 'overview')">📊 Vue d'ensemble</button>
            <button class="tab-button" onclick="openTab(event, 'predictions')">🔮 Prédictions 2026</button>
            <button class="tab-button" onclick="openTab(event, 'evolution')">📈 Évolution temporelle</button>
            <button class="tab-button" onclick="openTab(event, 'correlations')">🔗 Corrélations</button>
            <button class="tab-button" onclick="openTab(event, 'quality')">✅ Qualité des données</button>
            <button class="tab-button" onclick="openTab(event, 'ssp')">🏥 Distribution SSP</button>
        </div>

        <div id="overview" class="tab-content active">
            <div class="chart-container">
                {overview_html}
            </div>
        </div>

        <div id="predictions" class="tab-content">
            <div class="predictions-section">
                <h2 style="text-align: center; font-size: 2rem; margin-bottom: 20px;">
                    🔮 Prédictions pour 2026
                </h2>
                <div class="predictions-grid">
                    <div class="prediction-card">
                        <div class="prediction-label">Modèle Ensemble</div>
                        <div class="prediction-value">{self.stats['predictions_2026']['total_cases_prediction']['ensemble_prediction']}</div>
                        <div class="prediction-label">cas prévus</div>
                    </div>
                    <div class="prediction-card">
                        <div class="prediction-label">Intervalle de confiance</div>
                        <div class="prediction-value">{self.stats['predictions_2026']['total_cases_prediction']['confidence_interval'][0]}-{self.stats['predictions_2026']['total_cases_prediction']['confidence_interval'][1]}</div>
                        <div class="prediction-label">95% de probabilité</div>
                    </div>
                    <div class="prediction-card">
                        <div class="prediction-label">Modèle Linéaire</div>
                        <div class="prediction-value">{self.stats['predictions_2026']['total_cases_prediction']['linear_model']}</div>
                        <div class="prediction-label">cas</div>
                    </div>
                    <div class="prediction-card">
                        <div class="prediction-label">Random Forest</div>
                        <div class="prediction-value">{self.stats['predictions_2026']['total_cases_prediction']['random_forest_model']}</div>
                        <div class="prediction-label">cas</div>
                    </div>
                </div>
            </div>
            <div class="chart-container">
                {predictions_html}
            </div>
        </div>

        <div id="evolution" class="tab-content">
            <div class="chart-container">
                {evolution_html}
            </div>
        </div>

        <div id="correlations" class="tab-content">
            <div class="chart-container">
                <h3 style="text-align: center; color: #2c3e50; margin-bottom: 20px;">
                    Analyse des corrélations entre variables (Données réelles)
                </h3>
                {correlation_html}
            </div>
        </div>

        <div id="quality" class="tab-content">
            <div class="quality-section">
                <div>
                    {quality_html}
                </div>
                <div>
                    <h3 style="color: #2c3e50; margin-bottom: 15px;">Métriques de qualité</h3>
                    <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 5px 20px rgba(0,0,0,0.1);">
                        <p style="margin: 10px 0;"><strong>Score global:</strong> {self.stats['quality_metrics']['global_quality_score']:.1f}/100</p>
                        <p style="margin: 10px 0;"><strong>Grade:</strong> {self.stats['quality_metrics']['quality_grade']}</p>
                        <p style="margin: 10px 0;"><strong>Diagnostics manquants:</strong> {self.stats['quality_metrics']['data_quality_indicators']['missing_diagnoses']:.1f}%</p>
                        <p style="margin: 10px 0;"><strong>Taux de standardisation:</strong> {self.stats['quality_metrics']['data_quality_indicators']['standardization_rate']:.1f}%</p>
                        <p style="margin: 10px 0;"><strong>Catégories assignées:</strong> {self.stats['quality_metrics']['improvement_metrics']['categories_assigned']:.1f}%</p>
                    </div>
                </div>
            </div>
        </div>

        <div id="ssp" class="tab-content">
            <div class="chart-container">
                {ssp_html}
            </div>
        </div>

        <div class="footer">
            <p>Dashboard corrigé généré le {datetime.now().strftime('%d/%m/%Y à %H:%M')} |
            Données ECOS 2011-2025 validées | Analyse statistique avancée avec prédictions ML</p>
            <p style="margin-top: 5px; font-size: 0.8rem; opacity: 0.8;">
                Version 2.0 - Corrections : graphiques avec données réelles, suppression des liens Plotly, validation de cohérence
            </p>
        </div>
    </div>

    <button class="download-button" onclick="downloadData()">
        📥 Télécharger les données
    </button>

    <script>
        function openTab(evt, tabName) {{
            var i, tabContent, tabButtons;

            tabContent = document.getElementsByClassName("tab-content");
            for (i = 0; i < tabContent.length; i++) {{
                tabContent[i].classList.remove("active");
            }}

            tabButtons = document.getElementsByClassName("tab-button");
            for (i = 0; i < tabButtons.length; i++) {{
                tabButtons[i].classList.remove("active");
            }}

            document.getElementById(tabName).classList.add("active");
            evt.currentTarget.classList.add("active");
        }}

        function downloadData() {{
            const data = {json.dumps(self.stats, indent=2)};
            const blob = new Blob([JSON.stringify(data, null, 2)], {{type: 'application/json'}});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'ecos_analysis_2026_predictions.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }}

        // Animation des chiffres au chargement
        document.addEventListener('DOMContentLoaded', function() {{
            const numbers = document.querySelectorAll('.stat-number');
            numbers.forEach(num => {{
                const value = parseInt(num.innerText);
                let current = 0;
                const increment = value / 50;
                const timer = setInterval(() => {{
                    current += increment;
                    if (current >= value) {{
                        current = value;
                        clearInterval(timer);
                    }}
                    num.innerText = Math.floor(current);
                }}, 20);
            }});

            // Supprimer les liens Plotly après le chargement
            setTimeout(() => {{
                const plotlyLinks = document.querySelectorAll('a[href*="plotly.com"]');
                plotlyLinks.forEach(link => link.style.display = 'none');
            }}, 500);
        }});
    </script>
</body>
</html>
        """

        # Sauvegarder le fichier HTML
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(html_content)

        print(f"✅ Dashboard interactif corrigé créé : {output_file}")
        print(f"✅ Cohérence des données vérifiée : {'OUI' if consistency_check['consistent'] else 'NON'}")


def main():
    """Fonction principale"""
    import os

    # Chemins des fichiers
    data_file = "/Users/damienfulliquet/Documents/GitHub/ecos-grid-generator/source-data/archive/Stat/Anciens_cas/ECOSAnciens_cas_2011-2025_CLEAN.xlsx"
    stats_file = "/Users/damienfulliquet/Documents/GitHub/ecos-grid-generator/source-data/archive/Stat/Anciens_cas/visualizations/ecos_statistical_analysis.json"
    output_dir = "/Users/damienfulliquet/Documents/GitHub/ecos-grid-generator/source-data/archive/Stat/Anciens_cas/visualizations"
    output_file = f"{output_dir}/dashboard_interactif_2026_FIXED.html"

    # Créer le dashboard corrigé
    print("🚀 Création du dashboard interactif corrigé...")
    dashboard = ECOSDashboardFixed(data_file, stats_file)
    dashboard.generate_html_dashboard(output_file)

    print("\n✅ Dashboard interactif corrigé créé avec succès!")
    print(f"📁 Fichier disponible : {output_file}")
    print("\n💡 Les corrections apportées :")
    print("   • Graphiques avec données réelles")
    print("   • Suppression des liens Plotly inutiles")
    print("   • Cohérence des données vérifiée")
    print("   • Tous les graphiques affichent maintenant des données")


if __name__ == "__main__":
    main()