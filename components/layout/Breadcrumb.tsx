import Link from 'next/link';

type Crumb = { name: string; path?: string; }

export default function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
    return (
        <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center space-x-2 text-sm text-gray-600">
                {crumbs.map((crumb, index) => (
                    <li key={index} className="flex items-center">
                        {crumb.path ? (
                            <Link href={crumb.path} className="text-blue-600 hover:underline">
                                {crumb.name}
                            </Link>
                        ) : (
                            <span className="text-gray-500">{crumb.name}</span>
                        )}
                        {index < crumbs.length - 1 && (
                            <svg className="w-4 h-4 mx-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
