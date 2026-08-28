import { useState, useCallback } from 'react';
import { Upload, Camera, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ImageProcessor } from '@/lib/imageProcessing';
import { ImageUploader } from '@/components/image-uploader';
import { CameraCapture } from '@/components/camera-capture';
import { ImagePreview } from '@/components/image-preview';
import { ThemeToggle } from '@/components/theme-toggle';

type Mode = 'upload' | 'camera';

export default function Home() {
  const [mode, setMode] = useState<Mode>('upload');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleImageSelect = useCallback((dataUrl: string) => {
    setOriginalImage(dataUrl);
    setProcessedImage(null);
  }, []);

  const handleCameraCapture = useCallback(async (dataUrl: string) => {
    setOriginalImage(dataUrl);
    setProcessedImage(null);
    
    setTimeout(() => {
      processImage(dataUrl);
    }, 100);
  }, []);

  const processImage = useCallback(async (imageDataUrl: string) => {
    setIsProcessing(true);
    
    try {
      const img = new Image();
      img.onload = async () => {
        try {
          const processor = new ImageProcessor();
          const result = await processor.spongebobCartoonize(img);
          setProcessedImage(result.dataUrl);
          
          toast({
            title: '🎨 تم التحويل بنجاح!',
            description: 'صورتك أصبحت الآن بأسلوب SpongeBob الكرتوني',
          });
        } catch (error) {
          console.error('Processing error:', error);
          toast({
            variant: 'destructive',
            title: '❌ حدث خطأ',
            description: 'تعذر معالجة الصورة. حاول مرة أخرى.',
          });
        } finally {
          setIsProcessing(false);
        }
      };
      img.src = imageDataUrl;
    } catch (error) {
      console.error('Image load error:', error);
      setIsProcessing(false);
      toast({
        variant: 'destructive',
        title: '❌ حدث خطأ',
        description: 'تعذر تحميل الصورة. حاول مرة أخرى.',
      });
    }
  }, [toast]);

  const handleConvert = useCallback(() => {
    if (originalImage) {
      processImage(originalImage);
    }
  }, [originalImage, processImage]);

  const handleReset = useCallback(() => {
    setOriginalImage(null);
    setProcessedImage(null);
    setIsProcessing(false);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-secondary to-accent overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="bubble-animation" />
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="text-center">
            <div className="text-7xl md:text-8xl mb-4">🧽</div>
            <h1 
              className="text-4xl md:text-5xl font-bold text-secondary-foreground mb-3"
              style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}
            >
              SpongeBob Cartoonizer
            </h1>
            <p className="text-lg md:text-xl text-secondary-foreground/90">
              حوّل صورتك إلى كرتون بأسلوب SpongeBob!
            </p>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="wave-bottom">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16">
            <path 
              d="M0,0 C150,60 350,0 600,60 C850,120 1050,60 1200,0 L1200,120 L0,120 Z" 
              fill="hsl(var(--background))"
            />
          </svg>
        </div>
      </div>

      {/* Theme Toggle */}
      <div className="fixed top-4 left-4 z-50">
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {/* Mode Selector */}
        <Card className="p-2 mb-8 mx-auto max-w-md">
          <div className="flex gap-2">
            <Button
              variant={mode === 'upload' ? 'default' : 'ghost'}
              className="flex-1 gap-2"
              onClick={() => {
                setMode('upload');
                handleReset();
              }}
              data-testid="button-mode-upload"
            >
              <Upload className="w-5 h-5" />
              <span>رفع صورة</span>
            </Button>
            <Button
              variant={mode === 'camera' ? 'default' : 'ghost'}
              className="flex-1 gap-2"
              onClick={() => {
                setMode('camera');
                handleReset();
              }}
              data-testid="button-mode-camera"
            >
              <Camera className="w-5 h-5" />
              <span>الكاميرا</span>
            </Button>
          </div>
        </Card>

        {/* Upload or Camera Mode */}
        {mode === 'upload' ? (
          <div className="mb-8">
            <ImageUploader onImageSelect={handleImageSelect} />
          </div>
        ) : (
          <div className="mb-8">
            <CameraCapture onCapture={handleCameraCapture} />
          </div>
        )}

        {/* Convert Button - Only show for upload mode if image is selected */}
        {mode === 'upload' && originalImage && !processedImage && (
          <div className="flex justify-center mb-8">
            <Button
              size="lg"
              className="gap-2 px-12 text-lg"
              onClick={handleConvert}
              disabled={isProcessing}
              data-testid="button-convert"
            >
              <Sparkles className="w-5 h-5" />
              <span>{isProcessing ? 'جاري التحويل...' : 'حوّل إلى كرتون'}</span>
            </Button>
          </div>
        )}

        {/* Image Preview */}
        {(originalImage || processedImage) && (
          <ImagePreview
            originalImage={originalImage}
            processedImage={processedImage}
            isProcessing={isProcessing}
            onReset={handleReset}
          />
        )}

        {/* Footer */}
        <footer className="text-center py-6 mt-12 text-muted-foreground">
          <p className="text-sm">
            صُنع بـ 💛 بأسلوب SpongeBob
          </p>
        </footer>
      </div>

      {/* Bubble Animation Styles */}
      <style>{`
        .bubble-animation {
          background-image: 
            radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 60% 70%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 30%, rgba(255,255,255,0.1) 0%, transparent 50%);
          background-size: 100% 100%;
          animation: float 20s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        .wave-bottom {
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
        }
      `}</style>
    </div>
  );
}
