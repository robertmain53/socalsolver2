# 📝 Content Automation Guide

Complete guide for scaling SoCalSolver content creation and calculator development.

---

## 📊 Overview

This guide covers 4 major automation workflows:

1. **Content Expansion** - Add SEO content to existing calculators
2. **Category Enhancement** - Add FAQ and descriptions to category pages
3. **Bulk Calculator Creation** - Generate new calculators from Excel
4. **Automated Updates** - Keep category pages in sync with registry

---

## 🎯 Workflow 1: Content Expansion for Existing Calculators

**Goal:** Add rich, SEO-optimized content to calculators that currently have no markdown files.

### Step 1: Export Calculators

```bash
node scripts/export-calculators-for-content.js
```

**Output:**
- `content-expansion-template.csv` - All 88 calculators
- `calculators-need-content.csv` - Only calculators without content (32)

### Step 2: Competitor Research

Open `calculators-need-content.csv` in Excel/Google Sheets:

| Column | Description | Example |
|--------|-------------|---------|
| A-H | Calculator metadata (auto-filled) | - |
| I-R | Competitor URLs 1-10 | `https://competitor.com/calculator` |
| S-T | Authority sources | `https://government.site/regulations` |
| U | Notes | Optional notes for content writer |

**Research Process:**

1. For each calculator, Google the **Main Keyword** (column F)
2. Find the top 10 ranking pages
3. Paste their URLs in columns I-R
4. Find 2 authoritative sources (gov sites, official docs) for columns S-T

**Example Row:**

```
Slug: tasse-regime-forfettario
Main Keyword: regime forfettario
Competitor 1: https://www.agenziaentrate.gov.it/forfettario
Competitor 2: https://www.commercialista.com/guida-forfettario
...
Authority 1: https://www.agenziaentrate.gov.it
Authority 2: https://www.inps.it
```

### Step 3: Generate Content Templates

```bash
# Dry run first to preview
node scripts/generate-content-from-excel.js calculators-need-content.csv --dry-run

# Actually create files
node scripts/generate-content-from-excel.js calculators-need-content.csv
```

**Output:**
- Creates markdown files in `content/{lang}/{category}/{slug}.md`
- Templates include TODO sections with competitor URLs for reference
- Includes FAQ structure and authority source placeholders

### Step 4: Fill Content

Open generated markdown files and:

1. Research competitors (URLs provided in comments)
2. **Don't copy** - create superior content
3. Add specific examples and recent data
4. Cite authority sources properly
5. Fill FAQ with real questions from users

### Step 5: Update Registry

```typescript
// In lib/calculator-registry.ts
{
  slug: 'tasse-regime-forfettario',
  // ...
  hasContent: true, // ← Change this to true
}
```

### Step 6: Build and Test

```bash
npm run build
# Test locally: http://localhost:3000/it/category/slug
```

---

## 🎨 Workflow 2: Category Enhancement with FAQ

**Goal:** Add descriptions and FAQ sections to all category pages.

### Current Status

- ✅ Content defined for 6 categories in `lib/category-content.ts`
- ✅ Template ready in `scripts/update-category-pages-with-faq.js`

### Step 1: Review Existing Content

Open [lib/category-content.ts](lib/category-content.ts) and review FAQs for:

- `fisco-e-lavoro-autonomo` (Italian)
- `immobiliare-e-casa` (Italian)
- `pmi-e-impresa` (Italian)
- `risparmio-e-investimenti` (Italian)
- `finance-and-investment` (English)
- `tax-and-freelance-uk-us-ca` (English)
- `impuestos-y-trabajo-autonomo` (Spanish)
- `fiscalite-et-travail-independant` (French)

### Step 2: Add More Categories

Edit `lib/category-content.ts` to add content for remaining categories:

```typescript
'auto-e-trasporti': {
  it: {
    description: 'Short description for SEO',
    longDescription: 'Longer description for category page',
    faqs: [
      {
        question: 'Common question about cars/transport?',
        answer: 'Detailed answer with specific info...'
      },
      // Add 4-5 FAQs per category
    ]
  }
},
```

**Tips for FAQ:**
- Answer questions users actually ask
- Use specific numbers and examples
- Include 2025 regulations/data
- Keep answers concise but complete (150-300 words)

### Step 3: Update Category Pages

```bash
node scripts/update-category-pages-with-faq.js
```

**What it does:**
- ✅ Backs up original pages as `page.tsx.backup`
- ✅ Replaces all category page.tsx files
- ✅ Adds dynamic FAQ sections
- ✅ Adds description sections
- ✅ Generates FAQ Schema for Google rich results

### Step 4: Customize Per Category

For categories needing special content:

1. Edit the category page after automation: `app/{lang}/{category}/page.tsx`
2. Customize the SEO content section at the bottom
3. Add category-specific features if needed

### Step 5: Build and Validate

```bash
npm run build

# Test FAQ schema
curl -s http://localhost:3000/it/fisco-e-lavoro-autonomo | grep "application/ld+json"
```

