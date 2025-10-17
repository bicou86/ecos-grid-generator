#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function generatePDF(htmlFilePath, outputPdfPath) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // Utiliser page.goto() avec file:// pour résoudre les chemins relatifs
        const absoluteHtmlPath = path.resolve(htmlFilePath);
        const fileUrl = `file://${absoluteHtmlPath}`;
        
        await page.goto(fileUrl, { waitUntil: 'networkidle0' });
        
        // Générer le PDF avec les options optimisées
        await page.pdf({
            path: outputPdfPath,
            format: 'A4',
            margin: {
                top: '10mm',
                right: '9mm',
                bottom: '10mm',
                left: '10mm'
            },
            printBackground: true,
            preferCSSPageSize: true
        });
        
        console.log(`✅ PDF généré : ${outputPdfPath}`);
        
    } catch (error) {
        console.error(`❌ Erreur lors de la génération PDF : ${error.message}`);
        throw error;
    } finally {
        await browser.close();
    }
}

// Utilisation en ligne de commande
if (require.main === module) {
    if (process.argv.length < 3) {
        console.error('Usage: node generate-pdf.js <fichier-html> [fichier-pdf-sortie]');
        process.exit(1);
    }
    
    const htmlFile = process.argv[2];
    const outputFile = process.argv[3] || htmlFile.replace('.html', '.pdf').replace('/html/', '/pdf/');
    
    // S'assurer que le dossier de sortie existe
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    generatePDF(htmlFile, outputFile).catch(error => {
        console.error('Erreur:', error);
        process.exit(1);
    });
}

module.exports = { generatePDF };