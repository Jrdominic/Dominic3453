import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface PreviewPanelProps {
  code: string;
  type: 'html' | 'react';
  isLoading?: boolean;
}

export const PreviewPanel = ({ code, type, isLoading }: PreviewPanelProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!code || !iframeRef.current) return;

    setShowPreview(false);

    // Show "Preparing App Preview" for 1 second
    const timer = setTimeout(() => {
      setShowPreview(true);
      
      if (type === 'html') {
        // Direct HTML rendering
        const iframe = iframeRef.current;
        if (iframe) {
          iframe.srcdoc = code;
        }
      } else if (type === 'react') {
        // React component rendering with Babel transpilation
        const iframe = iframeRef.current;
        if (iframe) {
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
                  
                  // Find the default export or the main component
                  const Component = typeof exports !== 'undefined' && exports.default 
                    ? exports.default 
                    : (typeof App !== 'undefined' ? App : null);
                  
                  if (Component) {
                    const root = ReactDOM.createRoot(document.getElementById('root'));
                    root.render(React.createElement(Component));
                  } else {
                    document.getElementById('root').innerHTML = '<div style="padding: 20px; color: red;">Error: No component found to render</div>';
                  }
                </script>
              </body>
            </html>
          `;
          iframe.srcdoc = htmlTemplate;
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
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

  if (!showPreview && code) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/20">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-sm text-muted-foreground">Preparing App Preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white">
      {code ? (
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          sandbox="allow-scripts"
          title="Preview"
        />
      ) : (
        <div className="flex items-center justify-center h-full bg-muted/20">
          <p className="text-sm text-muted-foreground">
            Your generated app will appear here
          </p>
        </div>
      )}
    </div>
  );
};
