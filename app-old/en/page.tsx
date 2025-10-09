import Link from 'next/link';
import fs from 'fs/promises';
import path from 'path';

async function getCategories() {
    const categoriesPath = path.join(process.cwd(), 'app', 'en');
    try {
        const entries = await fs.readdir(categoriesPath, { withFileTypes: true });
        return entries
            .filter(entry => entry.isDirectory() && !entry.name.startsWith('[') && !entry.name.startsWith('('))
            .map(entry => {
                const name = entry.name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                return { name, slug: entry.name };
            });
    } catch (error) {
        return [];
    }
}

export default async function HomePage() {
  const categories = await getCategories();

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16 gradient-warm text-white rounded-2xl">

        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          SoCalSolver Professional
        </h1>
        <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto mb-8">
          Professional calculators for business, finance, real estate and much more
        </p>
        <div className="flex justify-center space-x-4">
          <span className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm">
            ✨ 1500+ Calculators
          </span>
          <span className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm">
            📊 Interactive Charts
          </span>
          <span className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm">
            🎯 Precise Results
          </span>
        </div>
      </section>
      
      {/* Categories Grid */}
      <section>
        <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">Browse by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
                 <Link 
                   key={cat.slug} 
                   href={`/en/${cat.slug}`} 
                   className="group block p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                 >
                    <div className="text-center">
                      <div className="text-4xl mb-4">📊</div>
                      <h3 className="font-bold text-xl text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                        {cat.name}
                      </h3>
                      <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    </div>
                </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
