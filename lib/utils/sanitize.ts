import DOMPurify from 'dompurify';

export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side: use a simple approach
    return html.replace(/<[^>]*>/g, '');
  }
  return DOMPurify.sanitize(html);
}

export function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim();
}
