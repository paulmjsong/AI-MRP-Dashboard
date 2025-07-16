"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileX2 } from "lucide-react";
import { cn } from "@/lib/utils";

type FileUploaderProps = {
  /** Called with the single accepted file (or `undefined` if none). */
  onFile: (file?: File) => void;
  /** Acceptable extensions, e.g. ["xlsx","xls"]. */
  types: string[];
  /** Optional additional className(s). */
  className?: string;
};

export default function FileUploader({
  onFile,
  types,
  className,
}: FileUploaderProps) {
  /** Accept list converted to MIME + extensions for react-dropzone. */
  const accept = types.reduce<Record<string, string[]>>((acc, ext) => {
    acc[`.${ext.toLowerCase()}`] = [];
    return acc;
  }, {});

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length) onFile(accepted[0]);
      else onFile(undefined);
    },
    [onFile],
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    fileRejections,
  } = useDropzone({
    onDrop,
    accept,
    multiple: false,
    maxFiles: 1,
  });

  return (
    <>
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition",
          isDragActive ? "border-primary/70 bg-primary/5" : "border-muted",
          className,
        )}
      >
        <input {...getInputProps()} />

        {isDragActive ? (
          <>
            <Upload className="mb-2 h-8 w-8 opacity-70" />
            <p className="text-sm font-medium">드래그해서 놓으세요…</p>
          </>
        ) : (
          <>
            <Upload className="mb-2 h-8 w-8 opacity-70" />
            <p className="text-sm font-medium">
              클릭하거나 파일을 여기로 드래그하세요
            </p>
            <p className="text-xs text-muted-foreground">
              허용 확장자: {types.join(", ").toUpperCase()}
            </p>
          </>
        )}
      </div>

      {fileRejections.length > 0 && (
        <p className="mt-2 flex items-center gap-1 text-sm text-destructive">
          <FileX2 className="h-4 w-4" />
          지원되지 않는 형식입니다
        </p>
      )}
    </>
  );
}
