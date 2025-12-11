import { redirect } from 'next/navigation';

export default function Home() {
  // Khi component này được tải, nó sẽ ngay lập tức chuyển hướng
  // người dùng đến đường dẫn '/login'.
  redirect('/login');
}