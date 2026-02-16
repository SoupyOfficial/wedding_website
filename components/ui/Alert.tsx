interface AlertProps {
  type: "success" | "error" | "warning" | "info";
  message: string;
  className?: string;
}

const styles = {
  success: "bg-green-900/30 border-green-500/30 text-green-300",
  error: "bg-red-900/30 border-red-500/30 text-red-300",
  warning: "bg-amber-900/30 border-amber-500/30 text-amber-300",
  info: "bg-blue-900/30 border-blue-500/30 text-blue-300",
};

export default function Alert({ type, message, className = "" }: AlertProps) {
  return (
    <div className={`p-3 border rounded-lg text-sm ${styles[type]} ${className}`}>
      {message}
    </div>
  );
}
