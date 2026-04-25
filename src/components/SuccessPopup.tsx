"use client";

import { useEffect, useRef } from "react";

type SuccessPopupProps = {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onDownload?: () => void;
  downloadLabel?: string;
};

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" {...props}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export default function SuccessPopup({
  isOpen,
  title,
  message,
  onClose,
  onDownload,
  downloadLabel = "Download Output",
}: SuccessPopupProps) {
  const popupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    popupRef.current?.focus();

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="ui-success-overlay" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div ref={popupRef} tabIndex={-1} className="ui-success-popup overflow-hidden p-6 md:p-7" onClick={(event) => event.stopPropagation()}>
        <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/10 via-brand-pink/10 to-brand-sky/10" />
        <div className="relative z-10 space-y-5">
          <div className="flex items-center gap-4">
            <div className="ui-success-badge shrink-0 text-black">
              <span className="ui-success-confetti" />
              <span className="ui-success-confetti" />
              <span className="ui-success-confetti" />
              <span className="ui-success-confetti" />
              <CheckIcon className="ui-success-check h-8 w-8" />
            </div>
            <div>
              <h3 className="font-heading text-2xl font-bold text-white">{title}</h3>
              <p className="mt-1 text-sm text-white/75">{message}</p>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {onDownload && (
              <button className="ui-btn-primary" onClick={onDownload}>
                {downloadLabel}
              </button>
            )}
            <button className="ui-btn-secondary" onClick={onClose}>
              Continue Editing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
