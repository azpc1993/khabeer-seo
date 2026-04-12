'use client';

import { GoogleGenAI } from "@google/genai";
import { toast } from 'sonner';

export const handleGeminiError = (err: unknown, defaultMessage: string = 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.') => {
  console.error(err);
  let userMessage = defaultMessage;
  let actionGuidance = '';
  
  if (err instanceof Error) {
    const msg = err.message?.toLowerCase() || '';
    if (msg.includes('api_key_invalid') || msg.includes('api key not valid') || msg.includes('expected pattern') || msg.includes('missing or empty next_public_gemini_api_key') || (err as { status?: number }).status === 403) {
      userMessage = 'مفتاح API غير صالح أو غير مفعل.';
      actionGuidance = 'يرجى التأكد من صحة مفتاح Gemini API في إعدادات المشروع.';
    } else if (msg.includes('safety') || msg.includes('blocked')) {
      userMessage = 'تم حظر المحتوى بواسطة فلاتر الأمان الخاصة بـ Google.';
      actionGuidance = 'حاول صياغة المدخلات بطريقة مختلفة وتجنب الكلمات الحساسة.';
    } else if (msg === 'empty_response') {
      userMessage = 'لم يتم استلام أي استجابة من الذكاء الاصطناعي.';
      actionGuidance = 'تأكد من أن المدخلات كافية وواضحة، ثم حاول مرة أخرى.';
    } else if (msg.includes('quota') || msg.includes('rate limit') || (err as { status?: number }).status === 429) {
      userMessage = 'تم الوصول إلى حد الاستخدام المسموح به (Quota).';
      actionGuidance = 'يرجى الانتظار لمدة دقيقة واحدة قبل المحاولة مرة أخرى، أو الترقية لخطة مدفوعة.';
    } else if (msg.includes('overloaded') || msg.includes('service unavailable') || (err as { status?: number }).status === 503) {
      userMessage = 'خوادم Google مشغولة حالياً.';
      actionGuidance = 'يرجى المحاولة مرة أخرى بعد بضع ثوانٍ.';
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

  const ai = new GoogleGenAI({ apiKey });
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

  const text = response.text;
  if (!text) {
    throw new Error('Empty response from Gemini');
  }

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
