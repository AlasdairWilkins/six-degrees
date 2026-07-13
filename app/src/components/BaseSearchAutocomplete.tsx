import React, { useCallback, useState } from "react";

import type {Movie, Person} from '../types/tmdb';
import type { SearchEntryProps } from "../types/sharedProps";

import './BaseSearchAutocomplete.css';

type Props<SearchType> = {
    query: string,
    setQuery: (query: string) => void;
    reset: () => void;
    results: SearchType[];
    onSelect?: (selection: SearchType | null) => void
    formatSelection: (selection: SearchType) => string
    searchEntryComponent: React.ComponentType<SearchEntryProps<SearchType>>;
}

export default function BaseSearchAutocomplete<SearchType extends Movie | Person> ({
    query,
    setQuery,
    onSelect: onSelectProp,
    reset,
    results,
    formatSelection,
    searchEntryComponent: SearchEntry,
}: Props<SearchType>) {
    const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value)
    }, []);

    const [selection, setSelection] = useState<SearchType | null>(null);

    const onSelect = useCallback((selection: SearchType | null) => {
        reset();
        setQuery('');
        setSelection(selection);
        onSelectProp && onSelectProp(selection);
    }, []);


    if (selection) {
        return <div><span>{formatSelection(selection)}</span>{' '}<button onClick={() => onSelect(null)}>X</button></div>
    }


    return (
        <div className='person-search'>
            <input
                value={query}
                onChange={onChange}
            />
            <ul>
                {
                results.map(result => (
                    <SearchEntry key={result.id} onSelect={onSelect} result={result} />
                )
                )
            }
            </ul>
        </div>
    )
}