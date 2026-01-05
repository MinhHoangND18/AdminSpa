import StoreForm from '../StoreForm';
import { storesApi } from '@/lib/api/stores';
import { Store } from '@/types/store';

export async function generateStaticParams() {
  try {
    const response = await storesApi.getAll({});
    const stores = response?.data?.data || [];
 
    const paths = stores.map((store: Store) => ({
      slug: [store.id.toString()],
    }));
 
    return [{ slug: [] }, ...paths];

  } catch (error) {
    console.error("Failed to generate static params for stores:", error);
    return [{ slug: [] }];
  }
}

export default async function DynamicStoresPage({ params }: { params: { slug?: string[] } }) {
  const resolvedParams = await params;
  return <StoreForm slug={resolvedParams.slug} />;
}

