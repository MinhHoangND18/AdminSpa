import ServicesForm from '../ServicesForm';
import { getServices } from '@/lib/api/services';
import { Service } from '@/types/service';

export async function generateStaticParams() {
  try {
    const response = await getServices({});
    const services = response.data || [];

    const paths = services.map((service: Service) => ({
      slug: [service.id.toString()],
    }));
 
    return [{ slug: [] }, ...paths];

  } catch (error) {
    console.error("Failed to generate static params for service:", error);
    return [{ slug: [] }];
  }
}

export default async function DynamicUsersPage({ params }: { params: { slug?: string[] } }) {
  const resolvedParams = await params;
  return <ServicesForm slug={resolvedParams.slug} />;
}



