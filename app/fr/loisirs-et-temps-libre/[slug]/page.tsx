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

type Props = { params: { slug: string } };

const CATEGORY = 'loisirs-et-temps-libre';
const LANG = 'fr';

async function getCalculatorComponent(slug: string) {
  try {
    const componentName = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
    return (await import(`@/components/calculators/${componentName}`)).default;
  } catch (error) { return null; }
}

async function getContent(slug: string) {
  try {
    const contentPath = path.join(process.cwd(), 'content', 'fr', 'loisirs-et-temps-libre', `${slug}.md`);
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
  const CalculatorComponent = await getCalculatorComponent(params.slug);
  const content = await getContent(params.slug);

  if (!CalculatorComponent) notFound();
  
  const calculatorName = params.slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  const crumbs = [
      { name: "Home", path: "/fr" },
      { name: "Loisirs et temps libre", path: "/fr/loisirs-et-temps-libre" },
      { name: calculatorName }
  ];

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
