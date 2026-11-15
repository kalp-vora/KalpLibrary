import { useEffect, useCallback } from "react";

interface UseModalDismissOptions {
  isOpen: boolean;
  onClose: () => void;
  closeOnEsc?: boolean;
  closeOnBackdrop?: boolean;
  lockScroll?: boolean;
}

/**
 * Reusable modal interaction hook providing:
 * 1. Escape key dismissal
 * 2. Background scroll lock (with scrollbar jump prevention)
 * 3. Outside backdrop click & touch dismiss handling
 */
export function useModalDismiss({
  isOpen,
  onClose,
  closeOnEsc = true,
  closeOnBackdrop = true,
  lockScroll = true,
}: UseModalDismissOptions) {
  // ESC key dismissal
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeOnEsc, onClose]);

  // Lock background scrolling while modal is active
  useEffect(() => {
    if (!isOpen || !lockScroll) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Compensate for scrollbar width to prevent desktop layout jump
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen, lockScroll]);

  // Outside click & tap handler
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!closeOnBackdrop) return;
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [closeOnBackdrop, onClose]
  );

  return {
    handleBackdropClick,
  };
}
