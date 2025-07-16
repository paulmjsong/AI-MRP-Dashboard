"use client"

import { useState } from "react"
import { mutate } from "swr";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import FileUploader from "@/components/file-uploader";

// ------------------------------
// 1. UPLOAD DIALOG
// ------------------------------

interface PreprocessDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function PreprocessDialog({ isOpen, onClose }: PreprocessDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/dashboard/api/upload", {method: "POST", body: form});

      if (res.ok) {
        // Refresh dashboard data
        mutate("/dashboard/api/data-kpi");
        mutate("/dashboard/api/data-forecast");

        // Close dialog & reset state
        onClose();
        setFile(null);
      }
    } catch (err) {
      console.error("[upload] failed:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>데이터 파일을 업로드하세요</DialogTitle>
          <DialogDescription>
            파일 업로드 시 대시보드가 자동으로 업데이트 됩니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {isUploading ? (
            /* Loading wheel */
            <div className="flex justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            </div>
          ) : (
            /* Normal uploader UI */
            <>
              <FileUploader onFile={(f) => setFile(f ?? null)} types={["xlsx", "xls"]} />
              {file && (
                <p className="text-sm">
                  ✅ <strong>{file.name}</strong> 선택됨
                </p>
              )}
            </>
          )}
        </div>
        
        <Button variant="default" size="lg" disabled={!file || isUploading}
          onClick={handleUpload}
        >
          {isUploading ? "업로드 중…" : file ? "파일 업로드" : "파일 선택 필요"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