---

## 🚀 Workflow 3: Bulk Calculator Creation

**Goal:** Create multiple calculators at once from an Excel file.

### Step 1: Prepare Excel/CSV

Create `new-calculators.csv` with these columns:

| Column | Name | Example |
|--------|------|---------|
| A | Language | `it` |
| B | Category | `fisco-e-lavoro-autonomo` |
| C | Slug | `calcolo-ritenuta-acconto` |
| D | Title | `Calcolo Ritenuta d'Acconto 20%` |
| E | Description | `Calcola la ritenuta d'acconto...` |
| F | Main Keyword | `ritenuta acconto` |
| G | Component Name | `RitenutaAccontoCalculator` |
| H | Subcategories | `ritenuta, professionisti, pagamenti` |
| I-R | Competitor URLs 1-10 | URLs for research |
| S-T | Authority Sources | Official sources |

**Template:**
```csv
Language,Category,Slug,Title,Description,Main Keyword,Component Name,Subcategories,Competitor URL 1,Competitor URL 2,...
it,fisco-e-lavoro-autonomo,calcolo-ritenuta-acconto,"Calcolo Ritenuta d'Acconto 20%","Calcola la ritenuta d'acconto del 20% su compensi professionali",ritenuta acconto,RitenutaAccontoCalculator,"ritenuta, professionisti",https://example.com,https://example2.com
```

### Step 2: Dry Run

```bash
node scripts/bulk-create-calculators.js new-calculators.csv --dry-run
```

Reviews:
- Which components will be created
- Which registry entries will be generated
- Which content files will be created

### Step 3: Generate Everything

```bash
node scripts/bulk-create-calculators.js new-calculators.csv
```

**Creates:**
1. **Calculator Components** → `components/calculators/ComponentName.tsx`
2. **Registry Entries** → `NEW-REGISTRY-ENTRIES.txt`
3. **Content Templates** → `content/{lang}/{category}/{slug}.md`

### Step 4: Add to Registry

1. Open `NEW-REGISTRY-ENTRIES.txt`
2. Copy all entries
3. Paste into `lib/calculator-registry.ts` in the appropriate section
4. Save

### Step 5: Implement Calculator Logic

For each component in `components/calculators/`:

1. Open the `ComponentName.tsx` file
2. Replace the TODO placeholders with:
   - Actual input fields
   - Calculation logic
   - Result formatting
3. Add charts/graphs if applicable (using recharts)
4. Test thoroughly

### Step 6: Fill Content

Same as Workflow 1, step 4:

1. Open content files
2. Research competitors
3. Write superior content
4. Add FAQs and citations

### Step 7: Build and Deploy

```bash
npm run build
npm run start
```

---

## 🔄 Workflow 4: Auto-Update Category Pages

**Goal:** Automatically regenerate category pages when calculators are added to registry.

This is **automatically handled** by the dynamic category pages! They read from the calculator registry on every build.

### How It Works

```typescript
// In any category page.tsx
const calculators = getCalculatorsByCategory(CATEGORY, LANG);
```

This function dynamically reads from `lib/calculator-registry.ts`, so:

✅ Add calculator to registry → Automatically appears on category page
✅ Remove calculator → Automatically removed from category page
✅ Update calculator title → Automatically updated on category page

**No manual updates needed!**

---

## 📁 File Structure Reference

```
socalsolver2/
├── scripts/
│   ├── export-calculators-for-content.js    # Step 1: Export to CSV
│   ├── generate-content-from-excel.js       # Step 2: Generate markdown
│   ├── update-category-pages-with-faq.js    # Add FAQ to categories
│   └── bulk-create-calculators.js           # Bulk generate calculators
│
├── lib/
│   ├── calculator-registry.ts               # Single source of truth
│   ├── category-content.ts                  # FAQ and descriptions
│   └── seo.ts                               # SEO utilities
│
├── content/                                 # Markdown content files
│   ├── it/{category}/{slug}.md
│   ├── en/{category}/{slug}.md
│   ├── es/{category}/{slug}.md
│   └── fr/{category}/{slug}.md
│
├── components/calculators/                  # Calculator components
│   └── CalculatorName.tsx
│
├── app/{lang}/{category}/                   # Category pages (auto-updated)
│   ├── page.tsx
│   └── [slug]/page.tsx
│
└── Generated files:
    ├── content-expansion-template.csv       # All calculators
    ├── calculators-need-content.csv         # Needs content
    └── NEW-REGISTRY-ENTRIES.txt             # Bulk creation output
```

---

## 🎯 Quick Reference

### I want to add content to existing calculators

```bash
# 1. Export
node scripts/export-calculators-for-content.js

# 2. Fill competitor URLs in calculators-need-content.csv

# 3. Generate templates
node scripts/generate-content-from-excel.js calculators-need-content.csv

# 4. Fill content manually

# 5. Update hasContent: true in registry
```

### I want to add FAQ to category pages

