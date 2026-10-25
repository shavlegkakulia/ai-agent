import { toApiError } from '../../api/errors';

type ApiErrorProps = {
  error: unknown;
  onRetry?: () => void;
};

export function ApiError({ error, onRetry }: ApiErrorProps) {
  if (!error) return null;
  const info = toApiError(error);

  return (
    <div className="api-error" role="alert">
      {info.status != null && <div>HTTP {info.status}</div>}
      <div>{info.message}</div>
      {info.endpoint && <div className="muted">{info.endpoint}</div>}
      {onRetry && (
        <button type="button" className="secondary" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
