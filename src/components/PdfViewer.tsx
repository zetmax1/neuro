import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, 
  Maximize2, 
  Minimize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ExternalLink, 
  FileText,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PdfViewerProps {
  url: string;
  title: string;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ url, title }) => {
  const [zoom, setZoom] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fullscreen listener for Esc key
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {
        setIsFullscreen(!isFullscreen);
      });
    } else {
      document.exitFullscreen().catch(() => {
        setIsFullscreen(false);
      });
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title || 'document'}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleResetZoom = () => setZoom(100);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "flex flex-col bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-xl transition-all duration-300",
        isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen w-screen" : "w-full h-full min-h-[500px]"
      )}
    >
      {/* Top Controls Toolbar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-white">
        
        {/* Left: Document Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold truncate max-w-[220px] sm:max-w-xs text-slate-200" title={title}>
            {title}
          </span>
        </div>

        {/* Center: Zoom Controls */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-1 rounded-xl border border-slate-700">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleZoomOut}
            disabled={zoom <= 50}
            className="w-7 h-7 text-slate-300 hover:text-white hover:bg-slate-700"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <span className="text-xs font-extrabold text-indigo-400 min-w-[42px] text-center">
            {zoom}%
          </span>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleZoomIn}
            disabled={zoom >= 200}
            className="w-7 h-7 text-slate-300 hover:text-white hover:bg-slate-700"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleResetZoom}
            className="w-7 h-7 text-slate-400 hover:text-white hover:bg-slate-700"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3 h-3" />
          </Button>
        </div>

        {/* Right: Download, External, Fullscreen */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleDownload}
            className="h-8 gap-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download PDF</span>
          </Button>

          <a href={url} target="_blank" rel="noopener noreferrer">
            <Button
              size="icon"
              variant="outline"
              className="w-8 h-8 border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
              title="Open PDF in New Tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </a>

          <Button
            size="icon"
            variant="outline"
            onClick={toggleFullscreen}
            className="w-8 h-8 border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </Button>
        </div>

      </div>

      {/* Main Viewer Canvas / Iframe Container */}
      <div className="relative flex-1 bg-slate-950 overflow-auto flex items-center justify-center p-4 sm:p-6">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/90 text-slate-300">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
            <p className="text-xs font-semibold">Loading PDF document...</p>
          </div>
        )}

        <div 
          className="w-full h-full transition-transform duration-200 origin-top flex items-center justify-center p-2 bg-slate-900 rounded-xl border border-slate-800 shadow-2xl"
          style={{ transform: `scale(${zoom / 100})` }}
        >
          <iframe
            src={`${url}#toolbar=1&navpanes=1`}
            title={title}
            onLoad={() => setIsLoading(false)}
            className="w-full h-full min-h-[520px] border-none bg-white rounded-lg shadow-inner"
          />
        </div>
      </div>
    </div>
  );
};

export default PdfViewer;
