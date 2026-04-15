import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { client } from '@/lib/sanity/client';
import { postsQuery } from '@/lib/sanity/queries';
import { urlForImage } from '@/lib/sanity/image';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'المدونة | خبير السيو',
  description: 'أحدث المقالات والنصائح حول تحسين محركات البحث (SEO) والتسويق الرقمي.',
  alternates: { canonical: '/blog' },
  openGraph: { title: 'المدونة | خبير السيو', url: '/blog', type: 'website' },
};

export default async function BlogPage() {
  const posts = await client.fetch(postsQuery);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950" dir="rtl">
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">خبير السيو</span>
          </div>
          <Link href="/" className="text-sm font-medium text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors flex items-center gap-1">
            العودة للتطبيق
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        </div>
      </header>

      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">مدونة خبير السيو</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">اكتشف أحدث الاستراتيجيات والنصائح لتحسين ظهور موقعك في محركات البحث.</p>
        </div>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post: any) => (
              <Link href={`/blog/${post.slug.current}`} key={post._id} className="group">
                <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {post.mainImage ? (
                      <Image src={urlForImage(post.mainImage)?.url() || ''} alt={post.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400">لا توجد صورة</div>
                    )}
                  </div>
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{post.title}</h2>
                    {post.excerpt && (
                      <p className="text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 text-sm">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">اقرأ المزيد ←</span>
                      {post.publishedAt && <span className="text-xs text-slate-500">{new Date(post.publishedAt).toLocaleDateString('ar-SA')}</span>}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20"><p className="text-slate-500 text-lg">لا توجد مقالات حالياً.</p></div>
        )}
      </div>
    </div>
  );
}
