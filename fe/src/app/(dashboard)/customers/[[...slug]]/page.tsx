import CustomerForm from '../CustomerForm';
import { getCustomers } from '@/lib/api/customers';
import { Customer } from '@/types/customer';


export async function generateStaticParams() {
  try {
    const response = await getCustomers({});
    const customers = response.data.data || [];

    const paths = customers.map((customer: Customer) => ({
      slug: [customer.id.toString()],
    }));
 
    return [{ slug: [] }, ...paths];

  } catch (error) {
    console.error("Failed to generate static params for service:", error);
    return [{ slug: [] }];
  }
}

export default async function DynamicUsersPage({ params }: { params: { slug?: string[] } }) {
  const resolvedParams = await params;
  return <CustomerForm slug={resolvedParams.slug} />;}