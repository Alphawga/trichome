"use client";

import type { Content } from "@prisma/client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type MediaType, MediaUploader } from "@/components/ui/media-uploader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { CONTENT_TYPES } from "@/lib/constants/content-types";
import {
  HERO_SLIDE_PREVIEW_DEVICES,
  HERO_SLIDE_PREVIEW_MESSAGE_TYPE,
  HERO_SLIDE_PREVIEW_READY_MESSAGE_TYPE,
  type HeroSlidePreviewDevice,
} from "@/lib/constants/hero-preview";
import { trpc } from "@/utils/trpc";

interface HeroSlideFormSheetProps {
  slide: Content | null;
  nextSortOrder: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface HeroSlideFormData {
  title: string;
  description: string;
  button_text: string;
  button_link: string;
  sort_order: number;
  status: "DRAFT" | "PUBLISHED";
  image_url?: string;
  video_url?: string;
}

const DEFAULT_VALUES: HeroSlideFormData = {
  title: "",
  description: "",
  button_text: "Shop Now",
  button_link: "/products",
  sort_order: 0,
  status: "DRAFT",
  image_url: "",
  video_url: "",
};

export function HeroSlideFormSheet({
  slide,
  nextSortOrder,
  open,
  onOpenChange,
  onSuccess,
}: HeroSlideFormSheetProps) {
  const isEdit = !!slide;
  const [mediaType, setMediaType] = useState<MediaType>("image");
  const [device, setDevice] = useState<HeroSlidePreviewDevice>("desktop");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<HeroSlideFormData>({ defaultValues: DEFAULT_VALUES });

  const utils = trpc.useUtils();

  const createMutation = trpc.createContent.useMutation({
    onSuccess: () => {
      toast.success("Slide created successfully");
      utils.getHeroSlides.invalidate();
      utils.getContentByType.invalidate();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Failed to create slide: ${error.message}`);
    },
  });

  const updateMutation = trpc.updateContent.useMutation({
    onSuccess: () => {
      toast.success("Slide updated successfully");
      utils.getHeroSlides.invalidate();
      utils.getContentByType.invalidate();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Failed to update slide: ${error.message}`);
    },
  });

  useEffect(() => {
    if (slide) {
      setMediaType(slide.video_url ? "video" : "image");
      reset({
        title: slide.title,
        description: slide.description || "",
        button_text: slide.button_text || "",
        button_link: slide.button_link || "/products",
        sort_order: slide.sort_order,
        status: slide.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
        image_url: slide.image_url || "",
        video_url: slide.video_url || "",
      });
    } else {
      setMediaType("image");
      reset({ ...DEFAULT_VALUES, sort_order: nextSortOrder });
    }
  }, [slide, nextSortOrder, reset]);

  const onSubmit = async (data: HeroSlideFormData) => {
    const mediaUrl = mediaType === "image" ? data.image_url : data.video_url;
    if (!mediaUrl) {
      toast.error(
        mediaType === "video"
          ? "Upload a video before saving this slide"
          : "Upload an image before saving this slide",
      );
      return;
    }

    const payload = {
      title: data.title,
      description: data.description,
      button_text: data.button_text,
      button_link: data.button_link,
      sort_order: data.sort_order,
      status: data.status,
      // Only one media type is active at a time; clear the other so stale data isn't kept
      image_url: mediaType === "image" ? data.image_url : "",
      video_url: mediaType === "video" ? data.video_url : "",
    };

    if (isEdit && slide) {
      await updateMutation.mutateAsync({ id: slide.id, ...payload });
    } else {
      await createMutation.mutateAsync({
        type: CONTENT_TYPES.HOME_HERO,
        ...payload,
      });
    }
  };

  const title = watch("title");
  const description = watch("description");
  const buttonText = watch("button_text");
  const buttonLink = watch("button_link");
  const imageUrl = watch("image_url");
  const videoUrl = watch("video_url");
  const statusValue = watch("status");

