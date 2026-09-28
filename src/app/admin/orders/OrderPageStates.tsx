import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoLoader } from "@/components/ui/logo-loader";

export function OrderLoadingState() {
  return (
    <div className="flex min-h-[420px] items-center justify-center">
      <LogoLoader size="md" text="Loading order..." />
    </div>
  );
}

interface OrderErrorStateProps {
  message: string;
  onBack: () => void;
}

export function OrderErrorState({ message, onBack }: OrderErrorStateProps) {
  return (
    <div className="flex min-h-[420px] items-center justify-center">
      <div className="max-w-md rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
        <p className="font-medium text-red-700">{message}</p>
        <Button variant="outline" className="mt-5" onClick={onBack}>
          <ArrowLeft aria-hidden="true" />
          Back to orders
        </Button>
      </div>
    </div>
  );
}
