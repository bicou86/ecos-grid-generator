// ECOS Explorer - Interactive Application

// Global variables
let ecosData = [];
let filteredData = [];
let currentPage = 1;
const itemsPerPage = 12;
let currentView = 'cards';

// Load data on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadECOSData();
    initializeFilters();
    initializeEventListeners();
    renderDashboard();
    renderResults();
});

// Load ECOS data from CSV
async function loadECOSData() {
    try {
        // Load the CSV file via symbolic link
        const response = await fetch('ecos_data.csv');
        const csvText = await response.text();

        Papa.parse(csvText, {
            header: true,
            delimiter: ';',
            complete: function(results) {
                ecosData = results.data.filter(row => row.Année); // Filter empty rows
                filteredData = [...ecosData];
                console.log(`Loaded ${ecosData.length} ECOS cases`);
                updateHeaderStats();
            }
        });
    } catch (error) {
        console.error('Error loading data:', error);
        // Use sample data for demonstration
        ecosData = generateSampleData();
        filteredData = [...ecosData];
        updateHeaderStats();
    }
}

// Generate sample data for demonstration
function generateSampleData() {
    const categories = ['Cardiovasculaire', 'Neurologie', 'Gastroentérologie', 'Pneumologie',
                       'Psychiatrie', 'Néphrologie-Urologie', 'Dermatologie', 'Rhumatologie'];
    const years = [2011, 2013, 2014, 2015, 2016, 2017, 2019, 2021, 2022, 2023, 2024, 2025];
    const data = [];

    for (let i = 0; i < 374; i++) {
        data.push({
            'Année': years[Math.floor(Math.random() * years.length)],
            'Catégorie': categories[Math.floor(Math.random() * categories.length)],
            'Groupe_Thematique_V3': categories[Math.floor(Math.random() * categories.length)],
            'Diagnostic principal harmonisé': `Diagnostic ${i + 1}`,
            'SSP harmonisé': `Symptôme ${Math.floor(Math.random() * 50)}`,
            'Code_SSP_PROFILES': `SSP-${String(Math.floor(Math.random() * 265) + 1).padStart(3, '0')}`,
            'Description': `Description du cas clinique ${i + 1}. Patient présentant des symptômes caractéristiques...`,
            'Anamnèse': `Anamnèse détaillée du patient...`,
            'Score_Complétude_Pct': Math.floor(Math.random() * 100),
            'Anamnèse_Détaillée_PDF': Math.random() > 0.8 ? 'Détails de l\'anamnèse...' : '',
            'Examen_Clinique_PDF': Math.random() > 0.8 ? 'Examen clinique complet...' : '',
            'Diagnostic_Différentiel_PDF': Math.random() > 0.8 ? 'DD1, DD2, DD3...' : '',
            'Prise_en_Charge_PDF': Math.random() > 0.8 ? 'Plan de traitement...' : ''
        });
    }
    return data;
}

// Update header statistics
function updateHeaderStats() {
    document.getElementById('total-cases').textContent = ecosData.length;

    const categories = [...new Set(ecosData.map(item => item['Groupe_Thematique_V3']))];
    document.getElementById('total-categories').textContent = categories.length;

    const years = ecosData.map(item => parseInt(item['Année'])).filter(y => !isNaN(y));
    if (years.length > 0) {
        const minYear = Math.min(...years);
        const maxYear = Math.max(...years);
        document.getElementById('years-range').textContent = `${minYear}-${maxYear}`;
    }
}

// Initialize filters
function initializeFilters() {
    // Year filter
    const years = [...new Set(ecosData.map(item => item['Année']))].sort();
    const yearSelect = document.getElementById('filter-year');
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });

    // Category filter
    const categories = [...new Set(ecosData.map(item => item['Groupe_Thematique_V3']))].sort();
    const categorySelect = document.getElementById('filter-category');
    categories.forEach(cat => {
        if (cat) {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categorySelect.appendChild(option);
        }
    });

    // SSP filter
    const sspCodes = [...new Set(ecosData.map(item => item['Code_SSP_PROFILES']))].sort();
    const sspSelect = document.getElementById('filter-ssp');
    sspCodes.forEach(code => {
        if (code && code !== 'SSP-000' && code !== 'SSP-999') {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = code;
            sspSelect.appendChild(option);
        }
    });
}

