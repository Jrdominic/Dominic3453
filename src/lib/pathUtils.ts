/**
 * Minimal replacements for Node's `path` functions.
 * These work purely on strings and are safe for client‑side code.
 */

/**
 * Return the last portion of a path (after the final `/` or `\`).
 * Example: "/src/components/Button.tsx" → "Button.tsx"
 */
export function basename(filePath: string): string {
  // Normalize Windows separators and find the last slash
  const normalized = filePath.replace(/\\/g, "/");
  const idx = normalized.lastIndexOf("/");
  return idx === -1 ? normalized : normalized.slice(idx + 1);
}

/**
 * Return the file extension, including the leading dot.
 * Example: "Button.tsx" → ".tsx"
 * Returns an empty string if no extension is present.
 */
export function extname(filePath: string): string {
  const base = basename(filePath);
  const dotIdx = base.lastIndexOf(".");
  return dotIdx === -1 ? "" : base.slice(dotIdx);
}