import Link from 'next/link';
import fs from 'fs/promises';
import path from 'path';
import Breadcrumb from '@/components/layout/Breadcrumb';

async function getCalculators() {
    const calculatorsPath = path.join(process.cwd(), 'content', 'it', 'finanza-personale');
    try {
        const entries = await fs.readdir(calculatorsPath, { withFileTypes: true });
        return entries
            .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
            .map(entry => {
                const slug = entry.name.replace('.md', '');
                const name = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                return { name, slug };
            });
    } catch (error) { return []; }
}

export default async function CategoryPage() {
  const calculators = await getCalculators();
  const categoryName = "Finanza Personale";
  const crumbs = [{ name: "Home", path: "/it" }, { name: categoryName }];

  return (
    <div className="space-y-8">
      <Breadcrumb crumbs={crumbs} />
      
      {/* Hero Category */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-12 rounded-2xl text-center">
        <h1 className="text-4xl font-bold mb-4">{categoryName}</h1>
        <p className="text-xl opacity-90">Calcolatori professionali per {categoryName.toLowerCase()}</p>
      </div>

      {/* Calculators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {calculators.map((calc) => (
            <Link 
              key={calc.slug} 
              href={`/it/finanza-personale/${calc.slug}`} 
              className="block p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <h2 className="font-bold text-xl text-slate-800 mb-2 hover:text-blue-600 transition-colors">
                {calc.name}
              </h2>
              <p className="text-gray-600">Calcolo professionale per {calc.name.toLowerCase()}</p>
            </Link>
        ))}
      </div>
    </div>
  );
}
