import { useState, type FormEvent } from 'react';
import {
  SPLIT_STRATEGIES,
  type DocumentWriteRequest,
  type SplitStrategy,
} from '../../api/types/document';

type DocumentFormProps = {
  initialTitle?: string;
  initialContent?: string;
  initialSplitStrategy?: SplitStrategy;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (values: DocumentWriteRequest) => void;
};

export function DocumentForm({
  initialTitle = '',
  initialContent = '',
  initialSplitStrategy = 'recursive',
  submitLabel,
  isSubmitting,
  onSubmit,
}: DocumentFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [splitStrategy, setSplitStrategy] =
    useState<SplitStrategy>(initialSplitStrategy);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !content.trim()) {
      setFormError('Title and content are required.');
      return;
    }
    setFormError(null);
    onSubmit({ title, content, splitStrategy });
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label>
        Title
        <input value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>
      <label>
        Content
        <textarea
          rows={12}
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
      </label>
      <label>
        Split strategy
        <select
          value={splitStrategy}
          onChange={(event) =>
            setSplitStrategy(event.target.value as SplitStrategy)
          }
        >
          {SPLIT_STRATEGIES.map((strategy) => (
            <option key={strategy} value={strategy}>
              {strategy}
            </option>
          ))}
        </select>
      </label>
      <p className="hint">
        Values match the backend SplitStrategy enum: none, recursive, semantic.
        The document record does not store the strategy, so edits default to
        recursive unless you change it.
      </p>
      {formError && <div className="api-error">{formError}</div>}
      <div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
