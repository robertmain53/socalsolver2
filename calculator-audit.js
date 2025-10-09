import fs from 'fs/promises';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ========================================
// CONFIGURAZIONE AUDIT SYSTEM
// ========================================

const COMPONENTS_DIR = path.join(__dirname, 'components', 'calculators');
const AUDIT_RESULTS_DIR = path.join(__dirname, 'audit-results');
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${GEMINI_API_KEY}`;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// ========================================
// AUDIT ANALYZER CLASS
// ========================================

class CalculatorAuditor {
    constructor() {
        this.results = [];
        this.competitorBenchmarks = {
            // Benchmarks medi della concorrenza per categoria
            'PMI e Impresa': { avgInputs: 8, avgOutputs: 5, complexityScore: 7 },
            'Immobiliare e Casa': { avgInputs: 6, avgOutputs: 4, complexityScore: 6 },
            'Investimenti e Finanza': { avgInputs: 10, avgOutputs: 7, complexityScore: 9 },
            'Tasse e Fiscalità': { avgInputs: 7, avgOutputs: 6, complexityScore: 8 },
            'Default': { avgInputs: 7, avgOutputs: 5, complexityScore: 7 }
        };
    }

    async auditAllCalculators() {
        console.log('🔍 CALCULATOR AUDIT SYSTEM v1.0');
        console.log('================================');
        
        await fs.mkdir(AUDIT_RESULTS_DIR, { recursive: true });
        
        const files = await fs.readdir(COMPONENTS_DIR);
        const tsxFiles = files.filter(f => f.endsWith('.tsx'));
        
        console.log(`📊 Found ${tsxFiles.length} calculators to audit`);
        
        for (let i = 0; i < tsxFiles.length; i++) {
            const file = tsxFiles[i];
            console.log(`\n🔍 [${i+1}/${tsxFiles.length}] Auditing: ${file}`);
            
            try {
                const result = await this.auditSingleCalculator(file);
                this.results.push(result);
                
                // Progress feedback
                this.showProgressStats(result);
                
            } catch (error) {
                console.error(`❌ Error auditing ${file}:`, error.message);
                this.results.push({
                    filename: file,
                    error: error.message,
                    overallScore: 0
                });
            }
        }
        
        await this.generateReports();
        console.log(`\n✅ Audit completed! Results saved in: ${AUDIT_RESULTS_DIR}`);
    }

    async auditSingleCalculator(filename) {
        const filepath = path.join(COMPONENTS_DIR, filename);
        const code = await fs.readFile(filepath, 'utf8');
        
        // Extract calculator metadata
        const metadata = this.extractMetadata(filename, code);
        
        // Run parallel analysis
        const [formulaAnalysis, uxAnalysis, competitiveAnalysis] = await Promise.all([
            this.analyzeFormula(code, metadata),
            this.analyzeUX(code, metadata), 
            this.analyzeCompetitive(code, metadata)
        ]);
        
        // Calculate overall score
        const overallScore = this.calculateOverallScore({
            formulaAnalysis,
            uxAnalysis,
            competitiveAnalysis
        });
        
        return {
            filename,
            metadata,
            formulaAnalysis,
            uxAnalysis,
            competitiveAnalysis,
            overallScore,
            timestamp: new Date().toISOString()
        };
    }

    extractMetadata(filename, code) {
        // Extract basic info from filename and code
        const name = filename.replace('.tsx', '').replace(/([A-Z])/g, ' $1').trim();
        
        // Try to extract category and other info from code
        const titleMatch = code.match(/(?:title|h1.*?>[^<]*|calculatorName.*?)['"](.*?)['"]/i);
        const title = titleMatch ? titleMatch[1] : name;
        
        // Count inputs and outputs
        const inputMatches = code.match(/type="number"|input.*?number/gi) || [];
        const outputMatches = code.match(/result|output|total|calculate/gi) || [];
        
        return {
            name,
            title,
            inputCount: inputMatches.length,
            outputCount: Math.max(1, Math.floor(outputMatches.length / 3)), // Estimate
            codeLength: code.length,
            hasTypeScript: code.includes('interface') || code.includes('type '),
            hasValidation: code.includes('validation') || code.includes('error'),
            hasAccessibility: code.includes('aria-') || code.includes('role=')
        };
    }

    async analyzeFormula(code, metadata) {
        const prompt = `
Sei un expert matematico e ingegnere software. Analizza questo codice React di un calcolatore per valutare:

1. **CORRETTEZZA MATEMATICA** (0-10):
   - Formule matematiche corrette per il dominio
   - Gestione edge cases (divisione per zero, overflow)
   - Validazione input appropriata
   - Range di valori realistici

