import type { ReactNode } from 'react';

type SectionProps = {
  title?: string;
  hint?: string;
  children: ReactNode;
  danger?: boolean;
};

export function Section({ title, hint, children, danger = false }: SectionProps) {
  return (
    <section className={danger ? 'section section-danger' : 'section'}>
      {title && <h2>{title}</h2>}
      {hint && <p className="hint">{hint}</p>}
      {children}
    </section>
  );
}
