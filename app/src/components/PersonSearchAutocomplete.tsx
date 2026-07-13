import { useCallback, useMemo, useState } from "react";

import useTmdbSearch from "../hooks/useTmdbSearch";
import PersonSearchEntry from "./PersonSearchEntry";
import BaseSearchAutocomplete from "./BaseSearchAutocomplete";
import type {Person} from '../types/tmdb';

type Props = {
    onSelect?: (person: Person | null) => void
}

export default ({onSelect}: Props) => {

    const [query, setQuery] = useState('');    
    const { reset, results } = useTmdbSearch<Person>({ endpoint: 'person', query })

    const [primaryResults, 
        // nonActorResults, obscureResults
    ] = useMemo(() => {
        const primaryResults = [], nonActorResults = [], obscureResults = [];

        for (const result of results) {
            if (result.popularity < 0.5) {
                obscureResults.push(result)
            }

            else if (result.known_for_department !== 'Acting') {
                nonActorResults.push(result)
            }

            else {
                primaryResults.push(result)
            }
        }

        return [primaryResults, nonActorResults, obscureResults]
    }, [results]);

    const formatSelection = useCallback((person: Person) => person.name, []);

    return (
        <BaseSearchAutocomplete
            query={query}
            setQuery={setQuery}
            reset={reset}
            results={primaryResults}
            onSelect={onSelect}
            formatSelection={formatSelection}
            searchEntryComponent={PersonSearchEntry}
        />
    )
}