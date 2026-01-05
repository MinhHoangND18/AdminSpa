import CategoryForm from '../CategoryForm';
import { getActiveServiceCategories } from '@/lib/api/service-categories';
import { ServiceCategory } from '@/types/service-category';

export async function generateStaticParams() {
  try {
    const response = await getActiveServiceCategories();
    const servicecategories = response || [];

    const paths = servicecategories.map((servicecategories: ServiceCategory) => ({
      slug: [servicecategories.id.toString()],
    }));
 
    return [{ slug: [] }, ...paths];

  } catch (error) {
    console.error("Failed to generate static params for service:", error);
    return [{ slug: [] }];
  }
}

export default async function DynamicUsersPage({ params }: { params: { slug?: string[] } }) {
  const resolvedParams = await params;
  return <CategoryForm slug={resolvedParams.slug} />;}