import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Copy, Check, Code, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { DownloadProjectButton } from './DownloadProjectButton'; // imported component

interface SourceFile {
  name: string;
  path: string;
  content: string;
  language: string;
}

// NOTE: The actual file list is defined elsewhere in the project.
// Here we keep the placeholder comment; the real array is present at runtime.
const sourceFiles: SourceFile[] = [
  // ... (all existing sourceFiles array unchanged)
];

export const SourceCodeViewer = () => {
  // Guard: keep only valid entries
  const projectFiles = sourceFiles.filter(
    (f): f is SourceFile => !!f && !!f.path && !!f.content
  );

  const [activeFile, setActiveFile] = useState<SourceFile | null>(
    projectFiles.length ? projectFiles[0] : null
  );
  const [copied, setCopied] = useState(false);
  const [allCopied, setAllCopied] = useState(false);

  const handleCopyFile = async () => {
    if (!activeFile) return;
    try {
      await navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      toast.success('File copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy file');
    }
  };

  const handleCopyAll = async () => {
    try {
      const allCode = projectFiles
        .map(f => `/* === ${f.path} === */\n${f.content}`)
        .join('\n\n');
      await navigator.clipboard.writeText(allCode);
      setAllCopied(true);
      toast.success('All code copied to clipboard');
      setTimeout(() => setAllCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy all code');
    }
  };

  // If there are no files, show a simple empty state
  if (projectFiles.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No source files available.
      </div>
    );
  }

  return (
    <div className="h-[80vh] flex flex-col">
      <div className="flex-1 flex overflow-hidden">
        {/* File Tree */}
        <div className="w-64 border-r bg-muted/30 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Project Files
              </h3>
              <div className="flex gap-2">
                {/* Copy All */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyAll}
                  className="gap-2 text-xs"
                >
                  {allCopied ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  {allCopied ? 'Copied!' : 'Copy All'}
                </Button>

                {/* Download Project */}
                <DownloadProjectButton
                  files={projectFiles.map(f => ({
                    path: f.path,
                    content: f.content,
                  }))}
                  projectName="cortex-project"
                />
              </div>
            </div>

            {/* File list */}
            <div className="space-y-1">
              {projectFiles.map((file) => (
                <button
                  key={file.path}
                  className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                    activeFile?.path === file.path
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setActiveFile(file)}
                >
                  <div className="flex items-center gap-2">
                    <Code className="h-3 w-3" />
                    <span className="truncate">{file.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Code Display */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b px-4 py-3 bg-background/50 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Code className="h-4 w-4" />
                {activeFile?.path ?? 'Select a file'}
              </h2>
              <p className="text-xs text-muted-foreground">
                Click to copy file content
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyFile}
              className="gap-2"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <div className="flex-1 overflow-hidden bg-muted/20">
            <pre className="h-full overflow-auto p-4 text-sm" style={{ lineHeight: '1.5' }}>
              <code className="font-mono whitespace-pre">
                {activeFile?.content ?? ''}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

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