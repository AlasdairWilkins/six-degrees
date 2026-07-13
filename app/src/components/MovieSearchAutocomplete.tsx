import { useCallback, useMemo, useState } from "react";

import useTmdbMovieSearch from "../hooks/useTmdbSearch";
import MovieSearchEntry from "./MovieSearchEntry";
import BaseSearchAutocomplete from "./BaseSearchAutocomplete";
import type {Movie} from '../types/tmdb';

type Props = {
    onSelect?: (movie: Movie | null) => void
}

export default ({onSelect}: Props) => {
    const [query, setQuery] = useState('');    
    const { reset, results } = useTmdbMovieSearch<Movie>({ endpoint: 'movie', query })

    const [primaryResults, 
        // obscureResults
    ] = useMemo(() => {
        const primaryResults = [], obscureResults = [];

        for (const result of results) {
            if (result.popularity < 0.5) {
                obscureResults.push(result)
            }

            else {
                primaryResults.push(result)
            }
        }

        return [primaryResults, obscureResults]
    }, [results]);

    const formatSelection = useCallback((movie: Movie) => movie.title, []);


    return (
        <BaseSearchAutocomplete
            query={query}
            setQuery={setQuery}
            reset={reset}
            results={primaryResults}
            onSelect={onSelect}
            formatSelection={formatSelection}
            searchEntryComponent={MovieSearchEntry}
        />
    )
}