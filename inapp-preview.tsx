'use client';

import { useMemo } from 'react';
import {
  IconBell,
  IconAlertTriangle,
  IconAlertOctagon,
  IconAlertCircle,
  IconInfoCircle,
  IconX,
  IconMapPin,
  IconDroplet,
  IconClock
} from '@tabler/icons-react';

interface InAppPreviewProps {
  title: string | null;
  body: string | null;
}

type Severity = 'critical' | 'warning' | 'caution' | 'info';

const SEVERITY_CONFIG: Record<
  Severity,
  {
    bg: string;
    border: string;
    icon: typeof IconAlertTriangle;
    iconColor: string;
    label: string;
    badgeBg: string;
  }
> = {
  critical: {
    bg: 'bg-red-50 dark:bg-red-950/40',
    border: 'border-red-200 dark:border-red-800',
    icon: IconAlertOctagon,
    iconColor: 'text-red-500',
    label: 'CRITICAL',
    badgeBg: 'bg-red-500'
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-800',
    icon: IconAlertTriangle,
    iconColor: 'text-amber-500',
    label: 'WARNING',
    badgeBg: 'bg-amber-500'
  },
  caution: {
    bg: 'bg-yellow-50 dark:bg-yellow-950/40',
    border: 'border-yellow-200 dark:border-yellow-800',
    icon: IconAlertCircle,
    iconColor: 'text-yellow-500',
    label: 'CAUTION',
    badgeBg: 'bg-yellow-500'
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-800',
    icon: IconInfoCircle,
    iconColor: 'text-blue-500',
    label: 'INFO',
    badgeBg: 'bg-blue-500'
  }
};

function parseSeverityFromTitle(title: string): Severity {
  const upper = title.toUpperCase();
  if (upper.includes('CRITICAL') || upper.includes('NGUY HIỂM'))
    return 'critical';
  if (upper.includes('WARNING') || upper.includes('CẢNH BÁO')) return 'warning';
  if (upper.includes('CAUTION') || upper.includes('CHÚ Ý')) return 'caution';
  return 'info';
}

export function InAppPreview({ title, body }: InAppPreviewProps) {
  const severity = useMemo(() => parseSeverityFromTitle(title ?? ''), [title]);
  const config = SEVERITY_CONFIG[severity];
  const SeverityIcon = config.icon;

  return (
    <div className='flex flex-col items-center py-4'>
      {/* Phone Frame */}
      <div className='relative h-[480px] w-72 overflow-hidden rounded-[3rem] border-[8px] border-slate-800 bg-slate-100 shadow-2xl dark:border-slate-700 dark:bg-slate-900'>
        {/* Notch */}
        <div className='absolute top-0 left-1/2 z-20 h-6 w-24 -translate-x-1/2 rounded-b-2xl bg-slate-800' />

        {/* Simulated App Screen Background */}
        <div className='absolute inset-0 bg-gradient-to-b from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-900'>
          {/* Fake status bar */}
          <div className='flex items-center justify-between px-8 pt-8 pb-2'>
            <span className='text-[8px] font-medium text-slate-500'>9:41</span>
            <div className='flex gap-1'>
              <div className='h-1.5 w-3 rounded-sm bg-slate-400/50' />
              <div className='h-1.5 w-3 rounded-sm bg-slate-400/50' />
              <div className='h-1.5 w-3 rounded-sm bg-slate-400/30' />
            </div>
          </div>

          {/* Fake app content (map-like placeholder) */}
          <div className='mx-4 mt-2 flex items-center gap-2 rounded-xl bg-white/80 px-3 py-2 shadow-sm dark:bg-slate-800/80'>
            <IconMapPin className='size-4 text-blue-500' />
            <span className='text-[9px] font-medium text-slate-600 dark:text-slate-300'>
              FDA Monitoring Dashboard
            </span>
          </div>
          <div className='mx-4 mt-3 grid grid-cols-2 gap-2'>
            <div className='flex items-center gap-1.5 rounded-lg bg-white/60 p-2 dark:bg-slate-800/60'>
              <IconDroplet className='size-3 text-blue-400' />
              <div>
                <div className='text-[7px] text-slate-400'>Mực nước</div>
                <div className='text-[9px] font-bold text-slate-700 dark:text-slate-200'>
                  4.12m
                </div>
              </div>
            </div>
            <div className='flex items-center gap-1.5 rounded-lg bg-white/60 p-2 dark:bg-slate-800/60'>
              <IconClock className='size-3 text-slate-400' />
              <div>
                <div className='text-[7px] text-slate-400'>Cập nhật</div>
                <div className='text-[9px] font-bold text-slate-700 dark:text-slate-200'>
                  08:30
                </div>
              </div>
            </div>
          </div>
          {/* Fake map area */}
          <div className='mx-4 mt-3 h-32 rounded-xl bg-blue-100/50 dark:bg-blue-900/20' />
        </div>

        {/* ─── InApp Notification Banner (overlay) ─── */}
        {title || body ? (
          <div className='animate-in slide-in-from-top absolute top-8 right-3 left-3 z-10 duration-300'>
            <div
              className={`rounded-2xl border ${config.border} ${config.bg} p-3 shadow-xl backdrop-blur-lg`}
            >
              {/* Banner Header */}
              <div className='mb-1.5 flex items-center gap-2'>
                <div
                  className={`flex size-5 items-center justify-center rounded-md ${config.badgeBg}`}
                >
                  <SeverityIcon className='size-3 text-white' />
                </div>
                <span className='text-[9px] font-bold tracking-wider text-slate-500 uppercase'>
                  FDA {config.label}
                </span>
                <span className='ml-auto text-[9px] text-slate-400'>
                  Vừa xong
                </span>
                <IconX className='size-3 text-slate-400' />
              </div>

              {/* Title */}
              <h3 className='mb-0.5 text-[11px] font-bold text-slate-900 dark:text-white'>
                {title}
              </h3>

              {/* Body */}
              <p className='line-clamp-3 text-[10px] leading-relaxed text-slate-600 dark:text-slate-300'>
                {body}
              </p>

              {/* Auto-dismiss indicator */}
              <div className='mt-2 h-0.5 w-full overflow-hidden rounded-full bg-slate-200/60 dark:bg-slate-700/60'>
                <div
                  className={`h-full w-3/4 rounded-full ${config.badgeBg} opacity-60`}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className='absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/10'>
            <div className='mb-3 flex size-12 items-center justify-center rounded-full bg-white/80 shadow dark:bg-slate-800/80'>
              <IconBell className='size-6 text-slate-400' />
            </div>
            <p className='text-[10px] font-medium text-slate-500'>
              Click &quot;Generate Preview&quot; to see the in-app banner
            </p>
          </div>
        )}

        {/* Home Indicator */}
        <div className='absolute bottom-2 left-1/2 z-20 h-1 w-20 -translate-x-1/2 rounded-full bg-slate-400' />
      </div>

      {/* Info below phone */}
      {(title || body) && (
        <div className='mt-4 text-center font-mono text-[10px] text-slate-400'>
          Tự động ẩn sau 15 giây • Vuốt lên để tắt
        </div>
      )}
    </div>
  );
}
