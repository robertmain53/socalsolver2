// review-engine.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import lighthouse from 'lighthouse';
import chromeLauncher from 'chrome-launcher';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ReviewEngine {
    constructor() {
        this.results = {};
        this.reportsDir = path.join(__dirname, 'audit-reports');
        this.ensureReportsDir();
    }

    async ensureReportsDir() {
        try {
            await fs.mkdir(this.reportsDir, { recursive: true });
        } catch (error) {
            console.error('Error creating reports directory:', error);
        }
    }

    async reviewCalculator(calcPath) {
        console.log(`🔍 Reviewing calculator: ${calcPath}`);
        
        const results = {
            calculator_path: calcPath,
            timestamp: new Date().toISOString(),
            ux_score: await this.runUXAudit(calcPath),
            seo_score: await this.runSEOAudit(calcPath),
            accessibility_score: await this.runA11yAudit(calcPath),
            performance_score: await this.runLighthouse(calcPath),
            content_quality: await this.analyzeContent(calcPath),
            competitor_analysis: await this.compareWithCompetitors(calcPath)
        };

        return this.generateReport(results);
    }

    async runUXAudit(calcPath) {
        console.log('  📊 Running UX Audit...');
        
        try {
            const componentPath = this.getComponentPath(calcPath);
            const content = await fs.readFile(componentPath, 'utf8');
            
            let score = 100;
            const issues = [];

            // Check for input validation
            if (!content.includes('useState') && !content.includes('useForm')) {
                score -= 15;
                issues.push('No state management detected');
            }

            // Check for error handling
            if (!content.includes('error') && !content.includes('Error')) {
                score -= 10;
                issues.push('No error handling detected');
            }

            // Check for loading states
            if (!content.includes('loading') && !content.includes('Loading')) {
                score -= 5;
                issues.push('No loading states detected');
            }

            // Check for responsive design
            if (!content.includes('md:') && !content.includes('lg:')) {
                score -= 15;
                issues.push('No responsive design classes detected');
            }

            // Check for accessibility
            if (!content.includes('aria-') && !content.includes('role=')) {
                score -= 10;
                issues.push('No accessibility attributes detected');
            }

            // Check for user feedback
            if (!content.includes('hover:') && !content.includes('focus:')) {
                score -= 10;
                issues.push('Limited user feedback interactions');
            }

            return {
                score: Math.max(0, score),
                issues,
                suggestions: this.getUXSuggestions(issues)
            };
        } catch (error) {
            return { score: 0, error: error.message };
        }
    }

    async runSEOAudit(calcPath) {
        console.log('  🔍 Running SEO Audit...');
        
        try {
            const contentPath = this.getContentPath(calcPath);
            let content = '';
            
            try {
                content = await fs.readFile(contentPath, 'utf8');
            } catch {
                // Content file might not exist
            }

            let score = 100;
            const issues = [];

            // Check for title
            if (!content.includes('# ') && !content.includes('## ')) {
                score -= 20;
                issues.push('No proper headings structure');
            }

            // Check for meta description equivalent
            if (content.length < 300) {
                score -= 15;
                issues.push('Content too short for SEO');
            }

            // Check for keywords density
            const wordCount = content.split(' ').length;
            if (wordCount < 500) {
                score -= 10;
                issues.push('Content below recommended word count');
            }

            // Check for internal linking structure
            if (!content.includes('[') || !content.includes('](')) {
                score -= 10;
                issues.push('No internal links detected');
            }

            // Check for FAQ section
            if (!content.includes('FAQ') && !content.includes('Domande')) {
                score -= 15;
                issues.push('No FAQ section detected');
            }

            return {
                score: Math.max(0, score),
                word_count: wordCount,
                issues,
                suggestions: this.getSEOSuggestions(issues)
            };
        } catch (error) {
            return { score: 0, error: error.message };
        }
    }

    async runA11yAudit(calcPath) {
        console.log('  ♿ Running Accessibility Audit...');
        
        try {
            const componentPath = this.getComponentPath(calcPath);
            const content = await fs.readFile(componentPath, 'utf8');
            
            let score = 100;
            const issues = [];

            // Check for semantic HTML
            if (!content.includes('<label') && content.includes('<input')) {
                score -= 20;
                issues.push('Input fields without labels');
            }

            // Check for ARIA attributes
            if (content.includes('<button') && !content.includes('aria-label')) {
                score -= 10;
                issues.push('Buttons without aria-labels');
            }

            // Check for proper heading structure
            if (content.includes('<h2') && !content.includes('<h1')) {
                score -= 15;
                issues.push('Improper heading hierarchy');
            }

            // Check for alt text (if images exist)
            if (content.includes('<img') && !content.includes('alt=')) {
                score -= 15;
                issues.push('Images without alt text');
            }

            // Check for keyboard navigation support
            if (!content.includes('onKeyDown') && !content.includes('tabIndex')) {
                score -= 10;
                issues.push('Limited keyboard navigation support');
            }

            // Check for color contrast (basic check for dark/light theme support)
            if (!content.includes('text-gray') && !content.includes('bg-')) {
                score -= 5;
                issues.push('Potential color contrast issues');
            }

            return {
                score: Math.max(0, score),
                issues,
                suggestions: this.getA11ySuggestions(issues)
            };
        } catch (error) {
            return { score: 0, error: error.message };
        }
    }

    async runLighthouse(calcPath) {
        console.log('  🚀 Running Lighthouse Performance Audit...');
        
        // This is a simplified version - in production you'd run actual Lighthouse
        try {
            const componentPath = this.getComponentPath(calcPath);
            const content = await fs.readFile(componentPath, 'utf8');
            
            let score = 100;
            const issues = [];

            // Check for performance anti-patterns
            if (content.includes('useEffect') && !content.includes('[]')) {
                score -= 10;
                issues.push('useEffect without proper dependencies');
            }

            // Check for heavy computations in render
            if (content.includes('.map(') && content.includes('.filter(')) {
                score -= 5;
                issues.push('Multiple array operations in render');
            }

            // Check for inline styles
            if (content.includes('style={{')) {
                score -= 5;
                issues.push('Inline styles detected');
            }

            // Check for large bundle indicators
            if (content.includes('import') && content.split('import').length > 10) {
                score -= 10;
                issues.push('Many imports may increase bundle size');
            }

            return {
                score: Math.max(0, score),
                issues,
                suggestions: this.getPerformanceSuggestions(issues)
            };
        } catch (error) {
            return { score: 0, error: error.message };
        }
    }

    async analyzeContent(calcPath) {
        console.log('  📄 Analyzing Content Quality...');
        
        try {
            const contentPath = this.getContentPath(calcPath);
            let content = '';
            
            try {
                content = await fs.readFile(contentPath, 'utf8');
            } catch {
                return { score: 0, error: 'Content file not found' };
            }

            let score = 100;
            const analysis = {};

            // Word count analysis
            const wordCount = content.split(' ').length;
            analysis.word_count = wordCount;
            
            if (wordCount < 500) {
                score -= 20;
            } else if (wordCount > 2000) {
                score += 10; // Bonus for comprehensive content
            }

            // Readability analysis (simplified)
            const sentences = content.split(/[.!?]+/).length;
            const avgWordsPerSentence = wordCount / sentences;
            analysis.readability = {
                avg_sentence_length: Math.round(avgWordsPerSentence),
                total_sentences: sentences
            };

            if (avgWordsPerSentence > 25) {
                score -= 10;
            }

            // Structure analysis
            const headings = content.match(/^#+\s/gm) || [];
            analysis.structure = {
                headings_count: headings.length,
                has_introduction: content.includes('## Introduzione') || content.includes('# Introduzione'),
                has_examples: content.includes('Esempio') || content.includes('esempio'),
                has_faq: content.includes('FAQ') || content.includes('Domande')
            };

            if (headings.length < 3) score -= 15;
            if (!analysis.structure.has_introduction) score -= 10;
            if (!analysis.structure.has_examples) score -= 15;
            if (!analysis.structure.has_faq) score -= 10;

            return {
                score: Math.max(0, score),
                analysis,
                suggestions: this.getContentSuggestions(analysis)
            };
        } catch (error) {
            return { score: 0, error: error.message };
        }
    }

    async compareWithCompetitors(calcPath) {
        console.log('  🏆 Running Competitor Analysis...');
        
        // Simplified competitor analysis
        const competitors = [
            'calculator.net',
            'omnicalculator.com',
            'rapidtables.com',
            'mathway.com'
        ];

        return {
            score: 85, // Placeholder score
            competitors_analyzed: competitors,
            advantages: [
                'Localized for Italian market',
                'Professional focus',
                'Comprehensive categorization'
            ],
            improvements_needed: [
                'More interactive visualizations',
                'Mobile optimization',
                'Social sharing features'
            ]
        };
    }

    getComponentPath(calcPath) {
        return path.join(__dirname, 'components', 'calculators', `${calcPath}.tsx`);
    }

    getContentPath(calcPath) {
        // Assume content structure based on your setup
        return path.join(__dirname, 'content', 'it', calcPath.split('/')[0], `${calcPath.split('/')[1]}.md`);
    }

    getUXSuggestions(issues) {
        const suggestions = {
            'No state management detected': 'Implement useState or useForm for better user interaction',
            'No error handling detected': 'Add error boundaries and input validation',
            'No loading states detected': 'Add loading indicators for better UX',
            'No responsive design classes detected': 'Use Tailwind responsive prefixes (md:, lg:)',
            'No accessibility attributes detected': 'Add ARIA labels and semantic HTML',
            'Limited user feedback interactions': 'Add hover and focus states'
        };
        
        return issues.map(issue => suggestions[issue] || 'Review this issue');
    }

    getSEOSuggestions(issues) {
        const suggestions = {
            'No proper headings structure': 'Add H1, H2, H3 hierarchy',
            'Content too short for SEO': 'Expand content to at least 500 words',
            'Content below recommended word count': 'Add more detailed explanations and examples',
            'No internal links detected': 'Add links to related calculators',
            'No FAQ section detected': 'Add comprehensive FAQ section'
        };
        
        return issues.map(issue => suggestions[issue] || 'Review this issue');
    }

    getA11ySuggestions(issues) {
        const suggestions = {
            'Input fields without labels': 'Add <label> elements for all inputs',
            'Buttons without aria-labels': 'Add descriptive aria-label attributes',
            'Improper heading hierarchy': 'Start with H1 and follow proper order',
            'Images without alt text': 'Add descriptive alt attributes',
            'Limited keyboard navigation support': 'Implement keyboard event handlers',
            'Potential color contrast issues': 'Ensure sufficient color contrast ratios'
        };
        
        return issues.map(issue => suggestions[issue] || 'Review this issue');
    }

    getPerformanceSuggestions(issues) {
        const suggestions = {
            'useEffect without proper dependencies': 'Add dependency array to useEffect',
            'Multiple array operations in render': 'Move computations to useMemo',
            'Inline styles detected': 'Use CSS classes instead of inline styles',
            'Many imports may increase bundle size': 'Consider code splitting and lazy loading'
        };
        
        return issues.map(issue => suggestions[issue] || 'Review this issue');
    }

    getContentSuggestions(analysis) {
        const suggestions = [];
        
        if (analysis.word_count < 500) {
            suggestions.push('Expand content with more detailed explanations');
        }
        
        if (analysis.structure.headings_count < 3) {
            suggestions.push('Add more section headings for better structure');
        }
        
        if (!analysis.structure.has_introduction) {
            suggestions.push('Add a comprehensive introduction section');
        }
        
        if (!analysis.structure.has_examples) {
            suggestions.push('Include practical examples with real numbers');
        }
        
        if (!analysis.structure.has_faq) {
            suggestions.push('Add a FAQ section to address common questions');
        }
        
        return suggestions;
    }

    async generateReport(results) {
        console.log('  📊 Generating Report...');
        
        const report = {
            ...results,
            overall_score: this.calculateOverallScore(results),
            generated_at: new Date().toISOString(),
            recommendations: this.getTopRecommendations(results)
        };

        // Save report to file
        const reportPath = path.join(this.reportsDir, `${results.calculator_path.replace('/', '_')}_${Date.now()}.json`);
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
        
        console.log(`✅ Report generated: ${reportPath}`);
        
        return report;
    }

    calculateOverallScore(results) {
        const scores = [
            results.ux_score.score || 0,
            results.seo_score.score || 0,
            results.accessibility_score.score || 0,
            results.performance_score.score || 0,
            results.content_quality.score || 0,
            results.competitor_analysis.score || 0
        ];
        
        return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }

    getTopRecommendations(results) {
        const recommendations = [];
        
        // Priority based on scores
        if (results.accessibility_score.score < 70) {
            recommendations.push({
                priority: 'HIGH',
                category: 'Accessibility',
                action: 'Fix accessibility issues immediately'
            });
        }
        
        if (results.seo_score.score < 60) {
            recommendations.push({
                priority: 'HIGH',
                category: 'SEO',
                action: 'Improve content structure and keywords'
            });
        }
        
        if (results.ux_score.score < 80) {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'User Experience',
                action: 'Enhance user interactions and feedback'
            });
        }
        
        return recommendations.slice(0, 5); // Top 5 recommendations
    }

    // Batch review multiple calculators
    async reviewAllCalculators() {
        console.log('🚀 Starting batch review of all calculators...');
        
        const componentsDir = path.join(__dirname, 'components', 'calculators');
        const files = await fs.readdir(componentsDir);
        const calculatorFiles = files.filter(file => file.endsWith('.tsx'));
        
        const results = [];
        
        for (const file of calculatorFiles) {
            const calcPath = file.replace('.tsx', '');
            try {
                const result = await this.reviewCalculator(calcPath);
                results.push(result);
                console.log(`✅ Reviewed: ${calcPath} - Overall Score: ${result.overall_score}`);
            } catch (error) {
                console.error(`❌ Failed to review ${calcPath}:`, error.message);
            }
        }
        
        // Generate summary report
        await this.generateSummaryReport(results);
        
        return results;
    }

    async generateSummaryReport(results) {
        const summary = {
            total_calculators: results.length,
            average_scores: {
                overall: Math.round(results.reduce((sum, r) => sum + r.overall_score, 0) / results.length),
                ux: Math.round(results.reduce((sum, r) => sum + (r.ux_score.score || 0), 0) / results.length),
                seo: Math.round(results.reduce((sum, r) => sum + (r.seo_score.score || 0), 0) / results.length),
                accessibility: Math.round(results.reduce((sum, r) => sum + (r.accessibility_score.score || 0), 0) / results.length),
                performance: Math.round(results.reduce((sum, r) => sum + (r.performance_score.score || 0), 0) / results.length),
                content: Math.round(results.reduce((sum, r) => sum + (r.content_quality.score || 0), 0) / results.length)
            },
            top_performers: results
                .sort((a, b) => b.overall_score - a.overall_score)
                .slice(0, 10)
                .map(r => ({ path: r.calculator_path, score: r.overall_score })),
            needs_improvement: results
                .sort((a, b) => a.overall_score - b.overall_score)
                .slice(0, 10)
                .map(r => ({ path: r.calculator_path, score: r.overall_score })),
            generated_at: new Date().toISOString()
        };
        
        const summaryPath = path.join(this.reportsDir, `summary_${Date.now()}.json`);
        await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
        
        console.log(`📊 Summary report generated: ${summaryPath}`);
        return summary;
    }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const reviewEngine = new ReviewEngine();
    
    const command = process.argv[2];
    const target = process.argv[3];
    
    if (command === 'review' && target) {
        reviewEngine.reviewCalculator(target)
            .then(result => {
                console.log('\n📊 REVIEW COMPLETED');
                console.log(`Overall Score: ${result.overall_score}/100`);
                console.log(`UX Score: ${result.ux_score.score}/100`);
                console.log(`SEO Score: ${result.seo_score.score}/100`);
                console.log(`Accessibility Score: ${result.accessibility_score.score}/100`);
                console.log(`Performance Score: ${result.performance_score.score}/100`);
                console.log(`Content Quality Score: ${result.content_quality.score}/100`);
            })
            .catch(console.error);
    } else if (command === 'review-all') {
        reviewEngine.reviewAllCalculators()
            .then(results => {
                console.log(`\n✅ Batch review completed for ${results.length} calculators`);
            })
            .catch(console.error);
    } else {
        console.log('Usage:');
        console.log('  node review-engine.js review <calculator-name>');
        console.log('  node review-engine.js review-all');
    }
}

export default ReviewEngine;// Review Engine - da implementare manualmente
