import { CATEGORIES, Lang } from './categories';
import { generateBreadcrumbSchema } from './seo';
import type { CalculatorMetadata } from './calculator-registry';

export type BreadcrumbCrumb = { name: string; path?: string };

function toTitleCaseFromSlug(slug: string): string {
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

export function getCategoryName(categorySlug: string, lang: Lang): string {
  const categories = CATEGORIES[lang] ?? [];
  const match = categories.find((category) => category.slug === categorySlug);

  return match?.name ?? toTitleCaseFromSlug(categorySlug);
}

export function buildCalculatorBreadcrumbs(params: {
  lang: Lang;
  calculator?: CalculatorMetadata;
  fallbackCategory: string;
  fallbackTitle: string;
}) {
  const categorySlug = params.calculator?.category ?? params.fallbackCategory;
  const categoryName = getCategoryName(categorySlug, params.lang);
  const calculatorTitle = params.calculator?.title ?? params.fallbackTitle;

  const crumbs: BreadcrumbCrumb[] = [
    { name: 'Home', path: `/${params.lang}` },
    { name: categoryName, path: `/${params.lang}/${categorySlug}` },
    { name: calculatorTitle },
  ];

  return {
    crumbs,
    breadcrumbSchema: generateBreadcrumbSchema(crumbs, params.lang),
    categorySlug,
    categoryName,
    calculatorTitle,
  };
}
