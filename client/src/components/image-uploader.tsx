import { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface ImageUploaderProps {
  onImageSelect: (dataUrl: string) => void;
}

export function ImageUploader({ onImageSelect }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: '❌ نوع ملف غير صحيح',
        description: 'الرجاء اختيار صورة (JPG، PNG، إلخ)',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      onImageSelect(dataUrl);
    };
    reader.readAsDataURL(file);
  }, [onImageSelect, toast]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  return (
    <Card className="mx-auto max-w-2xl">
      <div
        className={`
          relative p-12 border-4 border-dashed rounded-2xl
          transition-all duration-200 cursor-pointer
          ${isDragging 
            ? 'border-primary bg-primary/5 scale-[1.02]' 
            : 'border-border hover:border-primary/50 hover:bg-primary/5'
          }
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('file-input')?.click()}
        data-testid="dropzone-upload"
      >
        <input
          id="file-input"
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          data-testid="input-file"
        />

        <div className="flex flex-col items-center text-center gap-4">
          <div className={`
            p-4 rounded-full bg-primary/10 transition-transform
            ${isDragging ? 'scale-110' : ''}
          `}>
            {isDragging ? (
              <ImageIcon className="w-12 h-12 text-primary" />
            ) : (
              <Upload className="w-12 h-12 text-primary" />
            )}
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">
              {isDragging ? 'أفلت الصورة هنا' : 'اسحب وأفلت صورتك هنا'}
            </h3>
            <p className="text-muted-foreground">
              أو اضغط للاختيار من جهازك
            </p>
          </div>

          <div className="text-sm text-muted-foreground">
            الصيغ المدعومة: JPG، PNG، WebP
          </div>
        </div>
      </div>
    </Card>
  );
}
