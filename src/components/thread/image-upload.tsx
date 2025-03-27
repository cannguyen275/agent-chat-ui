import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Image, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { processImageFile } from "@/lib/image-utils";
import { toast } from "sonner";

interface ImageUploadProps {
  onImageSelected: (imageData: {
    base64: string;
    mimeType: string;
    originalName: string;
  } | null) => void;
  className?: string;
}

export function ImageUpload({ onImageSelected, className }: ImageUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setIsProcessing(true);
    try {
      // Create preview URL
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Process the image (resize and convert to base64)
      const processedImage = await processImageFile(file);
      onImageSelected(processedImage);
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Failed to process image");
      setPreviewUrl(null);
      onImageSelected(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    onImageSelected(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("relative", className)}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={isProcessing}
      />
      
      {previewUrl ? (
        <div className="relative inline-block">
          <img
            src={previewUrl}
            alt="Preview"
            className="max-h-20 max-w-20 rounded-md object-contain"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background shadow-sm hover:bg-destructive hover:text-destructive-foreground"
            onClick={handleClearImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleButtonClick}
          disabled={isProcessing}
          className="text-muted-foreground hover:text-foreground"
          title="Add image"
        >
          <Image className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
