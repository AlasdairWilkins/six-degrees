import React, { useCallback } from "react";

import type { Movie, Person } from '../types/tmdb';
import SearchEntry from "./SearchEntry";

import './BaseSearchAutocomplete.css';

type Props<SearchType> = {
    disabled: boolean;
    query: string;
    setQuery: (query: string) => void;
    reset: () => void;
    results: SearchType[];
    onSelect?: (selection: SearchType | null) => void
    formatSelection: (selection: SearchType) => string
    formatSearchEntry: (entry: SearchType) => string
    value: SearchType | null;
    usedIds: Set<number>;
}

export default function BaseSearchAutocomplete<SearchType extends Movie | Person>({
    query,
    setQuery,
    onSelect: onSelectProp,
    reset,
    results,
    formatSelection,
    formatSearchEntry,
    disabled,
    value,
    usedIds,
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
                        <SearchEntry 
                            key={result.id} 
                            disabled={usedIds.has(result.id)} 
                            onSelect={onSelect} 
                            entry={result} 
                            format={formatSearchEntry} 
                        />
                    ))
                }
            </ul>
        </div>
    )
}