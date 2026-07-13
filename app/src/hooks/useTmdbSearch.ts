import { useCallback, useEffect, useState } from "react";
import qs from "qs";

import fetchHandler from "../api/fetchHandler"
import type {Movie, Person} from '../types/tmdb';

interface SearchTypeMapping {
  person: Person;
  movie: Movie;
}

type Params<SearchType> = {
    query: string,
    endpoint:{
        [K in keyof SearchTypeMapping]: SearchType extends SearchTypeMapping[K] ? K : never;
    }[keyof SearchTypeMapping];
}


export default function useTmdbSearch<SearchType extends Movie | Person> ({ endpoint, query }: Params<SearchType>): {reset: () => void, results: SearchType[]} {
    const [results, setResults] = useState<SearchType[]>([]);

    const reset = useCallback(() => {
        setResults([])
    }, []);

    useEffect(() => {
        const fetchTmdbSearch = async (query: string) => {
            try {
                const response = await fetchHandler(`/api/tmdb/search/${endpoint}?${qs.stringify({ query })}`)
                 const data = await response.json();
                setResults(data.results ?? []);

            } catch (error) {
                console.error(error)
            }
        };

        if (query.length < 3) {
            return
        }
    
        fetchTmdbSearch(query)
    }, [query]);

    return { reset, results }
}