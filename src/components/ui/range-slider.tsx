"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

interface RangeSliderProps {
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  onChange: (min: number, max: number) => void;
  step?: number;
  className?: string;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  minValue,
  maxValue,
  onChange,
  step = 1000,
  className = "",
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<"min" | "max" | null>(null);
  const [localMin, setLocalMin] = useState(minValue);
  const [localMax, setLocalMax] = useState(maxValue);

  useEffect(() => {
    setLocalMin(minValue);
    setLocalMax(maxValue);
  }, [minValue, maxValue]);

  const getPercentage = (value: number) => {
    return ((value - min) / (max - min)) * 100;
  };

  const getValueFromPercentage = useCallback(
    (percentage: number) => {
      const value = min + (percentage / 100) * (max - min);
      return Math.round(value / step) * step;
    },
    [min, max, step],
  );

  const handleMouseDown = useCallback((type: "min" | "max") => {
    setIsDragging(type);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const percentage = Math.max(
        0,
        Math.min(100, ((clientX - rect.left) / rect.width) * 100),
      );
      const value = getValueFromPercentage(percentage);

      if (isDragging === "min") {
        const newMin = Math.max(min, Math.min(value, localMax - step));
        setLocalMin(newMin);
        onChange(newMin, localMax);
      } else {
        const newMax = Math.min(max, Math.max(value, localMin + step));
        setLocalMax(newMax);
        onChange(localMin, newMax);
      }
    },
    [
      isDragging,
      localMin,
      localMax,
      min,
      max,
      step,
      onChange,
      getValueFromPercentage,
    ],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleMouseMove);
      document.addEventListener("touchend", handleTouchEnd);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleMouseMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchEnd]);

  const minPercentage = getPercentage(localMin);
  const maxPercentage = getPercentage(localMax);

  return (
    <div
      ref={sliderRef}
      className={`relative w-full h-1 bg-[#1E3024]/20 rounded-full ${className}`}
    >
      {/* Active range track */}
      <div
        className="absolute h-full bg-black rounded-full"
        style={{
          left: `${minPercentage}%`,
          width: `${maxPercentage - minPercentage}%`,
        }}
      />

      {/* Min handle */}
      <button
        type="button"
        className="absolute w-4 h-4 bg-black rounded-full cursor-pointer -translate-x-1/2 -translate-y-1/2 top-1/2 hover:scale-110 active:scale-105 transition-transform duration-150 ease-out shadow-md touch-none"
        style={{ left: `${minPercentage}%` }}
        onMouseDown={(e) => {
          e.preventDefault();
          handleMouseDown("min");
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          handleMouseDown("min");
        }}
        aria-label="Minimum value"
      />

      {/* Max handle */}
      <button
        type="button"
        className="absolute w-4 h-4 bg-black rounded-full cursor-pointer -translate-x-1/2 -translate-y-1/2 top-1/2 hover:scale-110 active:scale-105 transition-transform duration-150 ease-out shadow-md touch-none"
        style={{ left: `${maxPercentage}%` }}
        onMouseDown={(e) => {
          e.preventDefault();
          handleMouseDown("max");
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          handleMouseDown("max");
        }}
        aria-label="Maximum value"
      />
    </div>
  );
};
