import BookingForm from '../BookingForm';
import { getBookings } from '@/lib/api/bookings';
import { Booking } from '@/types/booking';

export async function generateStaticParams() {
  try {
    const response = await getBookings({});
    const bookings = response.data || [];

    const paths = bookings.map((bookings: Booking) => ({
      slug: [bookings.id.toString()],
    }));
 
    return [{ slug: [] }, ...paths];

  } catch (error) {
    console.error("Failed to generate static params for service:", error);
    return [{ slug: [] }];
  }
}

export default async function DynamicUsersPage({ params }: { params: { slug?: string[] } }) {
  const resolvedParams = await params;
  return <BookingForm slug={resolvedParams.slug} />;}