// Initialize event listeners
function initializeEventListeners() {
    // Search
    document.getElementById('search-btn').addEventListener('click', performSearch);
    document.getElementById('search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    // Filters
    document.getElementById('filter-year').addEventListener('change', applyFilters);
    document.getElementById('filter-category').addEventListener('change', applyFilters);
    document.getElementById('filter-ssp').addEventListener('change', applyFilters);
    document.getElementById('filter-completeness').addEventListener('change', applyFilters);
    document.getElementById('reset-filters').addEventListener('click', resetFilters);

    // View options
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentView = e.target.dataset.view;
            renderResults();
        });
    });

    // Pagination
    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderResults();
        }
    });

    document.getElementById('next-page').addEventListener('click', () => {
        const maxPage = Math.ceil(filteredData.length / itemsPerPage);
        if (currentPage < maxPage) {
            currentPage++;
            renderResults();
        }
    });

    // Export buttons
    document.getElementById('export-csv').addEventListener('click', exportCSV);
    document.getElementById('export-json').addEventListener('click', exportJSON);
    document.getElementById('export-pdf').addEventListener('click', exportPDF);
    document.getElementById('export-ecos').addEventListener('click', exportECOS);

    // Modal
    document.querySelector('.close').addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('case-modal')) {
            closeModal();
        }
    });
}

// Search functionality
function performSearch() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();

    if (searchTerm === '') {
        filteredData = [...ecosData];
    } else {
        filteredData = ecosData.filter(item => {
            return (
                item['Diagnostic principal harmonisé']?.toLowerCase().includes(searchTerm) ||
                item['SSP harmonisé']?.toLowerCase().includes(searchTerm) ||
                item['Description']?.toLowerCase().includes(searchTerm) ||
                item['Anamnèse']?.toLowerCase().includes(searchTerm)
            );
        });
    }

    currentPage = 1;
    renderResults();
}

// Apply filters
function applyFilters() {
    const yearFilter = document.getElementById('filter-year').value;
    const categoryFilter = document.getElementById('filter-category').value;
    const sspFilter = document.getElementById('filter-ssp').value;
    const completenessFilter = document.getElementById('filter-completeness').value;

    filteredData = ecosData.filter(item => {
        let match = true;

        if (yearFilter && item['Année'] !== yearFilter) match = false;
        if (categoryFilter && item['Groupe_Thematique_V3'] !== categoryFilter) match = false;
        if (sspFilter && item['Code_SSP_PROFILES'] !== sspFilter) match = false;

        if (completenessFilter) {
            const score = parseFloat(item['Score_Complétude_Pct']) || 0;
            if (completenessFilter === 'high' && score < 75) match = false;
            if (completenessFilter === 'medium' && (score < 50 || score >= 75)) match = false;
            if (completenessFilter === 'low' && score >= 50) match = false;
        }

        return match;
    });

    currentPage = 1;
    renderResults();
}

// Reset filters
function resetFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('filter-year').value = '';
    document.getElementById('filter-category').value = '';
    document.getElementById('filter-ssp').value = '';
    document.getElementById('filter-completeness').value = '';

    filteredData = [...ecosData];
    currentPage = 1;
    renderResults();
}

// Render dashboard charts
function renderDashboard() {
    renderCategoryChart();
    renderTimelineChart();
    renderTopDiagnostics();
}

