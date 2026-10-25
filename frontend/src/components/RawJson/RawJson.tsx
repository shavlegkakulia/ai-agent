type RawJsonProps = {
  data: unknown;
};

export function RawJson({ data }: RawJsonProps) {
  return (
    <details className="raw-json">
      <summary>Raw API Response</summary>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </details>
  );
}
