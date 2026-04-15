'use client';

import { GoogleGenAI } from "@google/genai";
import { toast } from 'sonner';
import { decodeUnicode } from '../utils/unicode';
import { normalizeArabicSeoTerms } from '../utils/arabicNormalizer';

export const handleGeminiError = (err: unknown, defaultMessage: string = 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.') => {
  console.error('Gemini API Error:', err);
  let userMessage = defaultMessage;
  let actionGuidance = '';
  
  if (err instanceof Error) {
    const msg = err.message?.toLowerCase() || '';
    
    // 1. Authentication & API Key Errors
    if (msg.includes('api_key_invalid') || msg.includes('api key not valid') || msg.includes('expected pattern') || msg.includes('missing or empty next_public_gemini_api_key') || (err as { status?: number }).status === 403 || (err as { status?: number }).status === 401) {
      userMessage = 'مفتاح API غير صالح أو غير مفعل.';
      actionGuidance = 'يرجى التأكد من صحة مفتاح Gemini API في إعدادات المشروع (ملف .env.local).';
    } 
    // 2. Safety & Content Filtering
    else if (msg.includes('safety') || msg.includes('blocked') || msg.includes('finish_reason: safety')) {
      userMessage = 'تم حظر المحتوى بواسطة فلاتر الأمان الخاصة بـ Google.';
      actionGuidance = 'حاول صياغة المدخلات بطريقة مختلفة وتجنب الكلمات الحساسة أو المخالفة للسياسات.';
    } 
    // 3. Empty or Malformed Responses
    else if (msg === 'empty_response' || msg.includes('empty response') || msg.includes('failed to get response')) {
      userMessage = 'لم يتم استلام أي استجابة من الذكاء الاصطناعي.';
      actionGuidance = 'تأكد من أن المدخلات كافية وواضحة، ثم حاول مرة أخرى. قد تكون المشكلة مؤقتة.';
    } 
    // 4. JSON Parsing Errors
    else if (msg.includes('json') || msg.includes('parse') || msg.includes('unexpected token')) {
      userMessage = 'حدث خطأ في قراءة البيانات الواردة من الذكاء الاصطناعي.';
      actionGuidance = 'النموذج أرجع بيانات غير منسقة بشكل صحيح. يرجى إعادة المحاولة.';
    }
    // 5. Quota & Rate Limiting
    else if (msg.includes('quota') || msg.includes('rate limit') || msg.includes('429') || (err as { status?: number }).status === 429) {
      userMessage = 'تم الوصول إلى حد الاستخدام المسموح به (Quota).';
      actionGuidance = 'يرجى الانتظار لمدة دقيقة واحدة قبل المحاولة مرة أخرى، أو الترقية لخطة مدفوعة في Google AI Studio.';
    } 
    // 6. Server Overload & Availability
    else if (msg.includes('overloaded') || msg.includes('service unavailable') || msg.includes('503') || msg.includes('500') || (err as { status?: number }).status === 503 || (err as { status?: number }).status === 500) {
      userMessage = 'خوادم Google مشغولة حالياً أو تواجه مشكلة فنية.';
      actionGuidance = 'يرجى المحاولة مرة أخرى بعد بضع ثوانٍ.';
    }
    // 7. Network & Fetch Errors
    else if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed to fetch') || msg.includes('econnrefused') || msg.includes('timeout')) {
      userMessage = 'فشل الاتصال بخوادم الذكاء الاصطناعي.';
      actionGuidance = 'يرجى التحقق من اتصالك بالإنترنت، أو قد يكون هناك حظر على الشبكة (جرب استخدام VPN إذا استمرت المشكلة).';
    }
    // 8. Model Not Found
    else if (msg.includes('not found') || msg.includes('404') || (err as { status?: number }).status === 404) {
      userMessage = 'نموذج الذكاء الاصطناعي المطلوب غير متاح.';
      actionGuidance = 'قد يكون النموذج قيد التحديث أو تم تغييره. يرجى التواصل مع الدعم الفني.';
    }
  } else if (typeof window !== 'undefined' && !navigator.onLine) {
    userMessage = 'لا يوجد اتصال بالإنترنت.';
    actionGuidance = 'يرجى التحقق من اتصالك بالشبكة وإعادة المحاولة.';
  }
  
  const fullMessage = actionGuidance ? `${userMessage}\n${actionGuidance}` : userMessage;
  toast.error(fullMessage, { duration: 6000 });
  return userMessage;
};

