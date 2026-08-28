import { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, CameraOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
}

export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  
  const { toast } = useToast();

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      setIsCameraActive(true);
      setHasPermission(true);
    } catch (error) {
      console.error('Camera error:', error);
      setHasPermission(false);
      toast({
        variant: 'destructive',
        title: '❌ تعذر الوصول للكاميرا',
        description: 'الرجاء السماح بالوصول للكاميرا في إعدادات المتصفح',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval);
          
          setTimeout(() => {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            
            if (video && canvas) {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(video, 0, 0);
                
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                setTimeout(() => {
                  const dataUrl = canvas.toDataURL('image/png');
                  onCapture(dataUrl);
                  stopCamera();
                }, 200);
              }
            }
            setCountdown(null);
          }, 100);
          
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }, [onCapture, stopCamera]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <Card className="mx-auto max-w-3xl overflow-hidden">
      <div className="relative bg-card">
        {/* Video Preview */}
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
          )}
          
          {hasPermission === false && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
              <CameraOff className="w-16 h-16 text-muted-foreground" />
              <div>
                <h3 className="text-xl font-semibold mb-2">تعذر الوصول للكاميرا</h3>
                <p className="text-muted-foreground mb-4">
                  الرجاء السماح بالوصول للكاميرا في إعدادات المتصفح
                </p>
                <Button onClick={startCamera} data-testid="button-retry-camera">
                  <Camera className="w-4 h-4 mr-2" />
                  حاول مرة أخرى
                </Button>
              </div>
            </div>
          )}

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            data-testid="video-preview"
          />

          {/* Countdown Overlay */}
          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div 
                className="text-9xl font-bold text-primary animate-pulse"
                style={{ textShadow: '0 0 30px rgba(255, 204, 0, 0.5)' }}
              >
                {countdown}
              </div>
            </div>
          )}
        </div>

        {/* Capture Button */}
        {isCameraActive && (
          <div className="p-6 flex justify-center">
            <Button
              size="lg"
              className="gap-2 px-12 text-lg rounded-full"
              onClick={capturePhoto}
              disabled={countdown !== null}
              data-testid="button-capture"
            >
              <Camera className="w-5 h-5" />
              <span>التقط الصورة</span>
            </Button>
          </div>
        )}

        {/* Hidden Canvas for Capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </Card>
  );
}
