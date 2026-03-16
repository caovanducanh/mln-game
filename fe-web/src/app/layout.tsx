import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EconGame - Trò Chơi Kinh Tế Lớp Học',
  description: 'Mô phỏng kinh tế cạnh tranh cho lớp học. Tạo công ty, tuyển nhân viên, sản xuất và cạnh tranh!',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="gradient-bg min-h-screen">
        {children}
      </body>
    </html>
  );
}
