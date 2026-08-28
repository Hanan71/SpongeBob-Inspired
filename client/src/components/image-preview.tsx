import { Download, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ImagePreviewProps {
  originalImage: string | null;
  processedImage: string | null;
  isProcessing: boolean;
  onReset: () => void;
}

export function ImagePreview({ 
  originalImage, 
  processedImage, 
  isProcessing,
  onReset 
}: ImagePreviewProps) {
  
  const handleDownload = () => {
    if (!processedImage) return;

    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `spongebob-cartoon-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Images Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Original Image */}
        {originalImage && (
          <Card className="overflow-hidden">
            <div className="p-4 bg-muted/50">
              <h3 className="font-semibold text-center">📷 الصورة الأصلية</h3>
            </div>
            <div className="p-4">
              <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                <img
                  src={originalImage}
                  alt="الصورة الأصلية"
                  className="w-full h-full object-contain"
                  data-testid="img-original"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Processed Image or Loading */}
        {(processedImage || isProcessing) && (
          <Card className="overflow-hidden">
            <div className="p-4 bg-primary/10">
              <h3 className="font-semibold text-center">🎨 نتيجة التحويل</h3>
            </div>
            <div className="p-4">
              <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                {isProcessing ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-muted-foreground animate-pulse">
                      جاري التحويل إلى أسلوب SpongeBob...
                    </p>
                  </div>
                ) : processedImage ? (
                  <img
                    src={processedImage}
                    alt="الصورة المحولة"
                    className="w-full h-full object-contain"
                    data-testid="img-processed"
                  />
                ) : null}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Action Buttons */}
      {processedImage && !isProcessing && (
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            size="lg"
            className="gap-2 bg-chart-3 hover:bg-chart-3/90 text-white"
            onClick={handleDownload}
            data-testid="button-download"
          >
            <Download className="w-5 h-5" />
            <span>تحميل الصورة</span>
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            className="gap-2"
            onClick={onReset}
            data-testid="button-reset"
          >
            <RotateCcw className="w-5 h-5" />
            <span>صورة جديدة</span>
          </Button>
        </div>
      )}

      {/* Success Message */}
      {processedImage && !isProcessing && (
        <div className="text-center p-6 bg-chart-3/10 rounded-lg border-2 border-chart-3/20">
          <p className="text-lg font-semibold text-chart-3">
            ✨ تم تحويل صورتك بنجاح إلى أسلوب SpongeBob الكرتوني!
          </p>
        </div>
      )}
    </div>
  );
}
