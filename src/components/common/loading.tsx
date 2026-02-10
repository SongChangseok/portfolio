import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  className?: string;
  message?: string;
}

export function Loading({ className, message }: LoadingProps) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center py-12", className)}
    >
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      {message && (
        <p className="mt-3 text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
}
