import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface PreviewPanelProps {
  code: string;
  type: 'html' | 'react';
  isLoading?: boolean;
}

export const PreviewPanel = ({ code, type, isLoading }: PreviewPanelProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!code) return;

    const iframe = iframeRef.current;
    if (!iframe) return;
    
    if (type === 'html') {
      iframe.srcdoc = code;
    } else if (type === 'react') {
      const htmlTemplate = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
            <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
            <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              body { margin: 0; padding: 16px; font-family: system-ui, -apple-system, sans-serif; }
              * { box-sizing: border-box; }
            </style>
          </head>
          <body>
            <div id="root"></div>
            <script type="text/babel">
              ${code}
              
              // Auto-detect component - try default export, then look for any function component
              let Component = null;
              
              if (typeof exports !== 'undefined' && exports.default) {
                Component = exports.default;
              } else {
                // Find any function that looks like a component (starts with capital letter)
                const windowKeys = Object.keys(window);
                for (let key of windowKeys) {
                  if (key[0] === key[0].toUpperCase() && typeof window[key] === 'function') {
                    Component = window[key];
                    break;
                  }
                }
              }
              
              if (Component) {
                const root = ReactDOM.createRoot(document.getElementById('root'));
                root.render(React.createElement(Component));
              } else {
                document.getElementById('root').innerHTML = '<div style="padding: 20px; color: red;">Error: No component found</div>';
              }
            </script>
          </body>
        </html>
      `;
      iframe.srcdoc = htmlTemplate;
    }
  }, [code, type]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/20">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-sm text-muted-foreground">Working On Task</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white">
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0"
        sandbox="allow-scripts"
        title="Preview"
      />
      {!code && (
        <div className="flex items-center justify-center h-full bg-muted/20">
          <p className="text-sm text-muted-foreground">
            Your generated app will appear here
          </p>
        </div>
      )}
    </div>
  );
};
