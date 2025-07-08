import React, { useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const UploadPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setFiles([...files, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    console.log("Uploading files:", files);
    // TODO: API call to upload
  };

  return (
    <div className="flex flex-col items-center justify-start w-full max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold mb-6 text-center">Upload Media</h1>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={cn(
          "w-full border-2 border-dashed border-muted-foreground/30 rounded-xl p-8 mb-6 transition-colors",
          "flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/40"
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadCloud className="w-10 h-10 mb-2 text-muted-foreground" />
        <p className="text-muted-foreground mb-1">
          Drag and drop files here, or click to select
        </p>
        <p className="text-sm text-muted-foreground">
          Supported: JPG, PNG, MP4, MOV (max 100MB each)
        </p>
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="w-full mb-6 space-y-2">
          <h2 className="font-medium text-sm text-muted-foreground">
            Selected Files
          </h2>
          <ul className="divide-y divide-muted rounded-md border border-muted">
            {files.map((file, index) => (
              <li
                key={index}
                className="flex items-center justify-between px-4 py-2 text-sm"
              >
                <span className="truncate max-w-[80%]">{file.name}</span>
                <button
                  className="text-red-500 hover:text-red-600"
                  onClick={() => removeFile(index)}
                  title="Remove file"
                >
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Upload button */}
      <Button
        onClick={handleUpload}
        disabled={files.length === 0}
        className="w-full sm:w-auto"
      >
        Upload {files.length > 0 ? `(${files.length})` : ""}
      </Button>
    </div>
  );
};

export default UploadPage;
