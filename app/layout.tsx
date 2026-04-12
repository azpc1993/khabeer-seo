import type {Metadata} from 'next';
import { Cairo } from 'next/font/google';
import { Toaster } from 'sonner';
import { ScrollToTop } from '@/components/ScrollToTop';
import { KeywordsProvider } from '@/context/KeywordsContext';
import Script from 'next/script';
import './globals.css';

const cairo = Cairo({
  subsets: ['arabic'],
  variable: '--font-cairo',
});

export const metadata: Metadata = {
  title: {
    default: 'خبير السيو للمنتجات: توليد وصف احترافي',
    template: '%s | خبير السيو',
  },
  description: 'أداة متخصصة لكتابة أوصاف المنتجات والمقالات متوافقة مع السيو (SEO) باستخدام الذكاء الاصطناعي.',
  keywords: ['سيو', 'SEO', 'وصف منتجات', 'كتابة محتوى', 'ذكاء اصطناعي', 'تحسين محركات البحث', 'تسويق'],
  authors: [{ name: 'خبير السيو' }],
  creator: 'خبير السيو',
  publisher: 'خبير السيو',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://your-production-domain.com'),
  alternates: {
    canonical: '/',
    languages: {
      'ar': '/',
    },
  },
  openGraph: {
    title: 'خبير السيو للمنتجات: توليد وصف احترافي',
    description: 'أداة متخصصة لكتابة أوصاف المنتجات والمقالات متوافقة مع السيو (SEO) باستخدام الذكاء الاصطناعي.',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://your-production-domain.com',
    siteName: 'خبير السيو',
    locale: 'ar_SA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'خبير السيو للمنتجات: توليد وصف احترافي',
    description: 'أداة متخصصة لكتابة أوصاف المنتجات والمقالات متوافقة مع السيو (SEO) باستخدام الذكاء الاصطناعي.',
    creator: '@seo_expert',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'خبير السيو',
  },
};

export const viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        {/* Resource hints for speed */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://generativelanguage.googleapis.com" />
        <link rel="dns-prefetch" href="https://generativelanguage.googleapis.com" />
        {/* Instant dark mode to prevent flash */}
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            var s = JSON.parse(localStorage.getItem('seo_settings') || '{}');
            if (s.general && s.general.isDarkMode) {
              document.documentElement.classList.add('dark');
            }
          } catch(e) {}
        ` }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('ServiceWorker registration successful');
                  }, function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body className={`${cairo.variable} font-sans bg-[#F8FAFC] text-slate-900`} suppressHydrationWarning>
        <KeywordsProvider>
          {children}
        </KeywordsProvider>
        <ScrollToTop />
        <Toaster position="top-center" richColors />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-T304S48F1V" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
          
            gtag('config', 'G-T304S48F1V');
          `}
        </Script>
      </body>
    </html>
  );
}
