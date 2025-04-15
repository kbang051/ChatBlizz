import { useState } from "react";
import axios, { AxiosProgressEvent } from "axios";

interface UploadResponse {
  fileUrl: string;
  message?: string;
}

type uploadStatus = "idle" | "uploading" | "success" | "error";

const useFileUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<uploadStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (file: File | null) => {
    if (!file) {
      alert("Please select a file.");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      alert("File size exceeds 20MB limit.");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async (): Promise<UploadResponse | void> => {
    if (!selectedFile) {
      alert("Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      setUploadStatus("uploading");

      const response = await axios.post(
        "http://localhost:8000/api/v1/users/fileUpload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total ?? 1)
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      setUploadStatus("success");
      return response.data;
    } catch (error: any) {
      setUploadStatus("error");
      console.error("Upload error:", error);
      alert("Upload failed: " + (error.response?.data?.error || error.message));
    }
  };

  return { selectedFile, previewUrl, uploadStatus, uploadProgress, handleFileChange, handleUpload };
};

export default useFileUpload;
