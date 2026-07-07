"use client";

import type React from "react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { CloudinaryImage as Image } from "@/components/ui/cloudinary-image";
import {
  IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_VIDEO_SIZE_BYTES,
  VIDEO_MIME_TYPES,
} from "@/lib/constants/media-upload";

export type MediaType = "image" | "video";

const IMAGE_MAX_SIZE_MB = MAX_IMAGE_SIZE_BYTES / (1024 * 1024);
const VIDEO_MAX_SIZE_MB = MAX_VIDEO_SIZE_BYTES / (1024 * 1024);

interface MediaUploaderProps {
  mediaType: MediaType;
  onMediaTypeChange: (mediaType: MediaType) => void;
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  disabled?: boolean;
  folder?: string;
  className?: string;
  inputId?: string;
}

export function MediaUploader({
  mediaType,
  onMediaTypeChange,
  value,
  onChange,
  onRemove,
  disabled,
  folder = "trichome",
  className,
  inputId = "media-upload",
}: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validTypes =
    mediaType === "video" ? VIDEO_MIME_TYPES : IMAGE_MIME_TYPES;
  const maxSizeMB =
    mediaType === "video" ? VIDEO_MAX_SIZE_MB : IMAGE_MAX_SIZE_MB;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validTypes.includes(file.type)) {
      toast.error(
        mediaType === "video"
          ? "Please upload a valid video file (MP4, WEBM, or MOV)"
          : "Please upload a valid image file (JPG, PNG, GIF, or WEBP)",
      );
      return;
    }

    if (file.size > maxSizeMB * 1_000_000) {
      toast.error(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      onChange(result.secure_url);
      toast.success(
        mediaType === "video"
          ? "Video uploaded successfully"
          : "Image uploaded successfully",
      );
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        mediaType === "video"
          ? "Failed to upload video"
          : "Failed to upload image",
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    } else {
      onChange("");
    }
  };

  const handleTypeChange = (nextType: MediaType) => {
    if (nextType === mediaType) return;
    handleRemove();
    onMediaTypeChange(nextType);
  };

  return (
    <div className={`space-y-4 ${className ?? ""}`}>
      <div className="inline-flex rounded-lg border border-gray-200 p-1">
        <button
          type="button"
          onClick={() => handleTypeChange("image")}
          disabled={disabled}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            mediaType === "image"
              ? "bg-gray-900 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Image
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange("video")}
          disabled={disabled}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            mediaType === "video"
              ? "bg-gray-900 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Video
        </button>
      </div>

      <div className="flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept={validTypes.join(",")}
          onChange={handleFileChange}
          disabled={disabled || isUploading}
          className="hidden"
          id={inputId}
        />
        <label htmlFor={inputId}>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                Uploading...
              </span>
            ) : mediaType === "video" ? (
              "Upload Video"
            ) : (
              "Upload Image"
            )}
          </button>
        </label>

        {value && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Remove {mediaType === "video" ? "Video" : "Image"}
          </button>
        )}
      </div>

      {value && (
        <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-200 bg-black">
          {mediaType === "video" ? (
            <video
              src={value}
              muted
              loop
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
          ) : (
            <Image
              src={value}
              alt="Uploaded image"
              fill
              sizes="(max-width: 640px) 100vw, 600px"
              className="object-contain"
            />
          )}
        </div>
      )}

      <p className="text-xs text-gray-500">
        {mediaType === "video"
          ? `Supported formats: MP4, WEBM, MOV. Max size: ${maxSizeMB}MB. Use a short, looping clip for best performance.`
          : `Supported formats: JPG, PNG, GIF, WEBP. Max size: ${maxSizeMB}MB.`}
      </p>
    </div>
  );
}