// Render category distribution chart
function renderCategoryChart() {
    const ctx = document.getElementById('category-chart').getContext('2d');
    const categories = {};

    ecosData.forEach(item => {
        const cat = item['Groupe_Thematique_V3'] || 'Non classé';
        categories[cat] = (categories[cat] || 0) + 1;
    });

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categories).slice(0, 8),
            datasets: [{
                data: Object.values(categories).slice(0, 8),
                backgroundColor: [
                    '#2563eb', '#10b981', '#f59e0b', '#ef4444',
                    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 10,
                        font: { size: 11 }
                    }
                }
            }
        }
    });
}

// Render timeline chart
function renderTimelineChart() {
    const ctx = document.getElementById('timeline-chart').getContext('2d');
    const yearCounts = {};

    ecosData.forEach(item => {
        const year = item['Année'];
        if (year) {
            yearCounts[year] = (yearCounts[year] || 0) + 1;
        }
    });

    const sortedYears = Object.keys(yearCounts).sort();

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedYears,
            datasets: [{
                label: 'Nombre de cas',
                data: sortedYears.map(year => yearCounts[year]),
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 5 }
                }
            }
        }
    });
}

// Render top diagnostics
function renderTopDiagnostics() {
    const diagnostics = {};

    ecosData.forEach(item => {
        const diag = item['Diagnostic principal harmonisé'];
        if (diag && diag !== 'nan') {
            diagnostics[diag] = (diagnostics[diag] || 0) + 1;
        }
    });

    const sorted = Object.entries(diagnostics)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    const container = document.getElementById('top-diagnostics');
    container.innerHTML = '';

    sorted.forEach(([diag, count]) => {
        const item = document.createElement('div');
        item.style.cssText = 'display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb;';
        item.innerHTML = `
            <span style="flex: 1; font-size: 0.875rem;">${diag.substring(0, 40)}...</span>
            <span style="font-weight: 600; color: #2563eb;">${count}</span>
        `;
        container.appendChild(item);
    });
}

// Render results based on current view
function renderResults() {
    const container = document.getElementById('results-container');
    container.className = `results-container ${currentView}-view`;

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = filteredData.slice(start, end);

    if (currentView === 'cards') {
        renderCardsView(container, pageData);
    } else if (currentView === 'table') {
        renderTableView(container, pageData);
    } else if (currentView === 'detail') {
        renderDetailView(container, pageData);
    }

    updatePagination();
    document.getElementById('results-count').textContent = `(${filteredData.length})`;
}

// Render cards view
function renderCardsView(container, data) {
    container.innerHTML = '';

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'case-card';
        card.onclick = () => showCaseDetails(item);

        const completeness = parseFloat(item['Score_Complétude_Pct']) || 0;

        card.innerHTML = `
            <div class="case-header">
                <span class="case-year">${item['Année']}</span>
                <span class="case-category">${item['Groupe_Thematique_V3'] || 'Non classé'}</span>
            </div>
            <div class="case-title">${item['Diagnostic principal harmonisé'] || 'Sans titre'}</div>
            <div class="case-ssp">SSP: ${item['SSP harmonisé']} (${item['Code_SSP_PROFILES']})</div>
            <div class="case-description">${item['Description'] || 'Pas de description disponible'}</div>
            <div class="case-footer">
                <div class="completeness-bar">
                    <div class="completeness-fill" style="width: ${completeness}%"></div>
                </div>
                <span class="completeness-label">${completeness.toFixed(0)}%</span>
            </div>
        `;

        container.appendChild(card);
    });
}

