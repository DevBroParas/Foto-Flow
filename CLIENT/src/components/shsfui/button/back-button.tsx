import * as React from "react";
import { Button } from "@/components/ui/button";
import type { ButtonProps } from "@/components/ui/button";

import { ArrowLeft } from "lucide-react";
import {cn} from "@/lib/utils";

type BackButtonProps = ButtonProps & {
  iconSize?: number;
  iconStrokeWidth?: number;
};

const BackButton = React.forwardRef<HTMLButtonElement, BackButtonProps>(
  (props, ref) => {
    const {
      className,
      children = "Back",
      size = "lg",
      iconSize = 16,
      iconStrokeWidth = 2,
      ...restProps
    } = props;

    return (
      <Button
        ref={ref}
        variant="default"
        size={size}
        className={cn("group relative overflow-hidden", className)}
        {...restProps}
      >
        <span className="translate-x-2 transition-transform duration-300 group-hover:opacity-0">
          {children}
        </span>
        <span
          className="absolute inset-0 z-10 flex items-center justify-center bg-primary-foreground/15 w-1/4 transition-all duration-300 group-hover:w-full"
          aria-hidden="true"
        >
          <ArrowLeft
            className="opacity-60"
            size={iconSize}
            strokeWidth={iconStrokeWidth}
          />
        </span>
      </Button>
    );
  }
);

BackButton.displayName = "BackButton";

export {BackButton};
