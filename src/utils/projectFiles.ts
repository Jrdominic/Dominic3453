import { extname, basename } from 'path';

interface ProjectFile {
  name: string;      // e.g. App.tsx
  path: string;      // relative path from repo root, e.g. src/App.tsx
  content: string;   // file contents
  language: string; // Prism language hint (tsx, ts, js, css, html, json, md, etc.)
}

/**
 * Vite's import.meta.globEager is injected at build time.
 * TypeScript does not know about it, so we cast import.meta to `any`
 * and assert the shape of the returned map.
 */
const rawModules = (import.meta as any).globEager('../src/**/*.{ts,tsx,js,jsx,css,html,json,md}', {
  as: 'raw',
  eager: true,
}) as Record<string, string>;

/**
 * Map a file extension to a Prism language identifier.
 */
function mapExtToLang(ext: string): string {
  switch (ext) {
    case '.tsx':
    case '.ts':
      return 'tsx';
    case '.jsx':
    case '.js':
      return 'jsx';
    case '.css':
      return 'css';
    case '.html':
      return 'markup';
    case '.json':
      return 'json';
    case '.md':
      return 'markdown';
    default:
      return 'text';
  }
}

/**
 * Build the array of ProjectFile objects.
 * `filePath` looks like “…/src/components/Button.tsx”.
 * We strip the leading “…/” to get a clean project‑relative path.
 */
export const projectFiles: ProjectFile[] = Object.entries(rawModules).map(
  ([filePath, content]) => {
    // Remove the leading "../"
    const relativePath = filePath.replace(/^\.{2}\//, '');
    const name = basename(filePath);
    const ext = extname(filePath);
    return {
      name,
      path: relativePath,
      content,
      language: mapExtToLang(ext),
    };
  }
);