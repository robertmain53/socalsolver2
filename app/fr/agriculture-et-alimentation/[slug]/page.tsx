import { notFound } from 'next/navigation';
import fs from 'fs/promises';
import path from 'path';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { generateSEOMetadata } from '@/lib/seo';
import { getCalculator } from '@/lib/calculator-registry';
import { getRequestOrigin } from '@/lib/request-context';
import CalculatorWrapper from '@/components/layout/CalculatorWrapper';
import { buildCalculatorBreadcrumbs } from '@/lib/breadcrumbs';

type Props = { params: { slug: string } };

const CATEGORY = 'agriculture-et-alimentation';
const LANG = 'fr';

async function getCalculatorComponent(componentName: string) {
  try {
    return (await import(`@/components/calculators/${componentName}`)).default;
  } catch (error) { return null; }
}


async function getContent(slug: string) {
  try {
    const contentPath = path.join(process.cwd(), 'content', 'fr', 'agriculture-et-alimentation', `${slug}.md`);
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
  const calcMeta = getCalculator(params.slug, LANG);

  if (!calcMeta) {
    notFound();
  }

  const CalculatorComponent = await getCalculatorComponent(calcMeta.component);
  const content = await getContent(params.slug);

  if (!CalculatorComponent) notFound();
  const { crumbs } = buildCalculatorBreadcrumbs({
    lang: LANG,
    calculator: calcMeta,
    fallbackCategory: CATEGORY,
    fallbackTitle: calcMeta.title,
  });

  return (
    <div className="space-y-8">
        <Breadcrumb crumbs={crumbs} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calculator */}
            <CalculatorWrapper>
                <CalculatorComponent />
            </CalculatorWrapper>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
                <div className="p-6 bg-white rounded-2xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Tools</h3>
                    <div className="space-y-2">
                        <button className="w-full p-3 text-left rounded-lg hover:bg-gray-100 transition-colors">
                            📊 Save Result
                        </button>
                        <button className="w-full p-3 text-left rounded-lg hover:bg-gray-100 transition-colors">
                            📄 Export PDF
                        </button>
                        <button className="w-full p-3 text-left rounded-lg hover:bg-gray-100 transition-colors">
                            🔗 Share
                        </button>
                    </div>
                </div>
            </div>
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
