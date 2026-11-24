import type { ReactNode } from 'react';

export function Field({
  label,
  htmlFor,
  hint,
  error,
  optional,
  children,
  className = '',
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`field ${error ? 'field--error' : ''} ${className}`}>
      <div className="field__label-row">
        <label className="field__label" htmlFor={htmlFor}>
          {label}
        </label>
        {optional && <span className="field__optional">Opcional</span>}
      </div>
      {children}
      {hint && !error && (
        <p className="field__hint" id={`${htmlFor}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field__error" id={`${htmlFor}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function FormSection({
  title,
  description,
  aside,
  children,
  id,
}: {
  title: string;
  description?: string;
  aside?: ReactNode;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section className="form-section" aria-labelledby={id}>
      <div className="form-section__head">
        <div>
          <h2 className="form-section__title" id={id}>
            {title}
          </h2>
          {description && <p className="form-section__description">{description}</p>}
        </div>
        {aside && <div className="form-section__aside">{aside}</div>}
      </div>
      <div className="form-section__body">{children}</div>
    </section>
  );
}
