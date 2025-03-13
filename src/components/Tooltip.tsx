"use client"

import * as React from "react";
import {
  useFloating,
  autoUpdate,
  offset as offsetMiddleware,
  flip,
  shift,
  useHover,
  useFocus,
  safePolygon,
  useDismiss,
  useRole,
  useInteractions,
  useMergeRefs,
  FloatingPortal,
  FloatingFocusManager,
} from "@floating-ui/react";
import type { Placement, OffsetOptions, UseHoverProps, UseRoleProps } from "@floating-ui/react";

interface TooltipOptions {
  initialOpen?: boolean;
  placement?: Placement;
  offset?: OffsetOptions;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  transform?: boolean,
  hoverProps?: UseHoverProps;
  role?: UseRoleProps['role'],
}

export const menuHoverProps = {
  delay: { open: 0, close: 240 },
  handleClose: safePolygon(),
};

export function useTooltip({
  initialOpen = false,
  placement = "top",
  offset,
  transform = true,
  hoverProps = {
    delay: { open: 0, close: 240 },
  },
  role = 'tooltip',
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: TooltipOptions = {}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(initialOpen);

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;

  const data = useFloating({
    placement,
    transform,
    open,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    middleware: [
      offsetMiddleware(offset),
      flip({
        crossAxis: placement.includes("-"),
        fallbackAxisSideDirection: "start",
        padding: 5
      }),
      shift({ padding: 5 })
    ]
  });

  const context = data.context;

  const hover = useHover(context, {
    move: false,
    restMs: 100,
    enabled: controlledOpen == null,
    ...hoverProps,
  });
  const focus = useFocus(context, {
    enabled: controlledOpen == null
  });
  const dismiss = useDismiss(context);
  const aRole = useRole(context, { role });

  const interactions = useInteractions([hover, focus, dismiss, aRole]);

  return React.useMemo(
    () => ({
      open,
      setOpen,
      ...interactions,
      ...data
    }),
    [open, setOpen, interactions, data]
  );
}

type ContextType = ReturnType<typeof useTooltip> | null;

const TooltipContext = React.createContext<ContextType>(null);

export const useTooltipContext = () => {
  const context = React.useContext(TooltipContext);

  if (context == null) {
    throw new Error("Tooltip components must be wrapped in <Tooltip />");
  }

  return context;
};

export function Tooltip({
  children,
  ...options
}: { children: React.ReactNode } & TooltipOptions) {
  // This can accept any props as options, e.g. `placement`,
  // or other positioning options.
  const tooltip = useTooltip(options);
  return (
    <TooltipContext.Provider value={tooltip}>
      {children}
    </TooltipContext.Provider>
  );
}

export const TooltipTrigger = React.forwardRef<
  HTMLElement,
  React.HTMLProps<HTMLElement> & { asChild?: boolean }
>(function TooltipTrigger({ children, asChild = true, ...props }, propRef) {
  const context = useTooltipContext();
  const childrenRef = (children as any).ref;
  const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef]);

  // `asChild` allows the user to pass any element as the anchor
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(
      children,
      context.getReferenceProps({
        ref,
        ...props,
        ...(typeof children.props === 'object' ? children.props : {}),
        ["data-state" as keyof typeof props]: context.open ? "open" : "closed"
      }) as React.HTMLProps<Element> & { "data-state"?: string }
    );
  }

  return (
    <button
      ref={ref}
      // The user can style the trigger based on the state
      data-state={context.open ? "open" : "closed"}
      {...context.getReferenceProps(props)}
    >
      {children}
    </button>
  );
});

export const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLProps<HTMLDivElement>
>(function TooltipContent({ style, ...props }, propRef) {
  const context = useTooltipContext();
  const ref = useMergeRefs([context.refs.setFloating, propRef]);

  if (!context.open) return null;

  return (
    <FloatingPortal>
      <div
        ref={ref}
        style={{
          ...context.floatingStyles,
          ...style
        }}
        {...context.getFloatingProps(props)}
      />
    </FloatingPortal>
  );
});

export const TooltipContentMenu = React.forwardRef<
  HTMLDivElement,
  React.HTMLProps<HTMLDivElement>
>(function TooltipContent({ style, ...props }, propRef) {
  const context = useTooltipContext();
  const ref = useMergeRefs([context.refs.setFloating, propRef]);
  const focusOptions = {
    context: context.context,
    initialFocus: -1,
    modal: false,
    closeOnFocusOut: true,
  };

  if (!context.open) return null;

  return (
    <FloatingPortal>
      <FloatingFocusManager {...focusOptions}>
        <div
          ref={ref}
          style={{
            ...context.floatingStyles,
            ...style
          }}
          {...context.getFloatingProps({
            role: 'menu',
            ...props
          })}
        />
      </FloatingFocusManager>
    </FloatingPortal>
  );
});
