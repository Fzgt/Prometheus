import {
  type BundledLanguage,
  createHighlighter,
  type Highlighter,
} from 'shiki';

let highlighter: Highlighter | null = null;

export async function getHighlighter(): Promise<Highlighter> {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ['github-dark', 'github-light'],
      langs: [
        'typescript',
        'tsx',
        'javascript',
        'jsx',
        'css',
        'html',
        'json',
        'bash',
        'shell',
        'markdown',
        'yaml',
        'python',
        'rust',
        'go',
      ] as BundledLanguage[],
    });
  }
  return highlighter;
}

export function extractHeadings(
  markdown: string,
): { id: string; text: string; level: number }[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: { id: string; text: string; level: number }[] = [];

  let match;
  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    headings.push({ id, text, level });
  }

  return headings;
}
