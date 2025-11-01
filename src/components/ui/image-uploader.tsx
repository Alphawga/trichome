'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  disabled?: boolean;
  folder?: string;
}

export function ImageUploader({
  value,
  onChange,
  onRemove,
  disabled,
  folder = 'trichome',
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPG, PNG, GIF, or WEBP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5000000) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      onChange(result.secure_url);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    } else {
      onChange('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,image/jpg"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
          className="hidden"
          id="image-upload"
        />
        <label htmlFor="image-upload">
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
            ) : (
              'Upload Image'
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
            Remove Image
          </button>
        )}
      </div>

      {value && (
        <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-200">
          <Image
            src={value}
            alt="Uploaded image"
            fill
            className="object-contain"
          />
        </div>
      )}

      <p className="text-xs text-gray-500">
        Supported formats: JPG, PNG, GIF, WEBP. Max size: 5MB
      </p>
    </div>
  );
}
