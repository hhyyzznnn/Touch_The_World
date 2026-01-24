"use client";

import { Inbox } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode | { label: string; href: string };
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      {icon || <Inbox className="w-16 h-16 mx-auto text-text-gray mb-4" />}
      <h3 className="text-lg font-semibold text-text-dark mb-2">{title}</h3>
      {description && <p className="text-text-gray mb-6">{description}</p>}
      {action && (
        <div>
          {typeof action === "object" && "label" in action && "href" in action ? (
            <Button asChild>
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ) : (
            action
          )}
        </div>
      )}
    </div>
  );
}
