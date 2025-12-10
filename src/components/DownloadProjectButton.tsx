"use client";

import { useState } from 'react';
import { Button } from './ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import JSZip from 'jszip';

interface ProjectFile {
  path: string;
  content: string;
}

interface DownloadProjectButtonProps {
  files: ProjectFile[];
  projectName?: string;
}

export const DownloadProjectButton = ({ files, projectName = 'cortex-project' }: DownloadProjectButtonProps) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const zip = new JSZip();

      files.forEach(file => {
        zip.file(file.path, file.content);
      });

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Project downloaded successfully!');
    } catch (error) {
      console.error('Failed to generate zip file:', error);
      toast.error('Failed to download project.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleDownload}
      disabled={isDownloading}
      className="gap-2 text-xs"
    >
      {isDownloading ? (
        <>
          <Download className="h-3 w-3 animate-bounce" />
          Preparing...
        </>
      ) : (
        <>
          <Download className="h-3 w-3" />
          Download Project
        </>
      )}
    </Button>
  );
};