  const postPreview = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        type: HERO_SLIDE_PREVIEW_MESSAGE_TYPE,
        slide: {
          title,
          description,
          buttonText,
          buttonLink,
          imageUrl: mediaType === "image" ? imageUrl : null,
          videoUrl: mediaType === "video" ? videoUrl : null,
        },
      },
      window.location.origin,
    );
  }, [
    title,
    description,
    buttonText,
    buttonLink,
    imageUrl,
    videoUrl,
    mediaType,
  ]);

  // Push the latest draft into the preview iframe whenever a relevant field changes
  useEffect(() => {
    const timeout = setTimeout(postPreview, 200);
    return () => clearTimeout(timeout);
  }, [postPreview]);

  useEffect(() => {
    const handleReady = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== HERO_SLIDE_PREVIEW_READY_MESSAGE_TYPE) return;
      postPreview();
    };
    window.addEventListener("message", handleReady);
    return () => window.removeEventListener("message", handleReady);
  }, [postPreview]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-5xl p-0 overflow-y-auto">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>
            {isEdit ? "Edit Hero Slide" : "Add Hero Slide"}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update this slide's content and media"
              : "Create a new slide for the homepage hero rotation"}
          </SheetDescription>
        </SheetHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-6 space-y-6 border-b lg:border-b-0 lg:border-r"
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-gray-700">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  {...register("title", { required: "Title is required" })}
                  className="mt-1"
                  placeholder="e.g., Natural Beauty, Naturally Yours"
                />
                {errors.title && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.title.message}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Use a line break for a two-line headline
                </p>
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-700">
                  Description
                </Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  className="mt-1"
                  rows={3}
                  placeholder="Supporting copy shown under the title"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="button_text" className="text-gray-700">
                    Button Text
                  </Label>
                  <Input
                    id="button_text"
                    {...register("button_text")}
                    className="mt-1"
                    placeholder="Shop Now"
                  />
                </div>
                <div>
                  <Label htmlFor="button_link" className="text-gray-700">
                    Button Link
                  </Label>
                  <Input
                    id="button_link"
                    {...register("button_link")}
                    className="mt-1"
                    placeholder="/products"
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-700">Background Media</Label>
                <MediaUploader
                  className="mt-1"
                  mediaType={mediaType}
                  onMediaTypeChange={(next) => {
                    setMediaType(next);
                    setValue(next === "image" ? "video_url" : "image_url", "");
                  }}
                  value={mediaType === "image" ? imageUrl : videoUrl}
                  onChange={(url) =>
                    setValue(
                      mediaType === "image" ? "image_url" : "video_url",
                      url,
                    )
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sort_order" className="text-gray-700">
                    Order
                  </Label>
                  <Input
                    id="sort_order"
                    type="number"
                    {...register("sort_order", { valueAsNumber: true })}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Lower numbers appear first in the rotation
                  </p>
                </div>
                <div>
                  <Label className="text-gray-700">Status</Label>
                  <Select
                    value={statusValue}
                    onValueChange={(value: "DRAFT" | "PUBLISHED") =>
                      setValue("status", value)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    {statusValue === "PUBLISHED"
                      ? "Live on the homepage now"
                      : "Hidden from the homepage until published"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-[#38761d] hover:bg-[#2d5a16] text-white"
              >
                {isSubmitting
                  ? "Saving..."
                  : isEdit
                    ? "Update Slide"
                    : "Create Slide"}
              </Button>
            </div>
          </form>

          <div className="p-6 space-y-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">
                Live Preview
              </h3>
              <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
                {(
                  Object.keys(
                    HERO_SLIDE_PREVIEW_DEVICES,
                  ) as HeroSlidePreviewDevice[]
                ).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setDevice(key)}
                    className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                      device === key
                        ? "bg-gray-900 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {HERO_SLIDE_PREVIEW_DEVICES[key].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-auto rounded-lg border border-gray-200 bg-white p-4">
              <iframe
                ref={iframeRef}
                src="/hero-slide-preview"
                title="Hero slide preview"
                style={{
                  width: HERO_SLIDE_PREVIEW_DEVICES[device].width,
                  height: HERO_SLIDE_PREVIEW_DEVICES[device].height,
                }}
                className="border border-gray-200 rounded mx-auto block"
                onLoad={postPreview}
              />
            </div>
            <p className="text-xs text-gray-500">
              This reflects your unsaved changes exactly as they'll render on
              the live site at this screen width.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