// Render table view
function renderTableView(container, data) {
    container.innerHTML = `
        <table class="results-table">
            <thead>
                <tr>
                    <th>Année</th>
                    <th>Catégorie</th>
                    <th>Diagnostic</th>
                    <th>SSP</th>
                    <th>Code SSP</th>
                    <th>Complétude</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(item => `
                    <tr onclick="showCaseDetails(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                        <td>${item['Année']}</td>
                        <td>${item['Groupe_Thematique_V3'] || 'Non classé'}</td>
                        <td>${item['Diagnostic principal harmonisé'] || '-'}</td>
                        <td>${item['SSP harmonisé'] || '-'}</td>
                        <td>${item['Code_SSP_PROFILES'] || '-'}</td>
                        <td>${(parseFloat(item['Score_Complétude_Pct']) || 0).toFixed(0)}%</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Render detail view
function renderDetailView(container, data) {
    container.innerHTML = '';

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'detail-card';

        card.innerHTML = `
            <div class="detail-header">
                <h3>${item['Diagnostic principal harmonisé'] || 'Sans titre'}</h3>
                <div>
                    <span class="case-year">${item['Année']}</span>
                    <span class="case-category" style="margin-left: 0.5rem;">${item['Groupe_Thematique_V3'] || 'Non classé'}</span>
                </div>
            </div>

            <div class="detail-section">
                <h4>Informations générales</h4>
                <p><strong>SSP:</strong> ${item['SSP harmonisé']} (${item['Code_SSP_PROFILES']})</p>
                <p><strong>Description:</strong> ${item['Description'] || 'Non disponible'}</p>
            </div>

            ${item['Anamnèse'] ? `
            <div class="detail-section">
                <h4>Anamnèse</h4>
                <p>${item['Anamnèse']}</p>
            </div>
            ` : ''}

            ${item['Anamnèse_Détaillée_PDF'] ? `
            <div class="detail-section">
                <h4>Anamnèse détaillée (PDF)</h4>
                <p>${item['Anamnèse_Détaillée_PDF']}</p>
            </div>
            ` : ''}

            ${item['Examen_Clinique_PDF'] ? `
            <div class="detail-section">
                <h4>Examen clinique</h4>
                <p>${item['Examen_Clinique_PDF']}</p>
            </div>
            ` : ''}

            ${item['Diagnostic_Différentiel_PDF'] ? `
            <div class="detail-section">
                <h4>Diagnostic différentiel</h4>
                <p>${item['Diagnostic_Différentiel_PDF']}</p>
            </div>
            ` : ''}

            ${item['Prise_en_Charge_PDF'] ? `
            <div class="detail-section">
                <h4>Prise en charge</h4>
                <p>${item['Prise_en_Charge_PDF']}</p>
            </div>
            ` : ''}
        `;

        container.appendChild(card);
    });
}

// Show case details in modal
function showCaseDetails(item) {
    const modal = document.getElementById('case-modal');
    const modalBody = document.getElementById('modal-body');

    const completeness = parseFloat(item['Score_Complétude_Pct']) || 0;

    modalBody.innerHTML = `
        <div style="border-bottom: 2px solid #e5e7eb; padding-bottom: 1rem; margin-bottom: 1.5rem;">
            <h2 style="margin-bottom: 1rem;">${item['Diagnostic principal harmonisé'] || 'Sans titre'}</h2>
            <div style="display: flex; gap: 1rem;">
                <span class="case-year">${item['Année']}</span>
                <span class="case-category">${item['Groupe_Thematique_V3'] || 'Non classé'}</span>
                <span style="margin-left: auto;">Complétude: ${completeness.toFixed(0)}%</span>
            </div>
        </div>

        <div class="detail-section">
            <h4>Informations générales</h4>
            <p><strong>SSP:</strong> ${item['SSP harmonisé']} (${item['Code_SSP_PROFILES']})</p>
            <p><strong>Catégorie originale:</strong> ${item['Catégorie'] || 'Non spécifié'}</p>
            <p><strong>Description:</strong> ${item['Description'] || 'Non disponible'}</p>
        </div>

        ${item['Anamnèse'] ? `
        <div class="detail-section">
            <h4>Anamnèse</h4>
            <p>${item['Anamnèse']}</p>
        </div>
        ` : ''}

        ${item['Anamnèse_Détaillée_PDF'] ? `
        <div class="detail-section">
            <h4>Anamnèse détaillée (Enrichie PDF)</h4>
            <p>${item['Anamnèse_Détaillée_PDF']}</p>
        </div>
        ` : ''}

        ${item['Examen_Clinique_PDF'] ? `
        <div class="detail-section">
            <h4>Examen clinique</h4>
            <p>${item['Examen_Clinique_PDF']}</p>
        </div>
        ` : ''}

        ${item['Diagnostic_Différentiel_PDF'] ? `
        <div class="detail-section">
            <h4>Diagnostic différentiel</h4>
            <p>${item['Diagnostic_Différentiel_PDF']}</p>
        </div>
        ` : ''}

        ${item['Examens_Complémentaires_PDF'] ? `
        <div class="detail-section">
            <h4>Examens complémentaires</h4>
            <p>${item['Examens_Complémentaires_PDF']}</p>
        </div>
        ` : ''}

        ${item['Prise_en_Charge_PDF'] ? `
        <div class="detail-section">
            <h4>Prise en charge</h4>
            <p>${item['Prise_en_Charge_PDF']}</p>
        </div>
        ` : ''}

        <div class="detail-section" style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
            <h4>Métadonnées</h4>
            <p><strong>Statut doublon:</strong> ${item['Est_Doublon'] === 'True' ? 'Oui' : 'Non'}</p>
            <p><strong>Score de complétude:</strong> ${completeness.toFixed(1)}%</p>
        </div>
    `;

    modal.style.display = 'block';
}

