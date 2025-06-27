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
  Settings
} from 'lucide-react';
import { api } from '@/lib/api';

interface DicomViewerProps {
  imageUrl: string;
  instanceId: string;
  onError?: (error: string) => void;
}

export default function DicomViewer({ imageUrl, instanceId, onError }: DicomViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [windowCenter, setWindowCenter] = useState(128);
  const [windowWidth, setWindowWidth] = useState(256);
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [useSimpleMode, setUseSimpleMode] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
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
        const localImageUrl = URL.createObjectURL(blob);
        
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

          // Apply window/level adjustment
          applyWindowLevel(ctx, img, windowCenter, windowWidth);
          
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
  }, [imageUrl, windowCenter, windowWidth, useSimpleMode]);

  const applyWindowLevel = (
    ctx: CanvasRenderingContext2D, 
    img: HTMLImageElement, 
    center: number, 
    width: number
  ) => {
    // Create a temporary canvas for image processing
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    tempCtx.drawImage(img, 0, 0);

    const imageData = tempCtx.getImageData(0, 0, img.width, img.height);
    const data = imageData.data;

    // Apply window/level transformation
    const min = center - width / 2;
    const max = center + width / 2;
    const range = max - min;

    for (let i = 0; i < data.length; i += 4) {
      const pixelValue = data[i]; // Assuming grayscale, all channels are the same
      
      // Apply window/level
      let newValue = ((pixelValue - min) / range) * 255;
      newValue = Math.max(0, Math.min(255, newValue));
      
      data[i] = newValue;     // Red
      data[i + 1] = newValue; // Green
      data[i + 2] = newValue; // Blue
      // Alpha remains unchanged
    }

    tempCtx.putImageData(imageData, 0, 0);
    ctx.drawImage(tempCanvas, 0, 0);
  };

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

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoom >= 5}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoom <= 0.1}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Window Center:</span>
            <Slider
              value={[windowCenter]}
              onValueChange={([value]) => setWindowCenter(value)}
              min={0}
              max={255}
              step={1}
              className="w-24"
            />
            <span className="text-sm text-gray-600 w-8">{windowCenter}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Window Width:</span>
            <Slider
              value={[windowWidth]}
              onValueChange={([value]) => setWindowWidth(value)}
              min={1}
              max={512}
              step={1}
              className="w-24"
            />
            <span className="text-sm text-gray-600 w-8">{windowWidth}</span>
          </div>
        </div>
      </div>

      {/* Image Canvas */}
      <div className="relative bg-gray-100 rounded-lg overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        <canvas
          ref={canvasRef}
          className="max-w-full h-auto"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center',
            cursor: isPanning ? 'grabbing' : 'grab'
          }}
        />
      </div>

      {/* Image Info */}
      <div className="text-sm text-gray-600">
        <p>Instance ID: {instanceId}</p>
        <p>Zoom: {zoom.toFixed(2)}x</p>
        <p>Window: {windowCenter} / {windowWidth}</p>
        <p>Mode: Advanced</p>
      </div>
    </div>
  );
} 