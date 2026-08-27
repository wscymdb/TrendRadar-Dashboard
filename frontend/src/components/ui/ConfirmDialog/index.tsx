import React from 'react';
import { AlertTriangle, Info, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = (props) => {
  const {
    open,
    title,
    description,
    confirmText = '确定',
    cancelText = '取消',
    variant = 'danger',
    onConfirm,
    onClose,
  } = props;

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                variant === 'danger'
                  ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                  : variant === 'warning'
                  ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
                  : 'bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'
              }`}
            >
              {variant === 'danger' ? (
                <Trash2 className="h-5 w-5" />
              ) : variant === 'warning' ? (
                <AlertTriangle className="h-5 w-5" />
              ) : (
                <Info className="h-5 w-5" />
              )}
            </div>
            <div>
              <DialogTitle className="text-sm font-semibold">{title}</DialogTitle>
              <DialogDescription className="text-xs mt-1 text-zinc-500 dark:text-zinc-400">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 text-xs text-zinc-600 dark:text-zinc-300"
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'destructive' : 'default'}
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`h-8 text-xs font-medium ${
              variant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : ''
            }`}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