// Close modal
function closeModal() {
    document.getElementById('case-modal').style.display = 'none';
}

// Update pagination
function updatePagination() {
    const maxPage = Math.ceil(filteredData.length / itemsPerPage);
    document.getElementById('page-info').textContent = `Page ${currentPage} / ${maxPage}`;

    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === maxPage;
}

// Export functions
function exportCSV() {
    const csv = Papa.unparse(filteredData, {
        delimiter: ';'
    });

    downloadFile(csv, 'ecos_export.csv', 'text/csv');
}

function exportJSON() {
    const json = JSON.stringify(filteredData, null, 2);
    downloadFile(json, 'ecos_export.json', 'application/json');
}

function exportPDF() {
    // Using jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text('ECOS Cases Export', 20, 20);

    let y = 40;
    filteredData.slice(0, 10).forEach((item, index) => {
        if (y > 250) {
            doc.addPage();
            y = 20;
        }

        doc.setFontSize(12);
        doc.text(`${index + 1}. ${item['Diagnostic principal harmonisé']}`, 20, y);
        y += 10;

        doc.setFontSize(10);
        doc.text(`   Année: ${item['Année']} | Catégorie: ${item['Groupe_Thematique_V3']}`, 20, y);
        y += 10;

        doc.text(`   SSP: ${item['SSP harmonisé']}`, 20, y);
        y += 15;
    });

    doc.save('ecos_export.pdf');
}

function exportECOS() {
    alert('Export vers la plateforme ECOS en cours de préparation...\n\nLes fichiers JSON structurés seront générés pour chaque cas.');

    // Generate structured JSON for ECOS platform
    const ecosFormat = filteredData.map(item => ({
        titre: item['Diagnostic principal harmonisé'],
        annee: item['Année'],
        context: {
            setting: item['Catégorie'],
            patient: item['Description']
        },
        ssp: {
            symptome: item['SSP harmonisé'],
            code: item['Code_SSP_PROFILES']
        },
        sections: {
            anamnese: {
                contenu: item['Anamnèse'],
                detaille: item['Anamnèse_Détaillée_PDF']
            },
            examen: {
                contenu: item['Examen_Clinique_PDF']
            },
            management: {
                diagnostic_differentiel: item['Diagnostic_Différentiel_PDF'],
                examens: item['Examens_Complémentaires_PDF'],
                prise_en_charge: item['Prise_en_Charge_PDF']
            }
        },
        metadata: {
            completude: item['Score_Complétude_Pct'],
            categorie: item['Groupe_Thematique_V3'],
            doublon: item['Est_Doublon']
        }
    }));

    downloadFile(JSON.stringify(ecosFormat, null, 2), 'ecos_platform_export.json', 'application/json');
}

// Helper function to download files
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}