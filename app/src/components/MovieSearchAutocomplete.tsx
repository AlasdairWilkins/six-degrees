import { useCallback, useMemo, useState } from "react";

import useTmdbMovieSearch from "../hooks/useTmdbSearch";
import BaseSearchAutocomplete from "./BaseSearchAutocomplete";
import type { Movie } from "../types/tmdb";
import type { SearchAutocompleteProps } from "../types/sharedProps";

export default (baseAutoCompleteProps: SearchAutocompleteProps<Movie>) => {
  const [query, setQuery] = useState("");
  const { reset, results } = useTmdbMovieSearch<Movie>({
    endpoint: "movie",
    query,
  });

  const [
    primaryResults,
    // obscureResults
  ] = useMemo(() => {
    const primaryResults = [],
      obscureResults = [];

    for (const result of results) {
      if (result.popularity < 0.5) {
        obscureResults.push(result);
      } else {
        primaryResults.push(result);
      }
    }

    return [primaryResults, obscureResults];
  }, [results]);

  const formatSelection = useCallback((movie: Movie) => movie.title, []);

  const formatSearchEntry = useCallback((movie: Movie) => {
    const getReleaseDate = (movie: Movie) => {
      if (!movie.release_date || movie.release_date.length < 4) {
        return "No known release date";
      }

      return movie.release_date.slice(0, 4);
    };

    return `${movie.title} (${getReleaseDate(movie)})`;
  }, []);

  return (
    <BaseSearchAutocomplete
      {...baseAutoCompleteProps}
      query={query}
      setQuery={setQuery}
      reset={reset}
      results={primaryResults}
      formatSelection={formatSelection}
      formatSearchEntry={formatSearchEntry}
    />
  );
};
