import {
  Sheet as SheetPrimitive,
  SheetTrigger as SheetTriggerPrimitive,
  SheetOverlay as SheetOverlayPrimitive,
  SheetClose as SheetClosePrimitive,
  SheetPortal as SheetPortalPrimitive,
  SheetContent as SheetContentPrimitive,
  SheetHeader as SheetHeaderPrimitive,
  SheetFooter as SheetFooterPrimitive,
  SheetTitle as SheetTitlePrimitive,
  SheetDescription as SheetDescriptionPrimitive,
  type SheetProps as SheetPrimitiveProps,
  type SheetTriggerProps as SheetTriggerPrimitiveProps,
  type SheetOverlayProps as SheetOverlayPrimitiveProps,
  type SheetCloseProps as SheetClosePrimitiveProps,
  type SheetContentProps as SheetContentPrimitiveProps,
  type SheetHeaderProps as SheetHeaderPrimitiveProps,
  type SheetFooterProps as SheetFooterPrimitiveProps,
  type SheetTitleProps as SheetTitlePrimitiveProps,
  type SheetDescriptionProps as SheetDescriptionPrimitiveProps,
} from "@/components/animate-ui/primitives/radix/sheet";
import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";

type SheetProps = SheetPrimitiveProps;

function Sheet(props: SheetProps) {
  return <SheetPrimitive {...props} />;
}

type SheetTriggerProps = SheetTriggerPrimitiveProps;

function SheetTrigger(props: SheetTriggerProps) {
  return <SheetTriggerPrimitive {...props} />;
}

type SheetOverlayProps = SheetOverlayPrimitiveProps;

function SheetOverlay({ className, ...props }: SheetOverlayProps) {
  return (
    <SheetOverlayPrimitive
      className={cn(
        "fixed inset-0 z-50 bg-black/70 backdrop-blur-sm",
        className
      )}
      {...props}
    />
  );
}

type SheetCloseProps = SheetClosePrimitiveProps;

function SheetClose(props: SheetCloseProps) {
  return <SheetClosePrimitive {...props} />;
}

type SheetContentProps = SheetContentPrimitiveProps & {
  showCloseButton?: boolean;
};

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: SheetContentProps) {
  return (
    <SheetPortalPrimitive>
      <SheetOverlay />
      <SheetContentPrimitive
        className={cn(
          "bg-white dark:bg-gray-900 fixed z-50 flex flex-col shadow-2xl",
          side === "right" &&
            "inset-y-0 right-0 h-full w-full sm:max-w-xl md:max-w-2xl border-l border-gray-200",
          side === "left" &&
            "inset-y-0 left-0 h-full w-full sm:max-w-xl md:max-w-2xl border-r border-gray-200",
          side === "top" && "top-0 w-full h-[350px] border-b border-gray-200",
          side === "bottom" &&
            "bottom-0 w-full h-[350px] border-t border-gray-200",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetClose className="absolute top-6 right-6 rounded-full p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors z-50">
            <XIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            <span className="sr-only">Close</span>
          </SheetClose>
        )}
      </SheetContentPrimitive>
    </SheetPortalPrimitive>
  );
}

type SheetHeaderProps = SheetHeaderPrimitiveProps;

function SheetHeader({ className, ...props }: SheetHeaderProps) {
  return (
    <SheetHeaderPrimitive
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  );
}

type SheetFooterProps = SheetFooterPrimitiveProps;

function SheetFooter({ className, ...props }: SheetFooterProps) {
  return (
    <SheetFooterPrimitive
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

type SheetTitleProps = SheetTitlePrimitiveProps;

function SheetTitle({ className, ...props }: SheetTitleProps) {
  return (
    <SheetTitlePrimitive
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  );
}

type SheetDescriptionProps = SheetDescriptionPrimitiveProps;

function SheetDescription({ className, ...props }: SheetDescriptionProps) {
  return (
    <SheetDescriptionPrimitive
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  type SheetProps,
  type SheetTriggerProps,
  type SheetCloseProps,
  type SheetContentProps,
  type SheetHeaderProps,
  type SheetFooterProps,
  type SheetTitleProps,
  type SheetDescriptionProps,
};
