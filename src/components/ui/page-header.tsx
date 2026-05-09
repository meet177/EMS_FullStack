import { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type PageHeaderProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
  badge?: string;
  children?: React.ReactNode;
};

export function PageHeader({ title, description, icon: Icon, badge, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div className="flex flex-col">
        {badge ? (
          <Badge variant="outline" className="mb-2 w-fit bg-card">
            {badge}
          </Badge>
        ) : null}
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      
      <div className="flex items-center gap-4">
        {children}
        {Icon ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
