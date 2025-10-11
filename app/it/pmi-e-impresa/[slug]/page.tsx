import { notFound } from 'next/navigation';
import fs from 'fs/promises';
import path from 'path';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { getCalculator } from '@/lib/calculator-registry';

type Props = { params: { slug: string } };

async function getCalculatorComponent(componentName: string) {
  try {
    return (await import(`@/components/calculators/${componentName}`)).default;
  } catch (error) {
    return null;
  }
}

async function getContent(slug: string) {
  try {
    const contentPath = path.join(process.cwd(), 'content', 'it', 'pmi-e-impresa', `${slug}.md`);
    return await fs.readFile(contentPath, 'utf8');
  } catch (error) { return null; }
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
      { name: "PMI e Impresa", path: "/it/pmi-e-impresa" },
      { name: calculatorName }
  ];

  return (
    <div className="space-y-8">
        <Breadcrumb crumbs={crumbs} />
        
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
            {/* Calculator */}
            <div className="lg:col-span-1  bg-white rounded-2xl shadow-lg">
                <CalculatorComponent />
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
