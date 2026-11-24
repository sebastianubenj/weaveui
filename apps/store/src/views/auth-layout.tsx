import * as React from "react";

import { cn, FormAlert } from "@weaveui/ds";
import { Navigation } from "@weaveui/ds";
import { useAuth } from "@/lib/auth-context";

export interface AuthLayoutProps extends React.ComponentProps<"div"> {
  logoHref?: string;
  logoLabel?: string;
}

export function AuthLayout({
  children,
  className,
  logoHref = "#",
  logoLabel = "Home",
  ...props
}: AuthLayoutProps) {
  const { error } = useAuth();
  return (
    <div
      className={cn(
        "flex min-h-dvh w-full flex-col [background-color:var(--semantics-colors-background-page)]",
        className,
      )}
      {...props}
    >
      <Navigation appearance="empty" logoHref={logoHref} logoLabel={logoLabel} />
      <div
        className={`flex w-full flex-1 flex-col items-center
          px-(--semantics-layout-mobile-grid-margin)
          md:px-(--primitives-spacing-8)`}
      >
        <div className="flex w-full max-w-(--semantics-layout-desktop-content-max-width) flex-col items-center gap-(--primitives-spacing-4)">
          {error ? <FormAlert className="max-w-(--primitives-max-width-max-w-md)">{error}</FormAlert> : null}
          {children}
        </div>
      </div>
    </div>
  );
}
