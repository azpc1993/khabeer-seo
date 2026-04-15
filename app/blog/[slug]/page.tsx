import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PortableText } from '@portabletext/react';
import { client } from '@/lib/sanity/client';
import { postBySlugQuery, postPathsQuery } from '@/lib/sanity/queries';
import { urlForImage } from '@/lib/sanity/image';

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const paths = await client.fetch(postPathsQuery);
  return paths.map((path: any) => ({ slug: path.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await client.fetch(postBySlugQuery, { slug: resolvedParams.slug });
  if (!post) return { title: 'المقال غير موجود' };
  const ogImage = post.mainImage ? urlForImage(post.mainImage)?.width(1200).height(630).url() : undefined;
  return {
    title: `${post.title} | مدونة خبير السيو`,
    description: post.excerpt || `اقرأ مقال ${post.title} على مدونة خبير السيو.`,
    alternates: { canonical: `/blog/${resolvedParams.slug}` },
    openGraph: { title: post.title, description: post.excerpt || `اقرأ مقال ${post.title} على مدونة خبير السيو.`, type: 'article', url: `/blog/${resolvedParams.slug}`, images: ogImage ? [{ url: ogImage }] : [] },
  };
}

const portableTextComponents = {
  types: {
    image: ({ value }: any) => {
      if (!value?.asset?._ref) return null;
      return (
        <div className="relative w-full h-96 my-8 rounded-xl overflow-hidden">
          <Image src={urlForImage(value)?.url() || ''} alt={value.alt || 'صورة توضيحية'} fill className="object-contain" sizes="(max-width: 768px) 100vw, 1200px" />
        </div>
      );
    },
  },
  marks: {
    link: ({ children, value }: any) => {
      const rel = !value.href?.startsWith('/') ? 'noreferrer noopener' : undefined;
      return <a href={value.href} rel={rel} className="text-emerald-600 hover:text-emerald-700 underline underline-offset-4">{children}</a>;
    },
  },
};

export default async function BlogPostPage({ params }: Props) {
  const resolvedParams = await params;
  const post = await client.fetch(postBySlugQuery, { slug: resolvedParams.slug });
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950" dir="rtl">
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">المدونة</span>
          </Link>
          <Link href="https://ap.khabeerseo.com" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors flex items-center gap-1">
            العودة للتطبيق
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
        </div>
      </header>

      <article className="py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <header className="mb-10 text-center">
          {post.categories && post.categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {post.categories.map((category: string) => (
                <span key={category} className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium">
                  {category}
                </span>
              ))}
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">{post.title}</h1>
          <div className="flex items-center justify-center gap-4 text-slate-600 text-sm">
            {post.authorName && (
              <div className="flex items-center gap-2">
                {post.authorImage && (
                  <div className="relative w-8 h-8 rounded-full overflow-hidden">
                    <Image src={urlForImage(post.authorImage)?.width(100).height(100).url() || ''} alt={post.authorName} fill className="object-cover" />
                  </div>
                )}
                <span className="font-medium text-slate-900 dark:text-slate-200">{post.authorName}</span>
              </div>
            )}
            {post.authorName && post.publishedAt && <span>•</span>}
            {post.publishedAt && <time dateTime={post.publishedAt}>{new Date(post.publishedAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}</time>}
          </div>
        </header>

        {post.mainImage && (
          <div className="relative w-full aspect-[21/9] mb-12 rounded-2xl overflow-hidden shadow-lg">
            <Image src={urlForImage(post.mainImage)?.url() || ''} alt={post.title} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 1200px" />
          </div>
        )}

        <div className="prose sm:prose-lg prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-emerald-600 prose-img:rounded-xl">
          {post.body ? <PortableText value={post.body} components={portableTextComponents} /> : <p className="text-center text-slate-500">لا يوجد محتوى لهذا المقال.</p>}
        </div>

        <div className="mt-16 pt-10 border-t border-slate-200 dark:border-slate-800">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 sm:p-10 text-center border border-emerald-100">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">هل تريد تحسين محتوى موقعك لمحركات البحث؟</h3>
            <p className="text-slate-600 mb-8 max-w-xl mx-auto">استخدم أداة خبير السيو المدعومة بالذكاء الاصطناعي لكتابة مقالات متوافقة مع SEO.</p>
            <Link href="https://ap.khabeerseo.com" className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all">جرّب أداة خبير السيو الآن</Link>
          </div>
        </div>
      </article>
    </div>
  );
}
