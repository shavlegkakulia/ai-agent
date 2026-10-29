import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type PageHeaderProps = {
  title: string;
  hint?: string;
  backTo?: string;
  backLabel?: string;
  actions?: ReactNode;
};

export function PageHeader({
  title,
  hint,
  backTo,
  backLabel,
  actions,
}: PageHeaderProps) {
  return (
    <header className="page-header">
      {backTo && backLabel && (
        <Link className="page-back" to={backTo}>
          {backLabel}
        </Link>
      )}
      <div className="page-header-row">
        <div>
          <h1>{title}</h1>
          {hint && <p className="hint">{hint}</p>}
        </div>
        {actions}
      </div>
    </header>
  );
}
