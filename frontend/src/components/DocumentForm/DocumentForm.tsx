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
      <label className="form-field">
        <span className="form-label">Title</span>
        <input
          className="form-control"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>
      <label className="form-field">
        <span className="form-label">Content</span>
        <textarea
          className="form-control"
          rows={12}
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
      </label>
      <label className="form-field">
        <span className="form-label">Split strategy</span>
        <select
          className="form-control form-control-short"
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
        <span className="form-help">
          Values match the backend SplitStrategy enum: none, recursive,
          semantic. The document record does not store the strategy, so edits
          default to recursive unless you change it.
        </span>
      </label>
      {formError && <div className="api-error">{formError}</div>}
      <div className="form-actions">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
