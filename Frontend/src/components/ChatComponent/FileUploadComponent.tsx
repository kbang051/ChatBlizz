import React, { useState, useRef } from "react";
import axios from "axios";
import { useChatStore } from "../../store/useChatStore.ts";
import { useAuthStore } from "../../store/useAuthStore.ts";

interface UploadFile {
  file: File;
  progress: number;
  uploaded: boolean;
  error: string | null;
}

const MAX_TOTAL_SIZE = 15 * 1024 * 1024;

const FileUploadComponent = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<UploadFile[]>([]);
  console.log("FileUploadComponent is getting rendered");
  const { userId, authenticationToken } = useAuthStore();
  const { selectedUser, setOpenFileUploadedSectionFalse, messages, setMessages } = useChatStore();

  const uploadAllFiles = async () => {
    if (files.length === 0) return;

    // Create a single FormData for all files
    const formData = new FormData();
    files.forEach((uploadFile) => {
      formData.append("files", uploadFile.file);
    });
    formData.append("sender_id", userId || "");
    formData.append("receiver_id", selectedUser || "");

    try {
      console.log("Uploading files:", files.map((f) => f.file.name).join(", "));
      // Make a single request with all files
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/users/fileUpload`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${authenticationToken}`,
            "Content-Type": "multipart/form-data" 
          },
          onUploadProgress: (ProgressEvent) => {
            const percent = ProgressEvent.total ? Math.round((ProgressEvent.loaded * 100) / ProgressEvent.total) : 0;
            // Update progress for all files simultaneously
            setFiles((prev) => prev.map((f) => ({ ...f, progress: percent })));
          },
        }
      );
      //avoid duplicates
      console.log("File Upload Response", response.data);
      const newMessages = response.data.messages;
      // Mark all files as uploaded on success
      setFiles((prev) => prev.map((f) => ({ ...f, uploaded: true })));
      setMessages(newMessages);
      setTimeout(() => {
        setOpenFileUploadedSectionFalse();
      }, 4000)
    } catch (error) {
      console.error("Upload failed:", error);
      // Mark all files with error
      setFiles((prev) => prev.map((f) => ({ ...f, error: "Upload failed" })));
    }
  };

  const handleFiles = (selectedFiles: FileList | null) => {
    console.log("Selected files:", selectedFiles);
    if (!selectedFiles) return;
    const fileArray = Array.from(selectedFiles);

    // Calculate total size including existing files
    const existingFilesSize = files.reduce((acc, file) => acc + file.file.size, 0);
    const newFilesSize = fileArray.reduce((acc, file) => acc + file.size, 0);
    const totalSize = existingFilesSize + newFilesSize;

    if (totalSize > MAX_TOTAL_SIZE) {
      alert(`Total file size exceeds ${MAX_TOTAL_SIZE / (1024 * 1024)}MB.`);
      return;
    }

    const newUploads: UploadFile[] = fileArray.map((file) => ({
      file,
      progress: 0,
      uploaded: false,
      error: null,
    }));

    setFiles((prev) => [...prev, ...newUploads]);
  };

  const removeFile = (targetFile: File) => {
    setFiles((prev) => prev.filter((f) => f.file !== targetFile));
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
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering the parent div's onClick
            fileInputRef.current?.click();
            console.log("Upload button clicked");
          }}
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

        {files.length > 0 && (
          <>
            <div className="w-full mt-6 space-y-4">
              {files.map((f, idx) => (
                <div key={idx} className="bg-gray-800 rounded p-2 relative">
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
                  {!f.uploaded && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the parent div's onClick
                        removeFile(f.file);
                      }}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-6"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the parent div's onClick
                uploadAllFiles();
              }}
            >
              Send
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUploadComponent;
