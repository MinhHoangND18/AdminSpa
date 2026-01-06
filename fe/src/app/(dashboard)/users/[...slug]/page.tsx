import UserForm from '../UserForm';
import { usersApi } from '@/lib/api/users';
import { User } from '@/types/user';

export async function generateStaticParams() {
  try {
    const response = await usersApi.getAll({});
    const users = response?.data?.data || [];

    const paths = users.map((user: User) => ({
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
  return <UserForm slug={resolvedParams.slug} />;
}