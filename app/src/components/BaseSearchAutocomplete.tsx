import React, { useCallback } from "react";

import type {Movie, Person} from '../types/tmdb';
import type { SearchEntryProps } from "../types/sharedProps";

import './BaseSearchAutocomplete.css';

type Props<SearchType> = {
    disabled: boolean;
    query: string;
    setQuery: (query: string) => void;
    reset: () => void;
    results: SearchType[];
    onSelect?: (selection: SearchType | null) => void
    formatSelection: (selection: SearchType) => string
    searchEntryComponent: React.ComponentType<SearchEntryProps<SearchType>>;
    value: SearchType | null;
}

export default function BaseSearchAutocomplete<SearchType extends Movie | Person> ({
    query,
    setQuery,
    onSelect: onSelectProp,
    reset,
    results,
    formatSelection,
    searchEntryComponent: SearchEntry,
    disabled,
    value,
}: Props<SearchType>) {
    const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value)
    }, []);

    const onSelect = useCallback((selection: SearchType | null) => {
        reset();
        setQuery('');
        onSelectProp && onSelectProp(selection);
    }, [onSelectProp, reset]);

    if (value) {
        return <div>
            <span>{formatSelection(value)}</span>
            {!disabled && <>
                {' '}
                <button onClick={() => onSelect(null)}>X</button>
            </>}
        </div>
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