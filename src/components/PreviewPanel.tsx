import { useEffect, useRef, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PreviewPanelProps {
  code: string;
  type: 'html' | 'react';
  isLoading?: boolean;
  onFixErrors?: (errors: string[]) => void;
}

export const PreviewPanel = ({ code, type, isLoading, onFixErrors }: PreviewPanelProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    setErrors([]);
  };

  const handleFixErrors = () => {
    if (onFixErrors && errors.length > 0) {
      onFixErrors(errors);
    }
  };

  useEffect(() => {
    if (!code) return;

    const iframe = iframeRef.current;
    if (!iframe) return;

    // Listen for errors from iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'CONSOLE_ERROR') {
        setErrors(prev => [...prev, event.data.message]);
      }
    };

    window.addEventListener('message', handleMessage);
    
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
            <script>
              // Capture console errors
              window.addEventListener('error', function(e) {
                window.parent.postMessage({
                  type: 'CONSOLE_ERROR',
                  message: e.message + ' at ' + e.filename + ':' + e.lineno
                }, '*');
              });
              
              // Capture unhandled promise rejections
              window.addEventListener('unhandledrejection', function(e) {
                window.parent.postMessage({
                  type: 'CONSOLE_ERROR',
                  message: 'Unhandled Promise: ' + e.reason
                }, '*');
              });
            </script>
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
                window.parent.postMessage({
                  type: 'CONSOLE_ERROR',
                  message: 'No React component found in generated code'
                }, '*');
              }
            </script>
          </body>
        </html>
      `;
      iframe.srcdoc = htmlTemplate;
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [code, type, refreshKey]);

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
    <div className="h-full bg-white relative flex flex-col">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        {code && (
          <Button
            onClick={handleRefresh}
            size="sm"
            variant="outline"
            className="shadow-lg"
            title="Refresh preview"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border-b border-red-200 p-4 max-h-48 overflow-y-auto">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-semibold text-red-800">Console Errors</h3>
            <Button
              onClick={handleFixErrors}
              size="sm"
              variant="destructive"
              className="text-xs"
            >
              Attempt to Fix with AI?
            </Button>
          </div>
          <div className="space-y-1">
            {errors.map((error, idx) => (
              <div key={idx} className="text-xs text-red-700 font-mono bg-red-100 p-2 rounded">
                {error}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 relative">
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          sandbox="allow-scripts"
          title="Preview"
        />
        {!code && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
            <p className="text-sm text-muted-foreground">
              Your generated app will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
