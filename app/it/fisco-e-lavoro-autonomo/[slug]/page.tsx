import { notFound } from 'next/navigation';
import fs from 'fs/promises';
import path from 'path';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import Script from 'next/script';
import Breadcrumb from '@/components/layout/Breadcrumb';
import RelatedCalculators from '@/components/calculator/RelatedCalculators';
import { getCalculator } from '@/lib/calculator-registry';
import { CATEGORIES } from '@/lib/categories';
import {
  generateSEOMetadata,
  generateBreadcrumbSchema,
  generateCalculatorSchema,
  generateArticleSchema,
} from '@/lib/seo';

type Props = { params: { slug: string } };

const CATEGORY = 'fisco-e-lavoro-autonomo';
const LANG = 'it';

async function getCalculatorComponent(componentName: string) {
  try {
    return (await import(`@/components/calculators/${componentName}`)).default;
  } catch (error) {
    return null;
  }
}

async function getContent(slug: string) {
  try {
    const contentPath = path.join(process.cwd(), 'content', LANG, CATEGORY, `${slug}.md`);
    return await fs.readFile(contentPath, 'utf8');
  } catch (error) {
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props) {
  const calcMeta = getCalculator(params.slug, LANG);

  if (!calcMeta) {
    return {
      title: 'Calculator Not Found',
      robots: 'noindex',
    };
  }

  return generateSEOMetadata({
    title: calcMeta.title,
    description: calcMeta.description,
    keywords: calcMeta.keywords,
    lang: LANG,
    path: `/${LANG}/${CATEGORY}/${params.slug}`,
    type: 'article',
    author: calcMeta.author,
  });
}

export default async function CalculatorPage({ params }: Props) {
  const calcMeta = getCalculator(params.slug, LANG);

  if (!calcMeta) {
    notFound();
  }

  const CalculatorComponent = await getCalculatorComponent(calcMeta.component);
  const content = await getContent(params.slug);

  if (!CalculatorComponent) {
    notFound();
  }

  // Get category info
  const categories = CATEGORIES[LANG];
  const categoryInfo = categories.find((cat) => cat.slug === CATEGORY);
  const categoryName = categoryInfo?.name || 'Fisco e Lavoro Autonomo';

  // Breadcrumbs
  const crumbs = [
    { name: 'Home', path: `/${LANG}` },
    { name: categoryName, path: `/${LANG}/${CATEGORY}` },
    { name: calcMeta.title },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(crumbs, LANG);
  const calculatorSchema = generateCalculatorSchema({
    name: calcMeta.title,
    description: calcMeta.description,
    url: `https://socalsolver.com/${LANG}/${CATEGORY}/${params.slug}`,
    category: CATEGORY,
    lang: LANG,
  });

  const articleSchema = content
    ? generateArticleSchema({
        headline: calcMeta.title,
        description: calcMeta.description,
        url: `https://socalsolver.com/${LANG}/${CATEGORY}/${params.slug}`,
        datePublished: new Date().toISOString(),
        dateModified: new Date().toISOString(),
      })
    : null;

  return (
    <>
      {/* JSON-LD Schemas */}
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="calculator-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }}
      />
      {articleSchema && (
        <Script
          id="article-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
      )}

      <div className="space-y-6 sm:space-y-8">
        <Breadcrumb crumbs={crumbs} />

        {/* Calculator */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
          <CalculatorComponent />
        </div>

        {/* Content */}
        {content && (
          <article className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-lg">
            <ReactMarkdown>{content}</ReactMarkdown>
          </article>
        )}

        {/* Related Calculators */}
        <RelatedCalculators
          currentSlug={params.slug}
          category={CATEGORY}
          lang={LANG}
          maxItems={6}
        />
      </div>
    </>
  );
}
