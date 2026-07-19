import { useCallback, useEffect, useState } from "react";
import qs from "qs";

import fetchHandler from "../api/fetchHandler";
import type { Movie, Person } from "../types/tmdb";

interface SearchTypeMapping {
  person: Person;
  movie: Movie;
}

type Params<SearchType> = {
  query?: string;
  endpoint: {
    [K in keyof SearchTypeMapping]: SearchType extends SearchTypeMapping[K]
      ? K
      : never;
  }[keyof SearchTypeMapping];
};

type Return<SearchType> = {
  fetch: (query: string) => void;
  reset: () => void;
  results: SearchType[];
};

export default function useTmdbSearch<SearchType extends Movie | Person>({
  endpoint,
  query,
}: Params<SearchType>): Return<SearchType> {
  const [results, setResults] = useState<SearchType[]>([]);

  const reset = useCallback(() => {
    setResults([]);
  }, []);

  const fetch = useCallback((query: string) => {
    const _fetch = async (query: string) => {
      try {
        const response = await fetchHandler(
          `/api/tmdb/search/${endpoint}?${qs.stringify({ query })}`,
        );
        const data = await response.json();
        setResults(data.results ?? []);
      } catch (error) {
        console.error(error);
      }
    };

    _fetch(query);
  }, []);

  useEffect(() => {
    if (!query || query.length < 3) {
      return;
    }

    fetch(query);
  }, [fetch, query]);

  return { fetch, reset, results };
}
