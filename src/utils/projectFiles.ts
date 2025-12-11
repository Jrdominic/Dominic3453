import { basename, extname } from '@/lib/pathUtils';

/** Shape of a source file that the app can display / download */
export interface ProjectFile {
  name: string;      // e.g. App.tsx or tailwind.config.ts
  path: string;      // repo‑relative path, e.g. src/App.tsx
  content: string;   // raw file contents as a plain string
  language: string;   // Prism language hint (tsx, jsx, css, markup, json, markdown, etc.)
}

// Vite import.meta.glob loads modules at build time.
// The pattern '../../**/*' walks the entire repository (utils → src → project root).
// as: 'raw' returns file contents as plain strings.
// eager: true imports everything immediately for mapping.
// The glob captures the most common source file extensions, now also includes .bat files.
const rawModules = import.meta.glob(
  '../../**/*.{ts,tsx,js,jsx,css,html,json,md,svg,bat}',
  {
    as: 'raw',
    eager: true,
  }
) as Record<string, string>;

/** Map a file extension to a Prism language identifier */
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
    case '.htm':
      return 'markup';
    case '.json':
      return 'json';
    case '.md':
    case '.markdown':
      return 'markdown';
    case '.svg':
      return 'svg';
    case '.bat':
      return 'bat';
    case '.png':
    case '.jpg':
    case '.jpeg':
    case '.gif':
      return 'image';
    default:
      return 'text';
  }
}

/** Exported array containing every (non‑ignored) file in the repository */
export const projectFiles: ProjectFile[] = Object.entries(rawModules).map(
  ([filePath, fileContent]) => {
    // Strip leading "../" segments to get a clean repo‑relative path.
    const relativePath = filePath.replace(/^(\.\.\/)+/, '');
    const name = basename(filePath);
    const ext = extname(filePath);
    return {
      name,
      path: relativePath,
      content: fileContent,
      language: mapExtToLang(ext),
    };
  }
);