2. **QUALITÀ IMPLEMENTAZIONE** (0-10):
   - Calcoli efficienti e ottimizzati
   - Breakdown step-by-step chiaro
   - Error handling robusto
   - Precisione numerica appropriata

3. **TEST CASE VALIDATION**:
   - Testa 3 scenari: tipico, edge case, limite massimo
   - Verifica che i risultati siano sensati

CODICE DA ANALIZZARE:
\`\`\`typescript
${code.substring(0, 4000)} // Primi 4000 caratteri
\`\`\`

RESTITUISCI JSON:
{
    "mathematicalCorrectness": 0-10,
    "implementationQuality": 0-10,
    "testCases": [
        {"scenario": "typical", "input": {...}, "expectedRange": "...", "passes": true/false},
        {"scenario": "edge", "input": {...}, "expectedRange": "...", "passes": true/false},
        {"scenario": "maximum", "input": {...}, "expectedRange": "...", "passes": true/false}
    ],
    "formulaComplexity": "low|medium|high",
    "detectedIssues": ["lista di problemi trovati"],
    "recommendations": ["lista di miglioramenti"]
}`;

        return await this.callAI('gemini', prompt, true);
    }

    async analyzeUX(code, metadata) {
        const prompt = `
Sei un UX Expert e Accessibility Specialist. Valuta questo calcolatore React per:

1. **USABILITÀ** (0-10):
   - Facilità d'uso e intuitività
   - Layout e organizzazione
   - Feedback visivo e stati
   - Flow dell'utente ottimale

2. **ACCESSIBILITÀ WCAG 2.1** (0-10):
   - Semantic HTML e ARIA labels
   - Keyboard navigation
   - Screen reader compatibility
   - Color contrast e visibilità

3. **DESIGN RESPONSIVE** (0-10):
   - Mobile-first approach
   - Breakpoints appropriati
   - Touch targets adeguati
   - Performance su dispositivi mobili

4. **PROFESSIONAL UI** (0-10):
   - Visual hierarchy chiara
   - Typography e spacing
   - Brand consistency
   - Professional appearance

CODICE DA ANALIZZARE:
\`\`\`typescript
${code.substring(0, 4000)}
\`\`\`

RESTITUISCI JSON:
{
    "usabilityScore": 0-10,
    "accessibilityScore": 0-10,
    "responsiveScore": 0-10,
    "professionalUIScore": 0-10,
    "detectedUXIssues": ["lista problemi UX"],
    "accessibilityViolations": ["lista violazioni WCAG"],
    "mobileIssues": ["problemi mobile specifici"],
    "improvementSuggestions": ["suggerimenti prioritari"]
}`;

        return await this.callAI('openai', prompt, true);
    }

    async analyzeCompetitive(code, metadata) {
        // Get appropriate benchmark for category
        const category = this.detectCategory(metadata.title);
        const benchmark = this.competitorBenchmarks[category] || this.competitorBenchmarks.Default;
        
        const inputOutputRatio = metadata.inputCount / Math.max(1, metadata.outputCount);
        const complexityFromCode = this.calculateCodeComplexity(code);
        
        return {
            category,
            benchmark,
            currentMetrics: {
                inputCount: metadata.inputCount,
                outputCount: metadata.outputCount,
                inputOutputRatio,
                codeComplexity: complexityFromCode
            },
            competitivePosition: {
                inputsVsBenchmark: this.compareMetric(metadata.inputCount, benchmark.avgInputs),
                outputsVsBenchmark: this.compareMetric(metadata.outputCount, benchmark.avgOutputs),
                complexityVsBenchmark: this.compareMetric(complexityFromCode, benchmark.complexityScore)
            },
            recommendations: this.generateCompetitiveRecommendations(metadata, benchmark)
        };
    }

    detectCategory(title) {
        const categories = {
            'PMI e Impresa': ['partita iva', 'forfettario', 'impresa', 'business', 'azienda'],
            'Immobiliare e Casa': ['mutuo', 'casa', 'immobile', 'imu', 'tasi', 'affitto'],
            'Investimenti e Finanza': ['investimento', 'azione', 'bond', 'portafoglio', 'rendimento'],
            'Tasse e Fiscalità': ['tasse', 'fiscale', 'iva', 'irpef', 'deduzioni', 'imposte']
        };
        
        const titleLower = title.toLowerCase();
        for (const [cat, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => titleLower.includes(keyword))) {
                return cat;
            }
        }
        return 'Default';
    }

    calculateCodeComplexity(code) {
        const metrics = {
            functions: (code.match(/function|=>/g) || []).length,
            conditions: (code.match(/if|switch|ternary|\?/g) || []).length,
            loops: (code.match(/for|while|map|filter/g) || []).length,
            hooks: (code.match(/use[A-Z]/g) || []).length,
            calculations: (code.match(/\*|\+|-|\/|Math\./g) || []).length
        };
        
        // Simple complexity score 1-10
        const score = Math.min(10, 
            (metrics.functions * 0.5) + 
            (metrics.conditions * 0.8) + 
            (metrics.loops * 1.2) + 
            (metrics.hooks * 0.6) + 
            (metrics.calculations * 0.3)
        );
        
        return Math.round(score);
    }

    compareMetric(current, benchmark) {
        const ratio = current / benchmark;
        if (ratio > 1.2) return 'above_benchmark';
        if (ratio < 0.8) return 'below_benchmark';
        return 'at_benchmark';
    }

    generateCompetitiveRecommendations(metadata, benchmark) {
        const recommendations = [];
        
        if (metadata.inputCount < benchmark.avgInputs * 0.8) {
            recommendations.push(`Considera aggiungere ${Math.ceil(benchmark.avgInputs - metadata.inputCount)} input per competere con benchmark settore`);
        }
        
        if (metadata.outputCount < benchmark.avgOutputs * 0.8) {
            recommendations.push(`Aggiungi ${Math.ceil(benchmark.avgOutputs - metadata.outputCount)} output per maggiore completezza`);
        }
        
        if (!metadata.hasValidation) {
            recommendations.push('Implementa validazione input per professionalità enterprise');
        }
        
        if (!metadata.hasAccessibility) {
            recommendations.push('Aggiungi ARIA labels per compliance WCAG 2.1');
        }
        
        return recommendations;
    }

    calculateOverallScore(analyses) {
        const weights = {
            formula: 0.35,    // 35% - Most important
            ux: 0.35,         // 35% - Equally important
            competitive: 0.30  // 30% - Strategic importance
        };
        
        const formulaScore = (analyses.formulaAnalysis.mathematicalCorrectness + 
                            analyses.formulaAnalysis.implementationQuality) / 2;
        
        const uxScore = (analyses.uxAnalysis.usabilityScore + 
                        analyses.uxAnalysis.accessibilityScore + 
                        analyses.uxAnalysis.responsiveScore + 
                        analyses.uxAnalysis.professionalUIScore) / 4;
        
        // Competitive score based on benchmark alignment
        const competitiveScore = this.calculateCompetitiveScore(analyses.competitiveAnalysis);
        
        const overallScore = (
            formulaScore * weights.formula +
            uxScore * weights.ux +
            competitiveScore * weights.competitive
        );
        
        return Math.round(overallScore * 10) / 10; // Round to 1 decimal
    }

    calculateCompetitiveScore(competitive) {
        const positions = competitive.competitivePosition;
        let score = 5; // Base score
        
        Object.values(positions).forEach(position => {
            if (position === 'above_benchmark') score += 1.5;
            else if (position === 'at_benchmark') score += 0.5;
            // below_benchmark adds 0
        });
        
        return Math.min(10, score);
    }

    async callAI(provider, prompt, expectJson = false) {
        try {
            if (provider === 'gemini') {
                const response = await fetch(GEMINI_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: expectJson ? `${prompt}\n\nRETURN ONLY VALID JSON:` : prompt }] }],
                        generationConfig: { 
                            responseMimeType: expectJson ? "application/json" : "text/plain",
                            temperature: 0.1 
                        }
                    })
                });
                
                const data = await response.json();
                const content = data.candidates[0].content.parts[0].text;
                return expectJson ? JSON.parse(content) : content;
                
            } else if (provider === 'openai') {
                const response = await fetch(OPENAI_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${OPENAI_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: 'gpt-4o-mini',
                        messages: [{ role: 'user', content: prompt }],
                        response_format: expectJson ? { type: "json_object" } : undefined,
                        temperature: 0.1
                    })
                });
                
                const data = await response.json();
                const content = data.choices[0].message.content;
                return expectJson ? JSON.parse(content) : content;
            }
        } catch (error) {
            console.error(`AI call failed (${provider}):`, error.message);
            return expectJson ? {} : 'Analysis failed';
        }
    }

    showProgressStats(result) {
        console.log(`   📊 Overall Score: ${result.overallScore}/10`);
        console.log(`   🧮 Formula: ${result.formulaAnalysis.mathematicalCorrectness}/10`);
        console.log(`   🎨 UX: ${result.uxAnalysis.usabilityScore}/10`);
        console.log(`   🏆 Competitive: ${result.competitiveAnalysis.currentMetrics.inputCount} inputs, ${result.competitiveAnalysis.currentMetrics.outputCount} outputs`);
    }

    async generateReports() {
        // Generate individual reports
        for (const result of this.results) {
            await this.generateIndividualReport(result);
        }
        
        // Generate summary reports
        await this.generateSummaryReport();
        await this.generateCompetitiveReport();
        await this.generateIssuesPriorityReport();
    }

    async generateIndividualReport(result) {
        const filename = `individual_${result.filename.replace('.tsx', '')}.md`;
        const filepath = path.join(AUDIT_RESULTS_DIR, filename);
        
        const report = `# Calculator Audit Report: ${result.metadata.title}

**Overall Score: ${result.overallScore}/10**
**Audit Date:** ${new Date(result.timestamp).toLocaleDateString()}

## Executive Summary

${this.getExecutiveSummary(result)}

## Formula Analysis (Score: ${result.formulaAnalysis.mathematicalCorrectness}/10)

### Mathematical Correctness: ${result.formulaAnalysis.mathematicalCorrectness}/10
### Implementation Quality: ${result.formulaAnalysis.implementationQuality}/10
### Formula Complexity: ${result.formulaAnalysis.formulaComplexity}

**Detected Issues:**
${result.formulaAnalysis.detectedIssues?.map(issue => `- ${issue}`).join('\n') || 'None detected'}

**Recommendations:**
${result.formulaAnalysis.recommendations?.map(rec => `- ${rec}`).join('\n') || 'None provided'}

## UX Analysis

### Usability: ${result.uxAnalysis.usabilityScore}/10
### Accessibility: ${result.uxAnalysis.accessibilityScore}/10  
### Responsive Design: ${result.uxAnalysis.responsiveScore}/10
### Professional UI: ${result.uxAnalysis.professionalUIScore}/10

**UX Issues:**
${result.uxAnalysis.detectedUXIssues?.map(issue => `- ${issue}`).join('\n') || 'None detected'}

**Accessibility Violations:**
${result.uxAnalysis.accessibilityViolations?.map(violation => `- ${violation}`).join('\n') || 'None detected'}

## Competitive Analysis

**Category:** ${result.competitiveAnalysis.category}
**Current Metrics:**
- Inputs: ${result.competitiveAnalysis.currentMetrics.inputCount} (Benchmark: ${result.competitiveAnalysis.benchmark.avgInputs})
- Outputs: ${result.competitiveAnalysis.currentMetrics.outputCount} (Benchmark: ${result.competitiveAnalysis.benchmark.avgOutputs})
- Complexity: ${result.competitiveAnalysis.currentMetrics.codeComplexity}/10 (Benchmark: ${result.competitiveAnalysis.benchmark.complexityScore}/10)

**Competitive Position:**
- Inputs: ${result.competitiveAnalysis.competitivePosition.inputsVsBenchmark}
- Outputs: ${result.competitiveAnalysis.competitivePosition.outputsVsBenchmark}  
- Complexity: ${result.competitiveAnalysis.competitivePosition.complexityVsBenchmark}

**Strategic Recommendations:**
${result.competitiveAnalysis.recommendations.map(rec => `- ${rec}`).join('\n')}

## Next Actions

${this.generateNextActions(result)}
`;
        
        await fs.writeFile(filepath, report);
    }

    async generateSummaryReport() {
        const avgScore = this.results.reduce((sum, r) => sum + r.overallScore, 0) / this.results.length;
        const topPerformers = this.results.filter(r => r.overallScore >= 8).length;
        const needsImprovement = this.results.filter(r => r.overallScore < 6).length;
        
        const report = `# Calculator Portfolio Audit Summary

**Total Calculators Audited:** ${this.results.length}
**Average Score:** ${avgScore.toFixed(1)}/10
**Top Performers (8+):** ${topPerformers}
**Need Improvement (<6):** ${needsImprovement}

## Score Distribution

${this.generateScoreDistribution()}

## Category Performance

${this.generateCategoryPerformance()}

## Priority Issues

${this.generatePriorityIssues()}

## Strategic Recommendations

${this.generateStrategicRecommendations()}
`;
        
        await fs.writeFile(path.join(AUDIT_RESULTS_DIR, 'SUMMARY_REPORT.md'), report);
    }

    getExecutiveSummary(result) {
        if (result.overallScore >= 8) {
            return `🏆 **EXCELLENT** - This calculator meets enterprise standards with strong mathematical foundation and user experience.`;
        } else if (result.overallScore >= 6) {
            return `✅ **GOOD** - Solid calculator with minor areas for improvement to reach enterprise level.`;
        } else if (result.overallScore >= 4) {
            return `⚠️ **NEEDS IMPROVEMENT** - Functional but requires significant enhancements in multiple areas.`;
        } else {
            return `🔴 **CRITICAL** - Major issues detected that impact functionality and user experience.`;
        }
    }

    generateNextActions(result) {
        const actions = [];
        
        if (result.formulaAnalysis.mathematicalCorrectness < 7) {
            actions.push("🔴 **HIGH PRIORITY**: Review and fix mathematical formulas");
        }
        
        if (result.uxAnalysis.accessibilityScore < 6) {
            actions.push("🔴 **HIGH PRIORITY**: Implement WCAG 2.1 accessibility requirements");
        }
        
        if (result.uxAnalysis.usabilityScore < 6) {
            actions.push("🟡 **MEDIUM PRIORITY**: Improve user experience and interface design");
        }
        
        if (result.competitiveAnalysis.competitivePosition.inputsVsBenchmark === 'below_benchmark') {
            actions.push("🟡 **MEDIUM PRIORITY**: Consider adding more input options to match competitor offerings");
        }
        
        if (actions.length === 0) {
            actions.push("✅ **LOW PRIORITY**: Minor optimizations and continued monitoring");
        }
        
        return actions.join('\n');
    }

    // Additional report generation methods...
    generateScoreDistribution() {
        const distribution = { '9-10': 0, '7-8': 0, '5-6': 0, '3-4': 0, '0-2': 0 };
        
        this.results.forEach(r => {
            if (r.overallScore >= 9) distribution['9-10']++;
            else if (r.overallScore >= 7) distribution['7-8']++;
            else if (r.overallScore >= 5) distribution['5-6']++;
            else if (r.overallScore >= 3) distribution['3-4']++;
            else distribution['0-2']++;
        });
        
        return Object.entries(distribution)
            .map(([range, count]) => `- ${range}: ${count} calculators`)
            .join('\n');
    }

    generateCategoryPerformance() {
        const categoryStats = {};
        
        this.results.forEach(r => {
            const cat = r.competitiveAnalysis?.category || 'Unknown';
            if (!categoryStats[cat]) {
                categoryStats[cat] = { count: 0, totalScore: 0 };
            }
            categoryStats[cat].count++;
            categoryStats[cat].totalScore += r.overallScore;
        });
        
        return Object.entries(categoryStats)
            .map(([cat, stats]) => `- **${cat}**: ${stats.count} calculators, avg score ${(stats.totalScore/stats.count).toFixed(1)}/10`)
            .join('\n');
    }

    generatePriorityIssues() {
        const allIssues = this.results.flatMap(r => [
            ...(r.formulaAnalysis.detectedIssues || []),
            ...(r.uxAnalysis.detectedUXIssues || []),
            ...(r.uxAnalysis.accessibilityViolations || [])
        ]);
        
        // Count frequency of similar issues
        const issueFrequency = {};
        allIssues.forEach(issue => {
            const key = issue.toLowerCase();
            issueFrequency[key] = (issueFrequency[key] || 0) + 1;
        });
        
        return Object.entries(issueFrequency)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([issue, count]) => `- ${issue} (${count} occurrences)`)
            .join('\n');
    }

    generateStrategicRecommendations() {
        const lowScoreCount = this.results.filter(r => r.overallScore < 6).length;
        const totalCount = this.results.length;
        const improvementNeeded = (lowScoreCount / totalCount) * 100;
        
        const recommendations = [];
        
        if (improvementNeeded > 30) {
            recommendations.push("🎯 **Immediate Action Required**: >30% of calculators need significant improvement");
            recommendations.push("📋 **Recommend**: Implement standardized quality checklist for all new calculators");
        }
        
        recommendations.push("🔍 **Quality Gates**: Implement automated testing for mathematical accuracy");
        recommendations.push("♿ **Accessibility**: Standardize WCAG 2.1 compliance across all calculators");
        recommendations.push("📊 **Competitive Analysis**: Regular benchmarking against top competitors");
        
        return recommendations.join('\n');
    }
}

// ========================================
// MAIN EXECUTION
// ========================================

async function main() {
    const auditor = new CalculatorAuditor();
    await auditor.auditAllCalculators();
}

main().catch(console.error);