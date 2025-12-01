"use client";

import { useState, useEffect, useCallback } from "react";

interface ImageItem {
  id: number;
  src: string;
  alt: string;
}

export function useLightbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [initialIndex, setInitialIndex] = useState(0);

  const open = useCallback((imageList: ImageItem[], startIndex: number = 0) => {
    setImages(imageList);
    setInitialIndex(startIndex);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return {
    isOpen,
    images,
    initialIndex,
    open,
    close,
  };
}
