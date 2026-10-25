type LoadingProps = {
  label?: string;
};

export function Loading({ label = 'Loading…' }: LoadingProps) {
  return <div className="loading">{label}</div>;
}
