import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Copy, Check, Code, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { DownloadProjectButton } from './DownloadProjectButton';
import { projectFiles } from '@/utils/projectFiles';
import type { ProjectFile } from '@/utils/projectFiles'; // type‑only import

/* ---------- Source files list ---------- */
const sourceFiles: ProjectFile[] = projectFiles;

/* ---------- SourceCodeViewer component ---------- */
export const SourceCodeViewer = () => {
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!selectedFile) return;
    try {
      await navigator.clipboard.writeText(selectedFile.content);
      setCopied(true);
      toast.success('File copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy file');
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* File list pane */}
      <div className="w-64 border-r bg-muted/30 p-2 overflow-y-auto">
        {sourceFiles.map((file) => (
          <div
            key={file.path}
            className={`p-1 cursor-pointer rounded hover:bg-muted/50 ${
              selectedFile?.path === file.path ? 'bg-muted' : ''
            }`}
            onClick={() => setSelectedFile(file)}
          >
            {file.name}
          </div>
        ))}
      </div>

      {/* Code view pane */}
      <div className="flex-1 flex flex-col p-4 overflow-auto">
        {selectedFile ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">{selectedFile.name}</h3>
              <Button size="sm" onClick={handleCopy} className="gap-2">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <pre className="flex-1 bg-muted p-2 rounded overflow-auto text-sm">
              <code className={`language-${selectedFile.language}`}>
                {selectedFile.content}
              </code>
            </pre>
          </>
        ) : (
          <p className="text-muted-foreground">Select a file to view its source</p>
        )}

        {/* Download button – always available */}
        <div className="mt-4">
          <DownloadProjectButton
            files={sourceFiles.map((f) => ({ path: f.path, content: f.content }))}
            projectName="cortex-project"
          />
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* SourceCodeDialog – displays the viewer inside a dialog */
export const SourceCodeDialog = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Source Code
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden">
        <div className="h-full flex flex-col">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Project Source Code
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <SourceCodeViewer />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* Export as default (also provides the named export above) */
export default SourceCodeDialog;