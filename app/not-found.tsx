import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h2 className="text-2xl font-bold mb-4">الصفحة غير موجودة</h2>
      <p className="mb-4">عذراً، الصفحة التي تبحث عنها غير موجودة.</p>
      <Link href="/" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
        العودة للرئيسية
      </Link>
    </div>
  );
}
