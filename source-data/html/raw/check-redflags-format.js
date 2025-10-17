const fs = require('fs');
const path = require('path');

// Function to check redflagsSection format
function checkRedflags(criterion, filePath, criterionId) {
    if (!criterion.redflagsSection) return null;
    
    // Check if it's an array
    if (!Array.isArray(criterion.redflagsSection)) {
        return {
            file: filePath,
            criterionId: criterionId,
            issue: 'Not an array - is an object',
            format: typeof criterion.redflagsSection
        };
    }
    
    // Check each item in the array
    for (let i = 0; i < criterion.redflagsSection.length; i++) {
        const item = criterion.redflagsSection[i];
        
        // Check if it's a string (should be object with text property)
        if (typeof item === 'string') {
            return {
                file: filePath,
                criterionId: criterionId,
                issue: 'Contains string items instead of objects',
                example: item
            };
        }
        
        // Check if it's an object without text property
        if (typeof item === 'object' && !item.text) {
            return {
                file: filePath,
                criterionId: criterionId,
                issue: 'Object missing text property',
                object: JSON.stringify(item)
            };
        }
    }
    
    return null; // Format is correct
}

// Process a JSON file
function processFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        const issues = [];
        
        // Check all criteria in all sections
        if (data.sections) {
            Object.keys(data.sections).forEach(sectionKey => {
                const section = data.sections[sectionKey];
                
                if (section.criteria && Array.isArray(section.criteria)) {
                    section.criteria.forEach(criterion => {
                        const issue = checkRedflags(criterion, filePath, criterion.id);
                        if (issue) {
                            issues.push(issue);
                        }
                    });
                }
            });
        }
        
        return issues;
        
    } catch (error) {
        console.error(`Error processing ${filePath}: ${error.message}`);
        return [];
    }
}

// Check both v2 and v3 directories
console.log('🔍 Checking redflagsSection format in all JSON files...\n');

let allIssues = [];

// Check v2 files
const v2Dir = 'json_files/v2';
if (fs.existsSync(v2Dir)) {
    const v2Files = fs.readdirSync(v2Dir)
        .filter(file => file.endsWith('.json'))
        .map(file => path.join(v2Dir, file));
    
    console.log(`Checking ${v2Files.length} v2 files...`);
    v2Files.forEach(file => {
        const issues = processFile(file);
        allIssues = allIssues.concat(issues);
    });
}

// Check v3 files
const v3Dir = 'json_files/v3';
if (fs.existsSync(v3Dir)) {
    const v3Files = fs.readdirSync(v3Dir)
        .filter(file => file.endsWith('.json'))
        .map(file => path.join(v3Dir, file));
    
    console.log(`Checking ${v3Files.length} v3 files...`);
    v3Files.forEach(file => {
        const issues = processFile(file);
        allIssues = allIssues.concat(issues);
    });
}

// Report results
console.log(`\n📊 Found ${allIssues.length} formatting issues:\n`);

if (allIssues.length > 0) {
    // Group by file
    const byFile = {};
    allIssues.forEach(issue => {
        if (!byFile[issue.file]) {
            byFile[issue.file] = [];
        }
        byFile[issue.file].push(issue);
    });
    
    Object.keys(byFile).forEach(file => {
        console.log(`\n📄 ${file}:`);
        byFile[file].forEach(issue => {
            console.log(`  - Criterion ${issue.criterionId}: ${issue.issue}`);
            if (issue.example) console.log(`    Example: "${issue.example}"`);
            if (issue.object) console.log(`    Object: ${issue.object}`);
        });
    });
} else {
    console.log('✅ All redflagsSection formats are correct!');
}