import Invoices from '../Invoices';
import { getInvoices } from '@/lib/api/invoices';
import { Invoice } from '@/types/invoice';

export async function generateStaticParams() {
  try {
    const response = await getInvoices({});
    const invoices = response.data || [];

    const paths = invoices.map((invoice: Invoice) => ({
      slug: [invoice.id.toString()],
    }));
 
    return [{ slug: [] }, ...paths];

  } catch (error) {
    console.error("Failed to generate static params for service:", error);
    return [{ slug: [] }];
  }
}

export default async function DynamicUsersPage({ params }: { params: { slug?: string[] } }) {
  const resolvedParams = await params;
  return <Invoices slug={resolvedParams.slug} />;}