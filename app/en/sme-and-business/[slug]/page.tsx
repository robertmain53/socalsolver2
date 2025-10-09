import { notFound } from 'next/navigation';
import fs from 'fs/promises';
import path from 'path';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import Breadcrumb from '@/components/layout/Breadcrumb';

type Props = { params: { slug: string } };

async function getCalculatorComponent(slug: string) {
  try {
    const componentName = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
    return (await import(`@/components/calculators/${componentName}`)).default;
  } catch (error) { return null; }
}

async function getContent(slug: string) {
  try {
    const contentPath = path.join(process.cwd(), 'content', 'en', 'sme-and-business', `${slug}.md`);
    return await fs.readFile(contentPath, 'utf8');
  } catch (error) { return null; }
}

export default async function CalculatorPage({ params }: Props) {
  const CalculatorComponent = await getCalculatorComponent(params.slug);
  const content = await getContent(params.slug);

  if (!CalculatorComponent) notFound();
  
  const calculatorName = params.slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  const crumbs = [
      { name: "Home", path: "/en" },
      { name: "SME & Business", path: "/en/sme-and-business" },
      { name: calculatorName }
  ];

  return (
    <div className="space-y-8">
        <Breadcrumb crumbs={crumbs} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calculator */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg">
                <CalculatorComponent />
            </div>
            
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
