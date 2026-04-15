import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch URL' }, { status: response.status });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Basic SEO Analysis
    const title = $('title').text();
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const h1s = $('h1');
    const hasH1 = h1s.length > 0;
    const h1Text = hasH1 ? h1s.first().text().trim() : '';
    
    const h2s = $('h2');
    const h2Count = h2s.length;
    const h2Texts: string[] = [];
    h2s.each((_, el) => {
      h2Texts.push($(el).text().trim());
    });

    const firstParagraph = $('p').first().text().trim();
    
    // Word count (rough estimate)
    const textContent = $('body').text().replace(/\s+/g, ' ').trim();
    const wordCount = textContent.split(' ').length;

    // Images analysis
    const images = $('img');
    const imagesCount = images.length;
    let imagesWithoutAlt = 0;
    images.each((_, img) => {
      if (!$(img).attr('alt')) {
        imagesWithoutAlt++;
      }
    });

    // Extract keywords (very basic frequency analysis)
    const words = textContent.toLowerCase().match(/\b[\w\u0600-\u06FF]{3,}\b/g) || [];
    const wordFreq: Record<string, number> = {};
    words.forEach(w => {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    });
    
    // Sort by frequency
    const sortedWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .filter(w => !['the', 'and', 'for', 'that', 'this', 'with', 'من', 'في', 'على', 'إلى', 'عن', 'مع', 'هذا', 'هذه'].includes(w));

    const primaryKeywords = sortedWords.slice(0, 5);
    const lsiKeywords = sortedWords.slice(5, 10);

    // Calculate score
    let score = 100;
    if (!title) score -= 25;
    else if (title.length < 30 || title.length > 70) score -= 10;
    
    if (!metaDescription) score -= 25;
    else if (metaDescription.length < 100 || metaDescription.length > 160) score -= 10;
    
    if (!hasH1) score -= 20;
    if (imagesWithoutAlt > 0) score -= Math.min(15, imagesWithoutAlt * 3);
    if (wordCount < 200) score -= 15;
    else if (wordCount < 500) score -= 5;

    // Dynamic missing keywords (common SEO/E-commerce terms not found in text)
    const idealKeywords = ['شحن مجاني', 'ضمان', 'أفضل سعر', 'توصيل سريع', 'خصم', 'كوبون', 'مراجعات', 'تقييم', 'أصلي', 'جودة عالية'];
    const missingKeywords = idealKeywords.filter(kw => !textContent.includes(kw)).slice(0, 3);

    // Generate recommendations
    const recommendations = [];
    
    if (!metaDescription) {
      recommendations.push({
        id: 'rec_desc',
        title: "إضافة وصف ميتا (Meta Description)",
        reason: "الصفحة تفتقر لوصف تعريفي يظهر في نتائج البحث.",
        impact: "يرفع نسبة النقر (CTR) ويحسن ترتيب الصفحة",
        fix: "اكتب وصفاً جذاباً يتضمن الكلمة المفتاحية الأساسية بطول 140-155 حرفاً.",
        priority: "High",
        actionType: "optimize_desc"
      });
    }

    if (imagesWithoutAlt > 0) {
      recommendations.push({
        id: 'rec_alt',
        title: "إضافة نصوص Alt للصور",
        reason: `يوجد ${imagesWithoutAlt} صور لا تحتوي على وصف بديل لمحركات البحث.`,
        impact: "تحسين الأرشفة في بحث الصور من جوجل",
        fix: "أضف خاصية alt=\"وصف الصورة\" لكل صورة، وتأكد من تضمين كلمات مفتاحية ذات صلة بشكل طبيعي.",
        priority: "Medium",
        actionType: "generate_alt"
      });
    }

    if (!hasH1) {
      recommendations.push({
        id: 'rec_h1',
        title: "إضافة عنوان رئيسي H1",
        reason: "الصفحة لا تحتوي على عنوان H1 رئيسي يوضح محتواها لمحركات البحث.",
        impact: "مهم جداً لفهم محرك البحث لموضوع الصفحة",
        fix: "أضف وسم <h1> واحد فقط في أعلى الصفحة يحتوي على الكلمة المفتاحية الأساسية.",
        priority: "High",
        actionType: "suggest_h1"
      });
    }

    if (wordCount < 300) {
      recommendations.push({
        id: 'rec_words',
        title: "زيادة طول المحتوى",
        reason: `المحتوى الحالي (${wordCount} كلمة) قصير جداً.`,
        impact: "المحتوى الأطول يميل للترتيب بشكل أفضل",
        fix: "أضف المزيد من التفاصيل، الشروحات، أو الأسئلة الشائعة للوصول إلى 500 كلمة على الأقل.",
        priority: "Medium",
        actionType: "keyword_fix"
      });
    }

    const metrics = {
      score: Math.max(0, score),
      wordCount,
      imagesCount,
      imagesWithoutAlt,
      hasH1,
      h2Count,
      hasMetaDescription: !!metaDescription,
      extractedTexts: {
        title,
        metaDescription,
        h1: h1Text,
        h2s: h2Texts,
        firstParagraph
      },
      keywords: {
        primary: primaryKeywords,
        lsi: lsiKeywords,
        missing: missingKeywords.length > 0 ? missingKeywords : ["تحسين", "جودة", "سعر"]
      },
      topKeywords: sortedWords.slice(0, 50).map(w => ({ word: w, count: wordFreq[w] })),
      recommendations
    };

    return NextResponse.json(metrics);
  } catch (error: unknown) {
    console.error('SEO Analysis Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('fetch failed') || errorMessage.includes('getaddrinfo') || errorMessage.includes('ENOTFOUND')) {
      return NextResponse.json({ error: 'الرابط غير صالح أو لا يمكن الوصول إليه. يرجى التأكد من صحة الرابط.' }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to analyze URL' }, { status: 500 });
  }
}
