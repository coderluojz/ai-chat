'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { X } from 'lucide-react';

/**
 * 手动实现的 AlertDialog 组件，不依赖外部 @radix-ui/react-alert-dialog 模块
 * 以解决环境无法安装依赖导致的报错问题
 */

interface AlertDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const AlertDialogContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({
  open: false,
  setOpen: () => {},
});

const AlertDialog = ({ open: controlledOpen, onOpenChange, children }: AlertDialogProps) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen ?? internalOpen;
  
  const setOpen = React.useCallback((val: boolean) => {
    if (onOpenChange) onOpenChange(val);
    setInternalOpen(val);
  }, [onOpenChange]);

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <AlertDialogContext.Provider value={{ open, setOpen }}>
      {children}
    </AlertDialogContext.Provider>
  );
};

const AlertDialogTrigger = ({ children, asChild, ...props }: any) => {
  const { setOpen } = React.useContext(AlertDialogContext);
  return (
    <div onClick={() => setOpen(true)} className="inline-block cursor-pointer" {...props}>
      {children}
    </div>
  );
};

const AlertDialogPortal = ({ children }: { children: React.ReactNode }) => {
  const { open } = React.useContext(AlertDialogContext);
  if (typeof document === 'undefined' || !open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {children}
    </div>
  );
};

const AlertDialogOverlay = ({ className }: { className?: string }) => {
  const { setOpen } = React.useContext(AlertDialogContext);
  return (
    <div 
      className={cn("fixed inset-0 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-200", className)} 
      onClick={() => setOpen(false)}
    />
  );
};

const AlertDialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { open } = React.useContext(AlertDialogContext);
    if (!open) return null;

    return (
      <AlertDialogPortal>
        <AlertDialogOverlay />
        <div
          ref={ref}
          className={cn(
            "relative z-[101] grid w-full max-w-lg gap-4 border bg-background p-6 shadow-2xl animate-in zoom-in-95 fade-in duration-200 sm:rounded-2xl",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </AlertDialogPortal>
    );
  }
);
AlertDialogContent.displayName = "AlertDialogContent";

const AlertDialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
);
AlertDialogTitle.displayName = "AlertDialogTitle";

const AlertDialogDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props} />
);
AlertDialogDescription.displayName = "AlertDialogDescription";

interface AlertDialogActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

const AlertDialogAction = React.forwardRef<HTMLButtonElement, AlertDialogActionProps>(
  ({ className, onClick, variant = 'default', ...props }, ref) => {
    const { setOpen } = React.useContext(AlertDialogContext);
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant }), "cursor-pointer", className)}
        onClick={(e) => {
          setOpen(false);
          if (onClick) onClick(e);
        }}
        {...props}
      />
    );
  }
);
AlertDialogAction.displayName = "AlertDialogAction";

const AlertDialogCancel = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => {
    const { setOpen } = React.useContext(AlertDialogContext);
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant: 'outline' }), "mt-2 sm:mt-0", className)}
        onClick={() => setOpen(false)}
        {...props}
      />
    );
  }
);
AlertDialogCancel.displayName = "AlertDialogCancel";

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
