import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, Image, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ReceiptUploadProps {
  receiptUrl: string | null;
  onUpload: (url: string) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export function ReceiptUpload({
  receiptUrl,
  onUpload,
  onRemove,
  disabled,
}: ReceiptUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, or WebP)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("petty-cash-receipts")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("petty-cash-receipts")
        .getPublicUrl(filePath);

      onUpload(urlData.publicUrl);
      toast.success("Receipt uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload receipt");
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = async () => {
    if (!receiptUrl) return;

    try {
      // Extract file path from URL
      const urlParts = receiptUrl.split("/petty-cash-receipts/");
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from("petty-cash-receipts").remove([filePath]);
      }
      onRemove();
      toast.success("Receipt removed");
    } catch (error) {
      console.error("Remove error:", error);
      onRemove(); // Still remove from form even if storage delete fails
    }
  };

  if (receiptUrl) {
    return (
      <div className="relative group">
        <div className="border rounded-lg overflow-hidden bg-muted/50">
          <img
            src={receiptUrl}
            alt="Receipt"
            className="w-full h-32 object-cover"
          />
          <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              disabled={disabled}
            >
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />
      <Button
        type="button"
        variant="outline"
        className="w-full h-20 border-dashed"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || isUploading}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                <Upload className="h-4 w-4" />
              </div>
              <span className="text-xs text-muted-foreground">
                Click to upload receipt image
              </span>
            </div>
          </>
        )}
      </Button>
    </div>
  );
}
