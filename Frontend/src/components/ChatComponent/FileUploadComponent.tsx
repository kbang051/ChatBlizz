import React, { useState, useRef } from "react";
import axios from "axios";

interface UploadFile {
  file: File;
  progress: number;
  uploaded: boolean;
  error: string | null;
}

const MAX_TOTAL_SIZE = 15 * 1024 * 1024;

const FileUploadComponent = () => {
  console.log("FileUploadComponent is getting rendered");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<UploadFile[]>([]);

  const uploadFile = async (uploadFile: UploadFile) => {
    const formData = new FormData();
    formData.append("file", uploadFile.file);
    try {
      console.log("Uploading file:", uploadFile.file.name);
      await axios.post('http://localhost:8000/api/v1/users/fileUpload', formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (ProgressEvent) => {
          const percent = ProgressEvent.total ? Math.round((ProgressEvent.loaded * 100) / ProgressEvent.total) : 0;
          setFiles((prev) =>
            prev.map((f) =>
              f.file === uploadFile.file ? { ...f, progress: percent } : f
            )
          );
        },
      });

      setFiles((prev) =>
        prev.map((f) =>
          f.file === uploadFile.file ? { ...f, uploaded: true } : f
        )
      );
    } catch (error) {
      console.error("Upload failed:", error);
      setFiles((prev) =>
        prev.map((f) =>
          f.file === uploadFile.file ? { ...f, error: "Upload failed" } : f
        )
      );
    }
  };

  const handleFiles = (selectedFiles: FileList | null) => {
    console.log("Selected files:", selectedFiles);
    if (!selectedFiles) return;
    const fileArray = Array.from(selectedFiles);
    const totalSize = fileArray.reduce((acc, file) => acc + file.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      alert(`Total file size exceeds ${MAX_TOTAL_SIZE}MB.`);
      return;
    }
    // fileArray looks like [{ name: "hello.txt", type: "text/plain", size: 12, ...other File properties},{ name: "data.csv",type: "text/csv",size: 25,...other File properties}]
    const newUploads: UploadFile[] = fileArray.map((file) => ({
      file,
      progress: 0,
      uploaded: false,
      error: null,
    }));
    setFiles((prev) => [...prev, ...newUploads]);
    newUploads.forEach(uploadFile);
    console.log("New uploads:", newUploads);
  };

  return (
    <div className="flex-1 p-6 bg-gray-950 overflow-y-auto">
      <div
        className="border-dashed border-2 border-gray-700 rounded-lg h-full flex flex-col items-center justify-center p-4"
        onClick={() => fileInputRef.current?.click()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        <h2 className="text-gray-400">File Upload Section</h2>
        <p className="text-gray-400">
          Drag and drop your files here or click to upload.
        </p>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors mt-4 cursor-pointer"
          onClick={() => fileInputRef.current?.click() && console.log("Upload button clicked")}
        >
          Upload Files
        </button>
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          multiple
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="w-full mt-6 space-y-4">
          {files.map((f, idx) => (
            <div key={idx} className="bg-gray-800 rounded p-2">
              <div className="text-sm text-white">{f.file.name}</div>
              <div className="h-2 bg-gray-600 rounded mt-1 overflow-hidden">
                <div
                  className={`h-full ${
                    f.error
                      ? "bg-red-500"
                      : f.uploaded
                      ? "bg-green-500"
                      : "bg-blue-500"
                  }`}
                  style={{ width: `${f.progress}%` }}
                />
              </div>
              {f.error && (
                <div className="text-red-400 text-xs mt-1">{f.error}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FileUploadComponent;


