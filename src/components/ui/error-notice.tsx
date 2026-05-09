import { AlertCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ErrorNoticeProps = {
  title?: string;
  message: string;
  className?: string;
};

export function ErrorNotice({ title = "Live data unavailable", message, className }: ErrorNoticeProps) {
  return (
    <Card className={cn("border-destructive/20 bg-destructive/5", className)}>
      <CardContent className="flex gap-3 p-4 text-sm">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
        <div>
          <p className="font-medium text-destructive">{title}</p>
          <p className="mt-1 leading-5 text-muted-foreground">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}
