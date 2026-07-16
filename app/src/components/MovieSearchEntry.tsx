import {useMemo} from 'react';

import type {Movie} from '../types/tmdb';
import type { SearchEntryProps } from '../types/sharedProps';

export default ({disabled, onSelect, result: movie}: SearchEntryProps<Movie>) => {
    const releaseDate = useMemo(() => {
        if (!movie.release_date || movie.release_date.length < 4) {
            return 'No known release date'
        }

        return movie.release_date.slice(0, 4)
    }, [movie.release_date])

    return (
        <li onClick={() => disabled ? console.log('disabled') : onSelect(movie)}>
            {movie.title} ({releaseDate})
        </li>
    )
}