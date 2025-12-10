import { basename, extname } from '@/lib/pathUtils';

/** Shape of a source file that the app can display / download */
export interface ProjectFile {
  name: string;      // e.g. App.tsx or tailwind.config.ts
  path: string;      // repo‑relative path, e.g. src/App.tsx
  content: string;    // raw file contents
  language: string;   // Prism language hint (tsx, jsx, css, markup, json, markdown, etc.)
}

/**
 * Vite’s `import.meta.glob` loads modules at build time.
 * - `../../**/*` walks the whole repository (utils → src → project root).
 * - `ignore` excludes heavy or irrelevant folders.
 * - `as: 'raw'` returns the file contents as plain strings.
 * - `eager: true` imports everything immediately so we can map it right away.
 */
const rawModules = import.meta.glob('../../**/*', {
  as: 'raw',
  eager: true,
  ignore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/.git/**',
    '**/.vscode/**',
    '**/.next/**',
    '**/.cache/**',
    '**/.DS_Store',
    '**/*.log',
    '**/package-lock.json',
    '**/yarn.lock',
    '**/pnpm-lock.yaml',
  ],
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
    case '.htm':
      return 'markup';
    case '.json':
      return 'json';
    case '.md':
    case '.markdown':
      return 'markdown';
    case '.svg':
      return 'svg';
    case '.png':
    case '.jpg':
    case '.jpeg':
    case '.gif':
      return 'image';
    default:
      return 'text';
  }
}

/** Exported array of every (non‑ignored) file in the repository */
export const projectFiles: ProjectFile[] = Object.entries(rawModules).map(
  ([filePath, content]) => {
    // `filePath` looks like “…/src/components/Button.tsx”.
    // Strip any leading “…/” segments to get a clean repo‑relative path.
    const relativePath = filePath.replace(/^(\.\.\/)+/, '');
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