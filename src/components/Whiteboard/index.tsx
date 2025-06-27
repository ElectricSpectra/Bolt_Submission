import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  Pencil, 
  Eraser, 
  Trash2, 
  Download, 
  Palette,
  Minus,
  Plus,
  RotateCcw,
  Square,
  Circle,
  Type
} from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface DrawingPath {
  points: Point[];
  color: string;
  width: number;
  tool: 'pen' | 'eraser';
}

interface Shape {
  type: 'rectangle' | 'circle' | 'text';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  width: number;
  text?: string;
}

export const Whiteboard = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser' | 'rectangle' | 'circle' | 'text'>('pen');
  const [currentColor, setCurrentColor] = useState('#ff6b35');
  const [currentWidth, setCurrentWidth] = useState(3);
  const [isShapeDrawing, setIsShapeDrawing] = useState(false);
  const [shapeStart, setShapeStart] = useState<Point | null>(null);
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [textPosition, setTextPosition] = useState<Point | null>(null);

  const colors = [
    '#ff6b35', // Orange
    '#f7931e', // Light Orange
    '#ffffff', // White
    '#000000', // Black
    '#ff0000', // Red
    '#00ff00', // Green
    '#0000ff', // Blue
    '#ffff00', // Yellow
    '#ff00ff', // Magenta
    '#00ffff', // Cyan
  ];

  const getCanvasCoordinates = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasCoordinates(e);
    
    if (currentTool === 'text') {
      setTextPosition(point);
      setShowTextInput(true);
      return;
    }

    if (currentTool === 'rectangle' || currentTool === 'circle') {
      setIsShapeDrawing(true);
      setShapeStart(point);
      return;
    }

    setIsDrawing(true);
    setCurrentPath([point]);
  }, [currentTool, getCanvasCoordinates]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing && !isShapeDrawing) return;

    const point = getCanvasCoordinates(e);

    if (isShapeDrawing && shapeStart) {
      // For shapes, we'll draw a preview
      redrawCanvas();
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx) return;

      ctx.strokeStyle = currentColor;
      ctx.lineWidth = currentWidth;
      ctx.setLineDash([5, 5]); // Dashed line for preview

      if (currentTool === 'rectangle') {
        const width = point.x - shapeStart.x;
        const height = point.y - shapeStart.y;
        ctx.strokeRect(shapeStart.x, shapeStart.y, width, height);
      } else if (currentTool === 'circle') {
        const radius = Math.sqrt(
          Math.pow(point.x - shapeStart.x, 2) + Math.pow(point.y - shapeStart.y, 2)
        );
        ctx.beginPath();
        ctx.arc(shapeStart.x, shapeStart.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
      ctx.setLineDash([]); // Reset line dash
      return;
    }

    if (isDrawing) {
      setCurrentPath(prev => [...prev, point]);
      
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx) return;

      if (currentTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = currentWidth * 2;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = currentWidth;
      }

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (currentPath.length > 1) {
        const prevPoint = currentPath[currentPath.length - 2];
        ctx.beginPath();
        ctx.moveTo(prevPoint.x, prevPoint.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      }
    }
  }, [isDrawing, isShapeDrawing, currentPath, currentTool, currentColor, currentWidth, shapeStart, getCanvasCoordinates]);

  const stopDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isShapeDrawing && shapeStart) {
      const point = getCanvasCoordinates(e);
      const newShape: Shape = {
        type: currentTool as 'rectangle' | 'circle',
        startX: shapeStart.x,
        startY: shapeStart.y,
        endX: point.x,
        endY: point.y,
        color: currentColor,
        width: currentWidth,
      };
      setShapes(prev => [...prev, newShape]);
      setIsShapeDrawing(false);
      setShapeStart(null);
      redrawCanvas();
      return;
    }

    if (isDrawing && currentPath.length > 0) {
      const newPath: DrawingPath = {
        points: currentPath,
        color: currentColor,
        width: currentWidth,
        tool: currentTool as 'pen' | 'eraser',
      };
      setPaths(prev => [...prev, newPath]);
      setCurrentPath([]);
    }
    setIsDrawing(false);
  }, [isDrawing, isShapeDrawing, currentPath, currentTool, currentColor, currentWidth, shapeStart, getCanvasCoordinates]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all paths
    paths.forEach(path => {
      if (path.points.length < 2) return;

      if (path.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = path.width * 2;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = path.color;
        ctx.lineWidth = path.width;
      }

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);

      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }
      ctx.stroke();
    });

    // Draw all shapes
    ctx.globalCompositeOperation = 'source-over';
    shapes.forEach(shape => {
      ctx.strokeStyle = shape.color;
      ctx.lineWidth = shape.width;

      if (shape.type === 'rectangle') {
        const width = shape.endX - shape.startX;
        const height = shape.endY - shape.startY;
        ctx.strokeRect(shape.startX, shape.startY, width, height);
      } else if (shape.type === 'circle') {
        const radius = Math.sqrt(
          Math.pow(shape.endX - shape.startX, 2) + Math.pow(shape.endY - shape.startY, 2)
        );
        ctx.beginPath();
        ctx.arc(shape.startX, shape.startY, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (shape.type === 'text' && shape.text) {
        ctx.fillStyle = shape.color;
        ctx.font = `${shape.width * 6}px Arial`;
        ctx.fillText(shape.text, shape.startX, shape.startY);
      }
    });
  }, [paths, shapes]);

  const clearCanvas = () => {
    setPaths([]);
    setShapes([]);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const undo = () => {
    if (shapes.length > 0) {
      setShapes(prev => prev.slice(0, -1));
    } else if (paths.length > 0) {
      setPaths(prev => prev.slice(0, -1));
    }
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const addText = () => {
    if (textInput.trim() && textPosition) {
      const newShape: Shape = {
        type: 'text',
        startX: textPosition.x,
        startY: textPosition.y,
        endX: textPosition.x,
        endY: textPosition.y,
        color: currentColor,
        width: currentWidth,
        text: textInput,
      };
      setShapes(prev => [...prev, newShape]);
      setTextInput('');
      setShowTextInput(false);
      setTextPosition(null);
    }
  };

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Set white background
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  return (
    <Card className="bg-gray-900/90 backdrop-blur-sm border-orange-500/30 h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="text-white flex items-center gap-2">
          <Pencil className="w-5 h-5 text-orange-400" />
          Interactive Whiteboard
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden p-4">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 mb-4 p-3 bg-black/60 rounded-lg border border-orange-500/20">
          {/* Tools */}
          <div className="flex gap-1">
            <Button
              variant={currentTool === 'pen' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentTool('pen')}
              className={currentTool === 'pen' ? 'bg-orange-500 text-black' : 'bg-gray-800 text-white border-gray-600'}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant={currentTool === 'eraser' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentTool('eraser')}
              className={currentTool === 'eraser' ? 'bg-orange-500 text-black' : 'bg-gray-800 text-white border-gray-600'}
            >
              <Eraser className="w-4 h-4" />
            </Button>
            <Button
              variant={currentTool === 'rectangle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentTool('rectangle')}
              className={currentTool === 'rectangle' ? 'bg-orange-500 text-black' : 'bg-gray-800 text-white border-gray-600'}
            >
              <Square className="w-4 h-4" />
            </Button>
            <Button
              variant={currentTool === 'circle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentTool('circle')}
              className={currentTool === 'circle' ? 'bg-orange-500 text-black' : 'bg-gray-800 text-white border-gray-600'}
            >
              <Circle className="w-4 h-4" />
            </Button>
            <Button
              variant={currentTool === 'text' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentTool('text')}
              className={currentTool === 'text' ? 'bg-orange-500 text-black' : 'bg-gray-800 text-white border-gray-600'}
            >
              <Type className="w-4 h-4" />
            </Button>
          </div>

          {/* Brush Size */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWidth(Math.max(1, currentWidth - 1))}
              className="bg-gray-800 text-white border-gray-600"
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="text-white text-sm px-2 min-w-[2rem] text-center">{currentWidth}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWidth(Math.min(20, currentWidth + 1))}
              className="bg-gray-800 text-white border-gray-600"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          {/* Colors */}
          <div className="flex gap-1">
            {colors.map(color => (
              <button
                key={color}
                onClick={() => setCurrentColor(color)}
                className={`w-6 h-6 rounded border-2 ${
                  currentColor === color ? 'border-orange-400' : 'border-gray-600'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-1 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={undo}
              className="bg-gray-800 text-white border-gray-600"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearCanvas}
              className="bg-gray-800 text-white border-gray-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadCanvas}
              className="bg-gray-800 text-white border-gray-600"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Text Input Modal */}
        {showTextInput && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-4 rounded-lg border border-orange-500/30">
              <h3 className="text-white mb-3">Enter Text</h3>
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 mb-3"
                placeholder="Type your text..."
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && addText()}
              />
              <div className="flex gap-2">
                <Button onClick={addText} size="sm" className="bg-orange-500 text-black">
                  Add Text
                </Button>
                <Button 
                  onClick={() => {
                    setShowTextInput(false);
                    setTextInput('');
                    setTextPosition(null);
                  }} 
                  variant="outline" 
                  size="sm"
                  className="bg-gray-700 text-white border-gray-600"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1 flex items-center justify-center bg-white rounded-lg border-2 border-orange-500/20 overflow-hidden">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="cursor-crosshair max-w-full max-h-full"
            style={{ 
              width: '100%', 
              height: '100%',
              objectFit: 'contain'
            }}
          />
        </div>

        {/* Instructions */}
        <div className="mt-3 text-center">
          <p className="text-orange-200 text-xs">
            💡 Draw, write, and annotate! The AI can see your whiteboard when you share your screen.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};