"use client";

interface ConfirmButtonProps {
  onConfirm: () => void;
  message?: string;
  className?: string;
  children: React.ReactNode;
}

export default function ConfirmButton({
  onConfirm,
  message = "Are you sure?",
  className = "",
  children,
}: ConfirmButtonProps) {
  return (
    <button
      onClick={() => {
        if (confirm(message)) onConfirm();
      }}
      className={className}
    >
      {children}
    </button>
  );
}
