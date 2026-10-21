type SearchResult = {
  id: string;
  documentId: string;
  content: string;
};

type RankedResult = SearchResult & {
  rrfScore: number;
};

export function fuseSearchResults(
  vectorResults: SearchResult[],
  ftsResults: SearchResult[],
  limit = 5,
): RankedResult[] {
  const k = 60;

  const scores = new Map<string, RankedResult>();

  const addResults = (results: SearchResult[]) => {
    results.forEach((item, index) => {
      const rank = index + 1;

      const existing = scores.get(item.id);

      const rrfScore = 1 / (k + rank);

      if (existing) {
        existing.rrfScore += rrfScore;
      } else {
        scores.set(item.id, {
          ...item,
          rrfScore,
        });
      }
    });
  };

  addResults(vectorResults);
  addResults(ftsResults);

  return [...scores.values()]
    .sort((a, b) => b.rrfScore - a.rrfScore)
    .slice(0, limit);
}
