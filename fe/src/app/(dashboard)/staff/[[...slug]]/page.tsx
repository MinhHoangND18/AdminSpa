import StaffForm from '../StaffForm';
import { getStaff } from '@/lib/api/staffs';
import { Staff } from '@/types/staff';

export async function generateStaticParams() {
  try {
    const response = await getStaff({});
    const staff = response?.data?.data || [];

    const paths = staff.map((user: Staff) => ({
      slug: [user.id.toString()],
    }));
 
    return [{ slug: [] }, ...paths];

  } catch (error) {
    console.error("Failed to generate static params for stores:", error);
    return [{ slug: [] }];
  }
}

export default async function DynamicUsersPage({ params }: { params: { slug?: string[] } }) {
  const resolvedParams = await params;
  return <StaffForm slug={resolvedParams.slug} />;
}