export async function callGeminiAPI(endpoint: string, prompt: string, systemInstruction?: string, competitorUrl?: string, retries = 3) {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === "") {
    throw new Error("Missing or empty NEXT_PUBLIC_GEMINI_API_KEY");
  }

  const ai = new GoogleGenAI({ 
    apiKey,
    httpOptions: {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    }
  });
  const DEFAULT_MODEL = "gemini-3-flash-preview";

  const config: Record<string, unknown> = {
    systemInstruction,
    temperature: endpoint === 'keywords' ? 0.5 : 0.7,
  };

  if (endpoint === 'keywords') {
    config.tools = [{ googleSearch: {} }];
  } else if (competitorUrl) {
    config.tools = [{ urlContext: {} }];
  }

  const contents = [{ parts: [{ text: competitorUrl ? `${prompt}\n\nرابط المنافس للتحليل: ${competitorUrl}` : prompt }] }];

  let response;
  let attempt = 0;
  
  while (attempt < retries) {
    try {
      response = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents,
        config,
      });
      break; // Success, exit the retry loop
    } catch (error: unknown) {
      attempt++;
      
      // Check if it's a 429 Resource Exhausted error or 503 Service Unavailable
      const errObj = error as Record<string, unknown>;
      const isTransientError = errObj?.status === 429 || errObj?.status === 503 ||
                          (typeof errObj?.message === 'string' && (
                            errObj.message.includes('429') || 
                            errObj.message.includes('503') ||
                            errObj.message.includes('quota') || 
                            errObj.message.includes('RESOURCE_EXHAUSTED') ||
                            errObj.message.includes('high demand') ||
                            errObj.message.includes('UNAVAILABLE')
                          ));
                          
      if (isTransientError && attempt < retries) {
        // Exponential backoff: 2s, 4s, 8s...
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`Transient error hit (status: ${errObj?.status}). Retrying in ${delay}ms... (Attempt ${attempt} of ${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // If it's not a transient error or we've exhausted retries, throw
        throw error;
      }
    }
  }

  if (!response) {
    throw new Error('Failed to get response from Gemini after retries');
  }

  let text = response.text;
  if (!text) {
    throw new Error('Empty response from Gemini');
  }

  // Apply decoding and normalization
  text = decodeUnicode(text);
  text = normalizeArabicSeoTerms(text);

  // If we expect JSON (either keywords endpoint or prompt asks for it)
  if (endpoint === 'keywords' || text.trim().startsWith('{') || text.trim().includes('```json')) {
    try {
      // Try parsing directly
      return JSON.parse(text);
    } catch {
      // Try extracting JSON from markdown or text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch {
          // If it still fails, return as text
          return { text };
        }
      }
      return { text };
    }
  }

  return { text };
}

export async function generateProductContent(params: {
  contentType?: string;
  productName: string;
  productDescription?: string;
  pk?: string;
  sk?: string;
  audience?: string;
  tone?: string;
  metaLength?: string;
  keywordCount?: string;
  specsFormat?: string;
  competitionLevel?: string;
}) {
  const prompt = `
    نوع المحتوى: ${params.contentType || 'وصف منتج'}
    اسم المنتج: ${params.productName}
    وصف المنتج: ${params.productDescription}
    الكلمات الأساسية (PKs): ${params.pk}
    الكلمات الثانوية (LSI): ${params.sk}
    الجمهور المستهدف: ${params.audience}
    نبرة الصوت: ${params.tone}
    طول الميتا: ${params.metaLength}
    عدد الكلمات: ${params.keywordCount}
    تنسيق المواصفات: ${params.specsFormat}
    مستوى المنافسة: ${params.competitionLevel}
  `;

  const { SYSTEM_INSTRUCTION } = await import('./constants');
  const result = await callGeminiAPI('generate', prompt, SYSTEM_INSTRUCTION);
  return result.text || result;
}

export async function performKeywordResearch(query: string, region: string) {
  const prompt = `البحث عن كلمات مفتاحية لـ: ${query} في منطقة: ${region}`;
  const { KEYWORD_RESEARCH_INSTRUCTION } = await import('./constants');
  const result = await callGeminiAPI('keywords', prompt, KEYWORD_RESEARCH_INSTRUCTION);
  
  // Map lsiKeywords to the format expected by ResearchView
  if (result.lsiKeywords) {
    result.secondaryKeywords = result.lsiKeywords.map((k: string) => ({ keyword: k }));
  }
  
  return result;
}

export async function shortenSeoTitle(title: string): Promise<string> {
  const prompt1 = `أعد صياغة عنوان السيو التالي ليكون عنواناً واحداً فقط باللغة العربية، ولا يتجاوز 55 حرفاً.
مهم جداً:
- لا تكتب أي شرح أو تبرير أو مقدمة.
- لا تضع ترقيم أو خيارات متعددة.
- أعد العنوان فقط كسطر واحد.

العنوان الحالي:
${title}`;

  let result = await callGeminiAPI('generate', prompt1);
  let text = (result.text || result || '').replace(/["*]/g, '').replace(/^العنوان:\s*/, '').trim();
  text = text.split('\n')[0].trim();

  if (text.length > 55) {
    const prompt2 = `اختصر هذا العنوان فوراً ليكون أقل من 55 حرفاً.
ممنوع كتابة أي كلمة خارج العنوان. ممنوع الشرح. أعد العنوان فقط.

العنوان:
${text}`;
    result = await callGeminiAPI('generate', prompt2);
    text = (result.text || result || '').replace(/["*]/g, '').replace(/^العنوان:\s*/, '').trim();
    text = text.split('\n')[0].trim();
  }

  if (text.length > 55) {
    text = text.substring(0, 52) + '...';
  }

  return text;
}

export async function shortenMetaDescription(desc: string): Promise<string> {
  const prompt1 = `أعد صياغة وصف الميتا التالي ليكون وصفاً واحداً فقط باللغة العربية، وطوله بين 140 و 155 حرفاً.
مهم جداً:
- لا تكتب أي شرح أو تبرير أو مقدمة.
- لا تضع ترقيم أو خيارات متعددة.
- أعد الوصف فقط كسطر واحد.

الوصف الحالي:
${desc}`;

  let result = await callGeminiAPI('generate', prompt1);
  let text = (result.text || result || '').replace(/["*]/g, '').replace(/^الوصف:\s*/, '').trim();
  text = text.split('\n')[0].trim();

  if (text.length > 160 || text.length < 130) {
    const prompt2 = `أعد كتابة هذا الوصف ليكون طوله بين 140 و 155 حرفاً بدقة.
ممنوع كتابة أي كلمة خارج الوصف. ممنوع الشرح. أعد الوصف فقط كسطر واحد.

الوصف:
${text}`;
    result = await callGeminiAPI('generate', prompt2);
    text = (result.text || result || '').replace(/["*]/g, '').replace(/^الوصف:\s*/, '').trim();
    text = text.split('\n')[0].trim();
  }

  if (text.length > 160) {
    text = text.substring(0, 157) + '...';
  }

  return text;
}
