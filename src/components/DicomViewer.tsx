"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Move, 
  Ruler,
  Maximize,
  Settings,
  Minimize,
  Sun,
  Contrast,
  RotateCcw,
  MousePointer,
  Type,
  ArrowRight,
  Circle,
  Square,
  X
} from 'lucide-react';
import { api } from '@/lib/api';

interface DicomViewerProps {
  imageUrl: string;
  instanceId: string;
  onError?: (error: string) => void;
}

type ToolType = 'pointer' | 'measure' | 'text' | 'arrow' | 'circle' | 'rectangle';

export default function DicomViewer({ imageUrl, instanceId, onError }: DicomViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [windowCenter, setWindowCenter] = useState(128);
  const [windowWidth, setWindowWidth] = useState(256);
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [useSimpleMode, setUseSimpleMode] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  
  // Additional DICOM parameters
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(1);
  const [gamma, setGamma] = useState(1);
  const [activeTool, setActiveTool] = useState<ToolType>('pointer');
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingStart, setDrawingStart] = useState({ x: 0, y: 0 });
  const [tempAnnotation, setTempAnnotation] = useState<any>(null);

  // Fullscreen functionality
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Mouse drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Calculate mouse position relative to canvas container
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (activeTool === 'pointer' && zoom > 1) {
      setIsPanning(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    } else if (activeTool !== 'pointer') {
      // Get canvas dimensions
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Calculate the actual canvas position within the container
      const containerWidth = rect.width;
      const containerHeight = rect.height;
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      // Calculate scaling factors (object-contain scaling)
      const scaleX = containerWidth / canvasWidth;
      const scaleY = containerHeight / canvasHeight;
      const scale = Math.min(scaleX, scaleY);
      
      // Calculate the offset to center the canvas
      const offsetX = (containerWidth - canvasWidth * scale) / 2;
      const offsetY = (containerHeight - canvasHeight * scale) / 2;
      
      // Convert mouse position to canvas coordinates
      // Remove the offset and pan, then scale back to canvas coordinates
      const adjustedX = mouseX - offsetX - panOffset.x;
      const adjustedY = mouseY - offsetY - panOffset.y;
      
      // Convert to canvas coordinates (accounting for zoom)
      const canvasX = adjustedX / (scale * zoom);
      const canvasY = adjustedY / (scale * zoom);
      
      // Ensure coordinates are within canvas bounds
      const clampedX = Math.max(0, Math.min(canvasWidth, canvasX));
      const clampedY = Math.max(0, Math.min(canvasHeight, canvasY));
      
      setIsDrawing(true);
      setDrawingStart({ x: clampedX, y: clampedY });
      setTempAnnotation(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Calculate mouse position relative to canvas container
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isPanning && zoom > 1 && activeTool === 'pointer') {
      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;
      
      setPanOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setLastMousePos({ x: e.clientX, y: e.clientY });
    } else if (isDrawing && activeTool !== 'pointer') {
      // Get canvas dimensions
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Calculate the actual canvas position within the container
      const containerWidth = rect.width;
      const containerHeight = rect.height;
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      // Calculate scaling factors (object-contain scaling)
      const scaleX = containerWidth / canvasWidth;
      const scaleY = containerHeight / canvasHeight;
      const scale = Math.min(scaleX, scaleY);
      
      // Calculate the offset to center the canvas
      const offsetX = (containerWidth - canvasWidth * scale) / 2;
      const offsetY = (containerHeight - canvasHeight * scale) / 2;
      
      // Convert mouse position to canvas coordinates
      // Remove the offset and pan, then scale back to canvas coordinates
      const adjustedX = mouseX - offsetX - panOffset.x;
      const adjustedY = mouseY - offsetY - panOffset.y;
      
      // Convert to canvas coordinates (accounting for zoom)
      const canvasX = adjustedX / (scale * zoom);
      const canvasY = adjustedY / (scale * zoom);
      
      // Ensure coordinates are within canvas bounds
      const clampedX = Math.max(0, Math.min(canvasWidth, canvasX));
      const clampedY = Math.max(0, Math.min(canvasHeight, canvasY));
      
      // Create temporary annotation for preview
      const temp = {
        type: activeTool,
        start: drawingStart,
        end: { x: clampedX, y: clampedY },
        id: 'temp'
      };
      
      setTempAnnotation(temp);
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && tempAnnotation && activeTool !== 'pointer') {
      // Create final annotation
      const finalAnnotation = {
        ...tempAnnotation,
        id: Date.now()
      };
      
      setAnnotations(prev => [...prev, finalAnnotation]);
    }
    
    setIsPanning(false);
    setIsDrawing(false);
    setTempAnnotation(null);
  };

  const handleMouseLeave = () => {
    setIsPanning(false);
    setIsDrawing(false);
    setTempAnnotation(null);
  };

  // Reset pan when zoom changes
  useEffect(() => {
    if (zoom <= 1) {
      setPanOffset({ x: 0, y: 0 });
    }
  }, [zoom]);

  useEffect(() => {
    let localImageUrl: string | null = null;
    
    const loadDicomImage = async () => {
      if (!canvasRef.current) return;

      try {
        setIsLoading(true);
        setError(null);

        console.log('Loading DICOM image from:', imageUrl);

        // Use the API client to get the image with proper authentication
        const response = await api.get(imageUrl, {
          responseType: 'arraybuffer',
        });

        console.log('Response received:', response.status, response.headers);

        const arrayBuffer = response.data;
        
        // Create an image from the array buffer
        const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });
        localImageUrl = URL.createObjectURL(blob);
        
        const img = new Image();
        img.onload = () => {
          console.log('Image loaded successfully:', img.width, 'x', img.height);
          if (!canvasRef.current) return;
          
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          // Set canvas size
          canvas.width = img.width;
          canvas.height = img.height;

          // Store the original image for adjustments
          setOriginalImage(img);
          
          // Apply initial adjustments
          applyImageAdjustments(ctx, img);
          
          setIsLoading(false);
          setImageLoaded(true);
        };
        
        img.onerror = (e) => {
          console.error('Image load error:', e);
          setError('Failed to load image');
          setIsLoading(false);
        };
        
        img.src = localImageUrl;
      } catch (err) {
        console.error('Error loading DICOM image:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
        onError?.(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    if (!useSimpleMode) {
      loadDicomImage();
    } else {
      setIsLoading(false);
    }

    // Cleanup function to revoke object URL
    return () => {
      if (localImageUrl) {
        URL.revokeObjectURL(localImageUrl);
      }
    };
  }, [imageUrl, useSimpleMode]);

  // Apply all image adjustments
  const applyImageAdjustments = (
    ctx: CanvasRenderingContext2D, 
    img: HTMLImageElement
  ) => {
    // Create a temporary canvas for image processing
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCanvas.width = img.width;
    tempCanvas.height = img.height;

    // Apply rotation
    tempCtx.save();
    tempCtx.translate(img.width / 2, img.height / 2);
    tempCtx.rotate((rotation * Math.PI) / 180);
    tempCtx.drawImage(img, -img.width / 2, -img.height / 2);
    tempCtx.restore();

    const imageData = tempCtx.getImageData(0, 0, img.width, img.height);
    const data = imageData.data;

    // Apply window/level transformation
    const min = windowCenter - windowWidth / 2;
    const max = windowCenter + windowWidth / 2;
    const range = max - min;

    for (let i = 0; i < data.length; i += 4) {
      const pixelValue = data[i]; // Assuming grayscale, all channels are the same
      
      // Apply window/level
      let newValue = ((pixelValue - min) / range) * 255;
      newValue = Math.max(0, Math.min(255, newValue));
      
      // Apply brightness
      newValue = newValue + brightness;
      
      // Apply contrast
      newValue = ((newValue - 128) * contrast) + 128;
      
      // Apply gamma correction
      newValue = Math.pow(newValue / 255, 1 / gamma) * 255;
      
      newValue = Math.max(0, Math.min(255, newValue));
      
      data[i] = newValue;     // Red
      data[i + 1] = newValue; // Green
      data[i + 2] = newValue; // Blue
      // Alpha remains unchanged
    }

    tempCtx.putImageData(imageData, 0, 0);
    ctx.drawImage(tempCanvas, 0, 0);

    // Draw annotations if enabled
    if (showAnnotations) {
      drawAnnotations(ctx);
    }
  };

  // Draw annotations on canvas
  const drawAnnotations = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#ff0000';
    ctx.font = '12px Arial';

    // Draw permanent annotations
    const allAnnotations = [...annotations];
    
    // Add temporary annotation for preview
    if (tempAnnotation) {
      allAnnotations.push(tempAnnotation);
    }

    allAnnotations.forEach(annotation => {
      const start = annotation.start;
      const end = annotation.end;

      // Use different style for temporary annotation
      if (annotation.id === 'temp') {
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
      } else {
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
      }

      switch (annotation.type) {
        case 'measure':
          // Draw measurement line
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
          
          // Calculate and display distance
          const distance = Math.sqrt(
            Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
          );
          const midX = (start.x + end.x) / 2;
          const midY = (start.y + end.y) / 2;
          ctx.fillText(`${distance.toFixed(1)}px`, midX + 5, midY - 5);
          break;

        case 'arrow':
          // Draw arrow
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
          
          // Arrow head
          const angle = Math.atan2(end.y - start.y, end.x - start.x);
          const arrowLength = 10;
          ctx.beginPath();
          ctx.moveTo(end.x, end.y);
          ctx.lineTo(
            end.x - arrowLength * Math.cos(angle - Math.PI / 6),
            end.y - arrowLength * Math.sin(angle - Math.PI / 6)
          );
          ctx.moveTo(end.x, end.y);
          ctx.lineTo(
            end.x - arrowLength * Math.cos(angle + Math.PI / 6),
            end.y - arrowLength * Math.sin(angle + Math.PI / 6)
          );
          ctx.stroke();
          break;

        case 'circle':
          const radius = Math.sqrt(
            Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
          );
          ctx.beginPath();
          ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
          ctx.stroke();
          break;

        case 'rectangle':
          ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
          break;
      }
    });

    ctx.restore();
  };

  // Separate useEffect for image adjustments
  useEffect(() => {
    if (originalImage && canvasRef.current && imageLoaded) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        applyImageAdjustments(ctx, originalImage);
      }
    }
  }, [windowCenter, windowWidth, rotation, brightness, contrast, gamma, originalImage, imageLoaded, showAnnotations, annotations, tempAnnotation]);

  // Cleanup effect to reset image state when imageUrl changes
  useEffect(() => {
    setOriginalImage(null);
    setImageLoaded(false);
    setAnnotations([]);
  }, [imageUrl]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.1));
  };

  const handleReset = () => {
    setZoom(1);
    setWindowCenter(128);
    setWindowWidth(256);
    setPanOffset({ x: 0, y: 0 });
    setRotation(0);
    setBrightness(0);
    setContrast(1);
    setGamma(1);
    setAnnotations([]);
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const clearAnnotations = () => {
    setAnnotations([]);
  };

  const tools = [
    { id: 'pointer', icon: MousePointer, label: 'Pointer' },
    { id: 'measure', icon: Ruler, label: 'Measure' },
    { id: 'arrow', icon: ArrowRight, label: 'Arrow' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
  ];

  const handleUnselect = () => {
    setActiveTool('pointer');
    setIsPanning(false);
    setIsDrawing(false);
  };

  if (error && !useSimpleMode) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
          <p className="text-yellow-800">Advanced viewer failed. Trying simple mode...</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUseSimpleMode(true)}
          >
            Switch to Simple Mode
          </Button>
        </div>
        
        <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
          <div className="text-center">
            <p className="text-red-600 mb-2">Error loading DICOM image</p>
            <p className="text-sm text-gray-500">{error}</p>
            <p className="text-xs text-gray-400 mt-2">URL: {imageUrl}</p>
          </div>
        </div>
      </div>
    );
  }

  if (useSimpleMode) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800">Simple DICOM viewer mode</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUseSimpleMode(false)}
          >
            Switch to Advanced Mode
          </Button>
        </div>
        
        <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center min-h-96">
          <img
            src={imageUrl}
            alt={`DICOM Image ${instanceId}`}
            className="max-w-full max-h-96 object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-image.png';
            }}
          />
        </div>
        
        <div className="text-sm text-gray-600">
          <p>Instance ID: {instanceId}</p>
          <p>Mode: Simple</p>
        </div>
      </div>
    );
  }

  const containerClasses = isFullscreen 
    ? "fixed inset-0 z-50 bg-white flex flex-col"
    : "flex flex-col h-full space-y-4";

  const toolbarClasses = isFullscreen
    ? "flex flex-col lg:flex-row items-start lg:items-center justify-between p-2 lg:p-4 bg-gray-50 border-b flex-shrink-0 gap-2"
    : "flex flex-col items-start lg:items-center justify-between p-2 lg:p-4 bg-gray-50 rounded-lg flex-shrink-0 gap-2";

  const canvasContainerClasses = isFullscreen
    ? "flex-1 relative bg-gray-100 overflow-hidden"
    : "flex-1 relative bg-gray-100 rounded-lg overflow-hidden min-h-0";

  return (
    <div ref={containerRef} className={containerClasses}>
      {/* Toolbar */}
      <div className={toolbarClasses}>
        {/* Left side - Tools */}
        <div className="flex items-center space-x-1">
          {/* Navigation Tools */}
          <div className="flex space-x-1 border-r pr-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 5}
              className="h-8 w-8 p-0"
            >
              <ZoomIn className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 0.1}
              className="h-8 w-8 p-0"
            >
              <ZoomOut className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRotate}
              className="h-8 w-8 p-0"
            >
              <RotateCw className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="h-8 w-8 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          {/* Annotation Tools */}
          <div className="flex space-x-1 border-r pr-2">
            {tools.map((tool) => (
              <Button
                key={tool.id}
                variant={activeTool === tool.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTool(tool.id as ToolType)}
                title={tool.label}
                className="h-8 w-8 p-0"
              >
                <tool.icon className="h-3 w-3" />
              </Button>
            ))}
            {/*<Button
              variant="outline"
              size="sm"
              onClick={clearAnnotations}
              title="Clear Annotations"
              className="h-8 w-8 p-0"
            >
              <X className="h-3 w-3" />
            </Button>*/}
          </div>

          {/* Unselect Button */}
          <div className="flex space-x-1 border-r pr-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUnselect}
              title="Unselect Tool"
              className="h-8 px-2 text-xs"
            >
              Unselect
            </Button>
          </div>

          {/* Fullscreen Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="h-8 w-8 p-0"
          >
            {isFullscreen ? <Minimize className="h-3 w-3" /> : <Maximize className="h-3 w-3" />}
          </Button>
        </div>

        {/* Right side - Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* DICOM Window/Level Controls */}
          <div className="flex items-center space-x-1 border-r pr-2">
            <span className="text-gray-600 whitespace-nowrap" title="Window Center - DICOM display center point">WC:</span>
            <Slider
              value={[windowCenter]}
              onValueChange={([value]) => setWindowCenter(value)}
              min={0}
              max={255}
              step={1}
              className="w-16"
            />
            <span className="text-gray-600 w-6 text-right">{windowCenter}</span>
          </div>
          
          <div className="flex items-center space-x-1 border-r pr-2">
            <span className="text-gray-600 whitespace-nowrap" title="Window Width - DICOM display range">WW:</span>
            <Slider
              value={[windowWidth]}
              onValueChange={([value]) => setWindowWidth(value)}
              min={1}
              max={512}
              step={1}
              className="w-16"
            />
            <span className="text-gray-600 w-6 text-right">{windowWidth}</span>
          </div>

          {/* General Image Processing Controls */}
          <div className="flex items-center space-x-1 border-r pr-2" title="Brightness - Add/subtract value to all pixels">
            <Sun className="h-3 w-3 text-gray-600" />
            <Slider
              value={[brightness]}
              onValueChange={([value]) => setBrightness(value)}
              min={-100}
              max={100}
              step={1}
              className="w-16"
            />
            <span className="text-gray-600 w-6 text-right">{brightness}</span>
          </div>

          <div className="flex items-center space-x-1 border-r pr-2" title="Contrast - Multiply difference from middle gray">
            <Contrast className="h-3 w-3 text-gray-600" />
            <Slider
              value={[contrast]}
              onValueChange={([value]) => setContrast(value)}
              min={0.1}
              max={3}
              step={0.1}
              className="w-16"
            />
            <span className="text-gray-600 w-6 text-right">{contrast.toFixed(1)}</span>
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-gray-600" title="Gamma - Power function for brightness correction">γ:</span>
            <Slider
              value={[gamma]}
              onValueChange={([value]) => setGamma(value)}
              min={0.1}
              max={3}
              step={0.1}
              className="w-16"
            />
            <span className="text-gray-600 w-6 text-right">{gamma.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Image Canvas */}
      <div 
        className={canvasContainerClasses}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain"
          style={{
            transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
            transformOrigin: 'center',
            cursor: isPanning ? 'grabbing' : (zoom > 1 && activeTool === 'pointer' ? 'grab' : 'crosshair')
          }}
        />
      </div>

      {/* Image Info */}
      <div className="text-xs text-gray-600 flex-shrink-0 p-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div>
            <p>ID: {instanceId}</p>
            <p>Zoom: {zoom.toFixed(2)}x</p>
          </div>
          <div>
            <p>WC/WW: {windowCenter}/{windowWidth}</p>
            <p>Rot: {rotation}°</p>
          </div>
          <div>
            <p>B/C: {brightness}/{contrast.toFixed(1)}</p>
            <p>γ: {gamma.toFixed(1)}</p>
          </div>
          <div>
            <p>Tool: {activeTool}</p>
            <p>Mode: Advanced</p>
          </div>
        </div>
        {zoom > 1 && activeTool === 'pointer' && (
          <p className="text-blue-600 mt-1">💡 Drag to pan when zoomed in</p>
        )}
        {activeTool !== 'pointer' && (
          <p className="text-green-600 mt-1">💡 Click and drag to draw {activeTool}</p>
        )}
        <div className="mt-1 text-gray-500 text-xs">
          <span className="font-semibold">WC/WW:</span> DICOM display parameters | 
          <span className="font-semibold"> B/C:</span> General image processing
        </div>
      </div>
    </div>
  );
} 