```bash
# 1. Add content to lib/category-content.ts

# 2. Run update script
node scripts/update-category-pages-with-faq.js

# 3. Build and test
npm run build
```

### I want to create 50 new calculators

```bash
# 1. Create new-calculators.csv with all data

# 2. Generate everything
node scripts/bulk-create-calculators.js new-calculators.csv

# 3. Add registry entries from NEW-REGISTRY-ENTRIES.txt

# 4. Implement calculator logic

# 5. Fill content templates

# 6. Build and deploy
npm run build
```

---

## 💡 Best Practices

### Content Writing

1. **Research Competitors First**
   - Analyze top 10 ranking pages
   - Identify gaps in their content
   - Find what you can do better

2. **Be More Comprehensive**
   - Longer, more detailed explanations
   - More examples with real numbers
   - Better structure with headings

3. **Add 2025 Data**
   - Use current tax rates, limits, regulations
   - Reference recent law changes
   - Show examples with 2025 values

4. **Cite Authority Sources**
   - Government websites
   - Official documentation
   - Academic research
   - Build trust and credibility

5. **Write for Users, Optimize for SEO**
   - Answer real questions users have
   - Use natural language
   - Include keywords naturally
   - Focus on providing value

### FAQ Writing

1. **Ask Real Questions**
   - Use "People Also Ask" from Google
   - Check forums and Reddit
   - Review competitor FAQs

2. **Give Complete Answers**
   - 150-300 words per answer
   - Include specific examples
   - Reference exact numbers/percentages
   - Link to authority sources

3. **Structure for Rich Results**
   - Question format: "How do I...?"
   - Start answer immediately
   - No fluff or long introductions
   - Direct and informative

### Component Development

1. **Start with Template**
   - Use bulk creation script
   - Fills in boilerplate

2. **Add Real Inputs**
   - Match calculator purpose
   - Validate input properly
   - Add helper text

3. **Implement Calculation**
   - Use correct formulas
   - Handle edge cases
   - Round appropriately

4. **Format Results**
   - Clear labels
   - Proper formatting (currency, percentages)
   - Add breakdown/explanation

5. **Add Disclaimers**
   - Results are indicative
   - Consult professionals
   - Based on current regulations

---

## 🔍 SEO Checklist

After adding content, verify:

### On-Page SEO
- [ ] H1 tag matches page title
- [ ] Meta description (155-160 chars)
- [ ] Main keyword in first paragraph
- [ ] Keyword density 1-2%
- [ ] Alt text on images
- [ ] Internal links to related calculators
- [ ] External links to authority sources

### Schema Markup
- [ ] Breadcrumb schema
- [ ] Calculator/WebApplication schema
- [ ] FAQ schema (if FAQs present)
- [ ] Article schema (for content pages)
- [ ] Valid JSON-LD syntax

### Content Quality
- [ ] 1000+ words for main calculators
- [ ] 500+ words for simpler tools
- [ ] 5+ FAQs per category page
- [ ] Examples with real numbers
- [ ] Updated for 2025 regulations

### Technical SEO
- [ ] Canonical URL set
- [ ] Hreflang tags for all languages
- [ ] Mobile-responsive
- [ ] Page speed < 3s
- [ ] No broken links

---

## 📊 Tracking Progress

### Current Stats

Run this to see progress:

```bash
node scripts/export-calculators-for-content.js
```

Outputs:
- Total calculators: 88
- With content: 60%
- Without content: 40%
- By language breakdown

### Goal

- **Short-term:** 100% content coverage (88/88)
- **Mid-term:** 200 total calculators
- **Long-term:** 500+ calculators across all languages

---

## 🆘 Troubleshooting

### "Calculator doesn't appear on category page"

1. Check `lib/calculator-registry.ts` - is entry present?
2. Verify `category` and `lang` match exactly
3. Rebuild: `npm run build`

### "Content not showing on calculator page"

1. Check file exists: `content/{lang}/{category}/{slug}.md`
2. Verify `hasContent: true` in registry
3. Check frontmatter format in markdown

### "FAQ not showing on category page"

1. Check `lib/category-content.ts` - entry exists?
2. Category key matches exactly?
3. FAQ array has items?
4. Rebuild and clear cache

### "Build errors after adding calculators"

1. Check TypeScript syntax in components
2. Verify all imports are correct
3. Run `npm run lint` for details
4. Check component name matches registry

---

## 🚀 Next Steps

1. **Export current calculators** and add competitor research
2. **Generate content templates** for 32 calculators without content
3. **Fill FAQ** for remaining categories in `lib/category-content.ts`
4. **Create Excel** with 50-100 new calculator ideas
5. **Bulk generate** new calculators
6. **Implement logic** for new calculators
7. **Write content** for all new calculators
8. **Build and deploy**

---

**Last Updated:** 2025-10-10
**Status:** All automation scripts ready and tested
**Next Priority:** Content expansion for existing 32 calculators

🎉 **You now have a complete content automation system!**
