import { notFound } from 'next/navigation';
import fs from 'fs/promises';
import path from 'path';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { getCalculator } from '@/lib/calculator-registry';
import { generateSEOMetadata } from '@/lib/seo';
import { getRequestOrigin } from '@/lib/request-context';
import CalculatorWrapper from '@/components/layout/CalculatorWrapper';

type Props = { params: { slug: string } };

const CATEGORY = 'immobiliare-e-casa';
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
    const contentPath = path.join(process.cwd(), 'content', 'it', 'immobiliare-e-casa', `${slug}.md`);
    return await fs.readFile(contentPath, 'utf8');
  } catch (error) { return null; }
}

export async function generateMetadata({ params }: Props) {
  const origin = getRequestOrigin();
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
    origin,
  });
}

export default async function CalculatorPage({ params }: Props) {
  const calcMeta = getCalculator(params.slug, 'it');

  if (!calcMeta) {
    notFound();
  }

  const CalculatorComponent = await getCalculatorComponent(calcMeta.component);
  const content = await getContent(params.slug);

  if (!CalculatorComponent) notFound();
  
  const calculatorName = calcMeta.title;
  const crumbs = [
      { name: "Home", path: "/it" },
      { name: "Immobiliare e Casa", path: "/it/immobiliare-e-casa" },
      { name: calculatorName }
  ];

  return (
    <div className="space-y-8">
        <Breadcrumb crumbs={crumbs} />
        
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
            {/* Calculator */}
            <CalculatorWrapper>
                <CalculatorComponent />
            </CalculatorWrapper>
            
 
        </div>
        
        {/* Content */}
        {content && (
            <article className="prose lg:prose-xl max-w-none bg-white p-8 rounded-2xl shadow-lg">
                <ReactMarkdown>{content}</ReactMarkdown>
            </article>
        )}
    </div>
  );
}
