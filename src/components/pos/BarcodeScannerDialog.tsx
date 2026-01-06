import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Barcode, Keyboard } from "lucide-react";

interface BarcodeScannerDialogProps {
  open: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

export function BarcodeScannerDialog({
  open,
  onClose,
  onScan,
}: BarcodeScannerDialogProps) {
  const [barcode, setBarcode] = useState("");
  const [mode, setMode] = useState<"scanner" | "manual">("scanner");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open, mode]);

  useEffect(() => {
    if (!open) {
      setBarcode("");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcode.trim()) {
      onScan(barcode.trim());
      setBarcode("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && barcode.trim()) {
      onScan(barcode.trim());
      setBarcode("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Barcode className="h-5 w-5" />
            Barcode Scanner
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={mode === "scanner" ? "default" : "outline"}
              onClick={() => setMode("scanner")}
              className="flex-1 gap-2"
            >
              <Barcode className="h-4 w-4" />
              Scanner
            </Button>
            <Button
              variant={mode === "manual" ? "default" : "outline"}
              onClick={() => setMode("manual")}
              className="flex-1 gap-2"
            >
              <Keyboard className="h-4 w-4" />
              Manual Entry
            </Button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-3">
              {mode === "scanner" ? (
                <div className="space-y-3">
                  <div className="aspect-video bg-secondary/50 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Barcode className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm font-medium">Scan barcode with your device</p>
                      <p className="text-xs mt-1">Or start typing to input manually</p>
                    </div>
                  </div>
                  <Input
                    ref={inputRef}
                    placeholder="Barcode will appear here..."
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                  />
                </div>
              ) : (
                <Input
                  ref={inputRef}
                  placeholder="Enter barcode or SKU manually..."
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
              )}

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={!barcode.trim()}>
                  Add to Cart
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
