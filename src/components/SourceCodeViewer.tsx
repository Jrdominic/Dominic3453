import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Copy, Check, Code, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { DownloadProjectButton } from './DownloadProjectButton';
import { projectFiles } from '@/utils/projectFiles';
import type { ProjectFile } from '@/utils/projectFiles'; // type‑only import

// Use the generated list of real source files
const sourceFiles: ProjectFile[] = projectFiles;

export const SourceCodeViewer = () => {
  // (implementation unchanged – omitted for brevity)
  /* ... existing SourceCodeViewer component code ... */
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

/* Export both as a named export and as the default export */
export default SourceCodeDialog;
export { SourceCodeDialog };