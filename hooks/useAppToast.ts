'use client';

import { useToast, type ToastProps } from '@heroui/react';
import type { ReactNode } from 'react';

export type AppToastType = 'success' | 'error' | 'warning' | 'info';

export interface AppToastOptions {
  type?: AppToastType;
  title: ReactNode;
  description?: ReactNode;
  duration?: number;
}

export function useAppToast() {
  const queuedToast = useToast({} as ToastProps);

  const showToast = ({
    type = 'info',
    title,
    description,
    duration = 4000,
  }: AppToastOptions) => {
    let color:
      | 'default'
      | 'primary'
      | 'secondary'
      | 'success'
      | 'warning'
      | 'danger' = 'primary';
    let icon: ReactNode = null;
    let classNames: Record<string, string> | undefined;

    switch (type) {
      case 'success':
        color = 'success';
        icon = '✅';
        classNames = {
          base: 'bg-emerald-900/85 border border-emerald-500/60',
          title: 'text-emerald-100 font-semibold',
          description: 'text-emerald-200 text-sm',
        };
        break;
      case 'error':
        color = 'danger';
        icon = '❌';
        classNames = {
          base: 'bg-rose-900/85 border border-rose-500/60',
          title: 'text-rose-100 font-semibold',
          description: 'text-rose-200 text-sm',
        };
        break;
      case 'warning':
        color = 'warning';
        icon = '⚠️';
        classNames = {
          base: 'bg-amber-900/85 border border-amber-500/60',
          title: 'text-amber-100 font-semibold',
          description: 'text-amber-200 text-sm',
        };
        break;
      case 'info':
      default:
        color = 'primary';
        icon = 'ℹ️';
        classNames = {
          base: 'bg-slate-900/85 border border-slate-700',
          title: 'text-slate-100 font-semibold',
          description: 'text-slate-300 text-sm',
        };
        break;
    }

    queuedToast.show({
      title,
      description,
      color,
      timeout: duration,
      classNames,
    });
  };

  return { showToast };
}
