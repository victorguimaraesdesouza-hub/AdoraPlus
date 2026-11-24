import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { Sheet } from './Sheet';

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((nextOptions) => {
    setOptions(nextOptions);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const close = useCallback((value: boolean) => {
    resolveRef.current?.(value);
    resolveRef.current = null;
    setOptions(null);
  }, []);

  const value = useMemo(() => confirm, [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <Sheet
        open={Boolean(options)}
        onClose={() => close(false)}
        title={options?.title ?? ''}
        description={options?.description}
        size="sm"
        footer={
          <>
            <button type="button" className="btn btn--ghost" onClick={() => close(false)}>
              {options?.cancelLabel ?? 'Cancelar'}
            </button>
            <button
              type="button"
              className={`btn ${options?.tone === 'danger' ? 'btn--danger' : 'btn--primary'}`}
              onClick={() => close(true)}
              data-autofocus
            >
              {options?.confirmLabel ?? 'Confirmar'}
            </button>
          </>
        }
      >
        <p className="confirm-note">
          {options?.tone === 'danger'
            ? 'Esta ação não pode ser desfeita.'
            : 'Revise os detalhes antes de confirmar.'}
        </p>
      </Sheet>
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('useConfirm must be used inside ConfirmProvider');
  return context;
}
