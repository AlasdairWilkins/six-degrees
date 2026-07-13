import {useMemo} from 'react'

import type {Person} from '../types/tmdb';
import type { SearchEntryProps } from '../types/sharedProps';

export default ({onSelect, result: person}: SearchEntryProps<Person>) => {
    const knownFor = useMemo(() => {
        const knownFor = person.known_for.find(knownFor => knownFor.media_type === 'movie' || knownFor.media_type === 'tv');

        if (!knownFor) {
            return 'No well-known movie or TV credits'
        }

        return knownFor.media_type === 'movie' ? knownFor.title : knownFor.name;
    }, [person.known_for])

    return (
        <li onClick={() => onSelect(person)}>
            {person.name} ({knownFor})
        </li>
    )
}