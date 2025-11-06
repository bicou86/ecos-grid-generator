#!/usr/bin/env python3
"""
Création d'un dashboard interactif HTML pour les données ECOS avec analyses et prédictions
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


class ECOSDashboard:
    """Classe pour créer un dashboard interactif HTML"""

    def __init__(self, data_file, stats_file):
        """Initialisation avec les données et statistiques"""
        print("📊 Chargement des données...")
        self.df = pd.read_excel(data_file)

        print("📈 Chargement des analyses statistiques...")
        with open(stats_file, 'r', encoding='utf-8') as f:
            self.stats = json.load(f)

        self.figures = {}

    def create_overview_chart(self):
        """Crée le graphique de vue d'ensemble"""
        # Sous-graphiques 2x2
        fig = make_subplots(
            rows=2, cols=2,
            subplot_titles=('Évolution du nombre de cas par année',
                          'Distribution par catégorie médicale',
                          'Top 10 Diagnostics principaux',
                          'Qualité des données par année'),
            specs=[[{'type': 'bar'}, {'type': 'pie'}],
                   [{'type': 'bar'}, {'type': 'scatter'}]]
        )

        # 1. Evolution par année
        yearly_counts = self.df.groupby('Année').size()
        fig.add_trace(
            go.Bar(x=yearly_counts.index, y=yearly_counts.values,
                  name='Cas par année',
                  marker_color='steelblue',
                  text=yearly_counts.values,
                  textposition='outside'),
            row=1, col=1
        )

        # 2. Distribution par catégorie
        category_counts = self.df['Catégorie_médicale'].value_counts()
        fig.add_trace(
            go.Pie(labels=category_counts.index[:8],  # Top 8
                  values=category_counts.values[:8],
                  name='Catégories',
                  hole=0.4),
            row=1, col=2
        )

        # 3. Top diagnostics
        top_diags = self.df['Suspicion diagnostic principale'].value_counts().head(10)
        fig.add_trace(
            go.Bar(y=top_diags.index[::-1], x=top_diags.values[::-1],
                  orientation='h',
                  name='Top diagnostics',
                  marker_color='coral',
                  text=top_diags.values[::-1],
                  textposition='outside'),
            row=2, col=1
        )

        # 4. Qualité des données
        self.df['Data_completeness'] = (
            self.df[['Diagnostics différentiels', 'Anamnèse', 'Status', 'Management']]
            .notna().sum(axis=1) / 4 * 100
        )
        quality_by_year = self.df.groupby('Année')['Data_completeness'].mean()

        fig.add_trace(
            go.Scatter(x=quality_by_year.index, y=quality_by_year.values,
                      mode='lines+markers',
                      name='Qualité données',
                      line=dict(color='green', width=3),
                      marker=dict(size=10)),
            row=2, col=2
        )

        fig.update_layout(
            height=800,
            showlegend=False,
            title_text="Dashboard ECOS - Vue d'ensemble",
            title_font_size=20
        )

        return fig

    def create_predictions_chart(self):
        """Crée le graphique des prédictions 2026"""
        # Données historiques
        yearly_counts = self.df.groupby('Année').size()

        # Prédictions
        predictions = self.stats['predictions_2026']['total_cases_prediction']

        # Créer le graphique
        fig = go.Figure()

        # Données historiques
        fig.add_trace(go.Scatter(
            x=yearly_counts.index,
            y=yearly_counts.values,
            mode='lines+markers',
            name='Données historiques',
            line=dict(color='blue', width=2),
            marker=dict(size=8)
        ))

        # Ligne de tendance
        from sklearn.linear_model import LinearRegression
        X = yearly_counts.index.values.reshape(-1, 1)
        y = yearly_counts.values
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
            line=dict(color='gray', width=1, dash='dash')
        ))

        # Prédiction 2026
        fig.add_trace(go.Scatter(
            x=[2026],
            y=[predictions['ensemble_prediction']],
            mode='markers',
            name='Prédiction 2026',
            marker=dict(size=15, color='red', symbol='star')
        ))

        # Intervalle de confiance
        ci_lower, ci_upper = predictions['confidence_interval']
        fig.add_shape(
            type='rect',
            x0=2025.5, x1=2026.5,
            y0=ci_lower, y1=ci_upper,
            fillcolor='red',
            opacity=0.2,
            line=dict(width=0)
        )

        # Annotations pour les modèles
        fig.add_annotation(
            x=2026, y=predictions['linear_model'],
            text=f"Linéaire: {predictions['linear_model']}",
            showarrow=True,
            arrowhead=2,
            ax=-50, ay=-10,
            bgcolor='lightblue',
            bordercolor='blue'
        )

        fig.add_annotation(
            x=2026, y=predictions['polynomial_model'],
            text=f"Polynomial: {predictions['polynomial_model']}",
            showarrow=True,
            arrowhead=2,
            ax=50, ay=-10,
            bgcolor='lightgreen',
            bordercolor='green'
        )

        fig.add_annotation(
            x=2026, y=predictions['random_forest_model'],
            text=f"Random Forest: {predictions['random_forest_model']}",
            showarrow=True,
            arrowhead=2,
            ax=0, ay=-50,
            bgcolor='lightyellow',
            bordercolor='orange'
        )

        fig.update_layout(
            title="Prédictions pour 2026 - Analyse multi-modèles",
            xaxis_title="Année",
            yaxis_title="Nombre de cas",
            height=500,
            hovermode='x unified'
        )

        return fig

    def create_category_evolution(self):
        """Crée le graphique d'évolution des catégories"""
        # Préparer les données
        yearly_category = self.df.groupby(['Année', 'Catégorie_médicale']).size().unstack(fill_value=0)

        # Sélectionner les top catégories
        top_categories = self.df['Catégorie_médicale'].value_counts()
        top_categories = top_categories[~top_categories.index.isin(['Autre', 'Non classé'])].head(8).index

        # Créer le graphique en aires empilées
        fig = go.Figure()

        for category in top_categories:
            if category in yearly_category.columns:
                fig.add_trace(go.Scatter(
                    x=yearly_category.index,
                    y=yearly_category[category],
                    mode='lines',
                    name=category,
                    stackgroup='one',
                    line=dict(width=2)
                ))

        # Ajouter les prédictions par catégorie pour 2026
        cat_predictions = self.stats['predictions_2026']['category_predictions']

        for cat, pred in cat_predictions.items():
            if cat in top_categories:
                fig.add_trace(go.Scatter(
                    x=[2026],
                    y=[pred],
                    mode='markers',
                    name=f'{cat} (2026)',
                    marker=dict(size=12, symbol='diamond'),
                    showlegend=True
                ))

        fig.update_layout(
            title="Évolution des catégories médicales et prédictions 2026",
            xaxis_title="Année",
            yaxis_title="Nombre de cas",
            height=500,
            hovermode='x unified'
        )

        return fig

    def create_correlation_heatmap(self):
        """Crée la heatmap des corrélations"""
        # Créer la matrice de corrélation
        numeric_cols = ['Année', 'Has_differential', 'Has_anamnesis', 'Has_status',
                       'Has_management', 'Data_completeness']

        # Préparer les colonnes binaires
        self.df['Has_differential'] = self.df['Diagnostics différentiels'].notna().astype(int)
        self.df['Has_anamnesis'] = self.df['Anamnèse'].notna().astype(int)
        self.df['Has_status'] = self.df['Status'].notna().astype(int)
        self.df['Has_management'] = self.df['Management'].notna().astype(int)

        corr_matrix = self.df[numeric_cols].corr()

        # Créer la heatmap
        fig = go.Figure(data=go.Heatmap(
            z=corr_matrix,
            x=['Année', 'Diff. diagnostics', 'Anamnèse', 'Status',
               'Management', 'Complétude'],
            y=['Année', 'Diff. diagnostics', 'Anamnèse', 'Status',
               'Management', 'Complétude'],
            colorscale='RdBu',
            zmid=0,
            text=np.round(corr_matrix, 2),
            texttemplate='%{text}',
            textfont={"size": 12},
            colorbar=dict(title="Corrélation")
        ))

        fig.update_layout(
            title="Matrice de corrélation des variables",
            height=500,
            width=600
        )

        return fig

    def create_quality_gauge(self):
        """Crée une jauge de qualité des données"""
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

        return fig

    def create_ssp_distribution(self):
        """Crée le graphique de distribution des SSP"""
        ssp_counts = self.df['SSP'].value_counts().head(15)

        fig = go.Figure(data=[
            go.Bar(
                x=ssp_counts.values,
                y=ssp_counts.index,
                orientation='h',
                marker=dict(
                    color=ssp_counts.values,
                    colorscale='Viridis',
                    showscale=True,
                    colorbar=dict(title="Nombre de cas")
                ),
                text=ssp_counts.values,
                textposition='outside'
            )
        ])

        fig.update_layout(
            title="Distribution des SSP (Top 15)",
            xaxis_title="Nombre de cas",
            yaxis_title="SSP",
            height=600,
            margin=dict(l=200)
        )

        return fig

    def generate_html_dashboard(self, output_file):
        """Génère le dashboard HTML complet"""

        # Créer tous les graphiques
        print("📊 Création des visualisations...")
        overview_fig = self.create_overview_chart()
        predictions_fig = self.create_predictions_chart()
        evolution_fig = self.create_category_evolution()
        correlation_fig = self.create_correlation_heatmap()
        quality_fig = self.create_quality_gauge()
        ssp_fig = self.create_ssp_distribution()

        # Convertir en HTML
        overview_html = overview_fig.to_html(include_plotlyjs=False, div_id="overview-chart")
        predictions_html = predictions_fig.to_html(include_plotlyjs=False, div_id="predictions-chart")
        evolution_html = evolution_fig.to_html(include_plotlyjs=False, div_id="evolution-chart")
        correlation_html = correlation_fig.to_html(include_plotlyjs=False, div_id="correlation-chart")
        quality_html = quality_fig.to_html(include_plotlyjs=False, div_id="quality-chart")
        ssp_html = ssp_fig.to_html(include_plotlyjs=False, div_id="ssp-chart")

        # Préparer les insights
        insights_html = ""
        for insight in self.stats['insights']:
            insights_html += f'<div class="insight-item">{insight}</div>'

        # Préparer les statistiques clés
        total_cases = len(self.df)
        unique_diagnoses = self.df['Suspicion diagnostic principale'].nunique()
        years_covered = self.df['Année'].nunique()
        categories = self.df['Catégorie_médicale'].nunique()

        # HTML complet
        html_content = f"""
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Interactif ECOS 2011-2025 | Analyses & Prédictions 2026</title>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
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

        <div class="insights-section">
            <h2 class="insights-title">💡 Insights Clés</h2>
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
                    Analyse des corrélations entre variables
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
            <p>Dashboard généré le {datetime.now().strftime('%d/%m/%Y à %H:%M')} |
            Données ECOS 2011-2025 | Analyse statistique avancée avec prédictions ML</p>
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
        }});
    </script>
</body>
</html>
        """

        # Sauvegarder le fichier HTML
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(html_content)

        print(f"✅ Dashboard interactif créé : {output_file}")


def main():
    """Fonction principale"""
    import os

    # Chemins des fichiers
    data_file = "/Users/damienfulliquet/Documents/GitHub/ecos-grid-generator/source-data/archive/Stat/Anciens_cas/ECOSAnciens_cas_2011-2025_CLEAN.xlsx"
    stats_file = "/Users/damienfulliquet/Documents/GitHub/ecos-grid-generator/source-data/archive/Stat/Anciens_cas/visualizations/ecos_statistical_analysis.json"
    output_dir = "/Users/damienfulliquet/Documents/GitHub/ecos-grid-generator/source-data/archive/Stat/Anciens_cas/visualizations"
    output_file = f"{output_dir}/dashboard_interactif_2026.html"

    # Créer le dashboard
    print("🚀 Création du dashboard interactif...")
    dashboard = ECOSDashboard(data_file, stats_file)
    dashboard.generate_html_dashboard(output_file)

    print("\n✅ Dashboard interactif créé avec succès!")
    print(f"📁 Fichier disponible : {output_file}")
    print("\n💡 Ouvrez le fichier dans votre navigateur pour explorer les analyses et prédictions 2026!")


if __name__ == "__main__":
    main()