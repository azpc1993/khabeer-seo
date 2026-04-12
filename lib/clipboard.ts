export const stripHtmlTags = (text: string): string => {
  return text.replace(/<[^>]*>?/gm, '');
};

export const cleanOutputForClipboard = (text: string): string => {
  const cleanText = stripHtmlTags(text);
  return cleanText
    // Remove Markdown formatting
    .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
    .replace(/(?<!^\s*)\*(?!\s)(.*?)(?<!\s)\*/gm, '$1') // Italic
    .replace(/_(?!\s)(.*?)(?<!\s)_/g, '$1') // Italic
    .replace(/~~(.*?)~~/g, '$1') // Strikethrough
    .replace(/###+\s+/g, '') // Headings
    .replace(/##+\s+/g, '') // Headings
    .replace(/#+\s+/g, '') // Headings
    .replace(/---/g, '') // Horizontal rules
    .replace(/`(.*?)`/g, '$1') // Code blocks/inline code
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
    .replace(/!\[(.*?)\]\(.*?\)/g, '$1'); // Images
};

export const formatContentForSalla = (markdown: string): string => {
  const html = markdown
    // Headings
    .replace(/^###\s+(.*$)/gim, '<h3 style="direction:rtl; text-align:right;"><strong>$1</strong></h3>')
    .replace(/^##\s+(.*$)/gim, '<h2 style="direction:rtl; text-align:right;"><strong>$1</strong></h2>')
    .replace(/^#\s+(.*$)/gim, '<h1 style="direction:rtl; text-align:right;"><strong>$1</strong></h1>')
    
    // Bold text - Styled with red color and light background for Salla/Zid
    .replace(/\*\*(.*?)\*\*/g, '<span style="color: #dc2626; background-color: #fef2f2; padding: 2px 4px; border-radius: 4px; font-weight: bold;">$1</span>')
    
    // Italic text
    .replace(/(?<!^\s*)\*(?!\s)(.*?)(?<!\s)\*/gm, '<em>$1</em>')
    .replace(/_(?!\s)(.*?)(?<!\s)_/g, '<em>$1</em>')
    
    // Inline code
    .replace(/`(.*?)`/g, '<code>$1</code>')
    
    // Horizontal rules
    .replace(/^---/gim, '<hr />');

  // Process line by line for lists and paragraphs
  const lines = html.split('\n');
  let inList = false;
  const result = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.match(/^[-*+]\s+(.*)$/)) {
      if (!inList) {
        result.push('<ul style="list-style-type:disc; padding-right:25px; margin:0; direction:rtl; text-align:right;">');
        inList = true;
      }
      result.push(`<li style="margin-bottom:8px; line-height:1.8; direction:rtl; text-align:right;">${line.replace(/^[-*+]\s+/, '')}</li>`);
    } else if (line.match(/^\d+\.\s+(.*)$/)) {
      if (!inList) {
        result.push('<ol style="padding-right:25px; margin:0; direction:rtl; text-align:right;">');
        inList = true;
      }
      result.push(`<li style="margin-bottom:8px; line-height:1.8; direction:rtl; text-align:right;">${line.replace(/^\d+\.\s+/, '')}</li>`);
    } else {
      if (inList) {
        let lastOpen = '';
        for (let j = result.length - 1; j >= 0; j--) {
          if (result[j].startsWith('<ul') || result[j].startsWith('<ol')) {
            lastOpen = result[j];
            break;
          }
        }
        result.push(lastOpen.startsWith('<ul') ? '</ul>' : '</ol>');
        inList = false;
      }
      
      if (line === '') {
        continue;
      } else if (line.startsWith('<h') || line.startsWith('<hr')) {
        result.push(line);
      } else {
        result.push(`<p style="direction:rtl; text-align:right; line-height:1.8; margin-bottom:12px;">${line}</p>`);
      }
    }
  }
  
  if (inList) {
    let lastOpen = '';
    for (let j = result.length - 1; j >= 0; j--) {
      if (result[j].startsWith('<ul') || result[j].startsWith('<ol')) {
        lastOpen = result[j];
        break;
      }
    }
    result.push(lastOpen.startsWith('<ul') ? '</ul>' : '</ol>');
  }

  return `<div dir="rtl" style="text-align: right; font-family: system-ui, -apple-system, sans-serif; line-height: 1.8;">\n${result.join('\n')}\n</div>`;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.error('Modern clipboard API failed:', err);
  }

  // Fallback to execCommand('copy')
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Ensure the textarea is not visible but part of the DOM
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '0';
    document.body.appendChild(textArea);
    
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    if (successful) return true;
  } catch (err) {
    console.error('Fallback clipboard copy failed:', err);
  }

  return false;
};

export const copyAll = async (text: string): Promise<void> => {
  await copyRichTextToClipboard(text);
};

export const copyRichTextToClipboard = async (markdownText: string): Promise<void> => {
  const plainText = cleanOutputForClipboard(markdownText);
  const htmlContent = formatContentForSalla(markdownText);
  
  try {
    if (navigator.clipboard && window.ClipboardItem) {
      const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
      const textBlob = new Blob([plainText], { type: 'text/plain' });
      
      const clipboardItem = new window.ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob,
      });
      
      await navigator.clipboard.write([clipboardItem]);
    } else {
      await navigator.clipboard.writeText(plainText);
    }
  } catch (err) {
    console.error('Failed to copy rich text: ', err);
    await navigator.clipboard.writeText(plainText);
  }
};
