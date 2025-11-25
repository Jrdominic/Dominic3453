import { useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import { Button } from './ui/button';
import { Copy, Check, Code } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface CodePanelProps {
  code: string;
  language: string;
  title?: string;
  fileName?: string;
}

export const CodePanel = ({ code, language, title, fileName = 'index.html' }: CodePanelProps) => {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Code copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy code');
    }
  };

  if (!code) {
    return (
      <div className="h-full flex">
        {/* File Tree */}
        <div className="w-64 border-r bg-muted/30 p-4">
          <div className="text-sm font-semibold mb-4 text-muted-foreground">Files</div>
          <div className="text-sm text-muted-foreground">
            No files generated yet
          </div>
        </div>
        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center p-8">
          <p className="text-sm text-muted-foreground">
            Generated code will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* File Tree */}
      <div className="w-64 border-r bg-muted/30 p-4">
        <div className="text-sm font-semibold mb-4">Files</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer bg-muted">
            <Code className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{fileName}</span>
          </div>
        </div>
      </div>

      {/* Code Editor Area */}
      <div className="flex-1 flex flex-col">
        <div className="border-b border-border/50 px-4 py-3 bg-background/50 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">{fileName}</h2>
            {title && <p className="text-xs text-muted-foreground">{title}</p>}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="gap-2"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
        <div className="flex-1 overflow-auto">
          <pre className="!m-0 !rounded-none h-full">
            <code ref={codeRef} className={`language-${language}`}>
              {code}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};
