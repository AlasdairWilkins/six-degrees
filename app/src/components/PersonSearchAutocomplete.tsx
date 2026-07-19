import { useCallback, useMemo, useState } from "react";

import useTmdbSearch from "../hooks/useTmdbSearch";
import BaseSearchAutocomplete from "./BaseSearchAutocomplete";
import type {Person} from '../types/tmdb';
import type { SearchAutocompleteProps } from "../types/sharedProps";

export default (baseAutoCompleteProps: SearchAutocompleteProps<Person>) => {
    const [query, setQuery] = useState('');    
    const { reset, results } = useTmdbSearch<Person>({ endpoint: 'person', query })

    const [
        primaryResults, 
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

    const formatSearchEntry = useCallback((person: Person) => {
        const getKnownFor = (person: Person) => {
            const knownFor = person.known_for.find(knownFor => knownFor.media_type === 'movie' || knownFor.media_type === 'tv');

            if (!knownFor) {
                return 'No well-known movie or TV credits'
            }

            return knownFor.media_type === 'movie' ? knownFor.title : knownFor.name
        }

        return `${person.name} (${getKnownFor(person)})`;
    }, [])

    return (
        <BaseSearchAutocomplete
            {...baseAutoCompleteProps}
            query={query}
            setQuery={setQuery}
            reset={reset}
            results={primaryResults}
            formatSearchEntry={formatSearchEntry}
            formatSelection={formatSelection}
        />
    )
}