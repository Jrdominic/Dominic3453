import { basename, extname } from '@/lib/pathUtils';

/** Shape of a source file that the app can display / download */
export interface ProjectFile {
  name: string;      // e.g. App.tsx
  path: string;      // relative path from repo root, e.g. src/App.tsx
  content: string;   // raw file contents
  language: string;  // Prism language hint (tsx, jsx, css, markup, json, markdown, etc.)
}

/**
 * Vite’s `import.meta.glob` loads modules at build time.
 * We use the `eager` option so the files are imported immediately
 * and the `as: 'raw'` option to get the file contents as plain strings.
 * The pattern searches all source files under the `src/` directory.
 */
const rawModules = import.meta.glob('../**/*.{ts,tsx,js,jsx,css,html,json,md}', {
  as: 'raw',
  eager: true,
}) as Record<string, string>;

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
      return 'markup';
    case '.json':
      return 'json';
    case '.md':
      return 'markdown';
    default:
      return 'text';
  }
}

/** Exported array of all source files in the project */
export const projectFiles: ProjectFile[] = Object.entries(rawModules).map(
  ([filePath, content]) => {
    // `filePath` looks like “…/src/components/Button.tsx”.
    // Strip the leading “…/” to get a clean project‑relative path.
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