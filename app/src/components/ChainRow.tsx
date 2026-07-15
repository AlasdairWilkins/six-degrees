import {useCallback, useMemo} from 'react';

import MovieSearchAutocomplete from './MovieSearchAutocomplete';
import PersonSearchAutocomplete from './PersonSearchAutocomplete';

import type {Movie, Person} from '../types/tmdb';
import type { InvalidLink } from '../types/responses';

import './ChainRow.css';


type Props = {
    chain: [Movie | null, Person | null];
    addRow?: () => void,
    removeRow?: () => void,
    isSubmitted: boolean,
    updateChains: (chain: [Movie | null, Person | null]) => void;
    fromActor?: Person;
    targetActorId: number;
    invalidLinks: InvalidLink[];
}

export default ({addRow, chain, updateChains, isSubmitted, fromActor, invalidLinks, removeRow, targetActorId}: Props) => {
    const [movie, person] = chain;

    const invalidClasses = useMemo(() => {
        if (!isSubmitted) {
            return []
        }

        const relevantLinks = invalidLinks.filter(({movieId, personId}) => movie?.id === movieId || person?.id === personId);

        const fromActorInvalid = relevantLinks.some(({movieId, personId}) => movieId === movie?.id && person?.id !== personId);
        const movieInvalid = relevantLinks.some(({movieId}) => movieId === movie?.id)
        const toActorInvalid = relevantLinks.some(({personId}) => personId === person?.id)

        return [
            fromActorInvalid,
            movieInvalid,
            movieInvalid && toActorInvalid,
            toActorInvalid
        ].map(value => value ? 'invalid' : '')

    }, [invalidLinks, movie, person, fromActor])

    const updateChain = useCallback((item: {movie: Movie | null} | {person: Person | null}) => {
        if ('movie' in item) {
            updateChains([item.movie, chain[1]])
        } else {
            updateChains([chain[0], item.person])
        }
    }, [chain, updateChains]);


    if (isSubmitted) {
        return (
            <div className='chain-row'>
                <span className={invalidClasses[0]}>{fromActor ? fromActor.name : 'Who'} was in </span>
                <span className={invalidClasses[1]}>{movie?.title}</span>
                <span className={invalidClasses[2]}>{' '}with{' '}</span>
                <span className={invalidClasses[3]}>{person?.name}</span>
            </div>
        )
    }

    return (
        <div className='chain-row'>
            <span>{fromActor ? fromActor.name : 'Who'} was in</span>
            <span><MovieSearchAutocomplete value={movie} disabled={isSubmitted} onSelect={(movie) => updateChain({movie})} /></span>
            <span>with</span>
            <PersonSearchAutocomplete value={person} disabled={isSubmitted} onSelect={(person) => updateChain({person})} />
            {
                !isSubmitted && (
                    <>
                        {addRow && <button disabled={person?.id === targetActorId} onClick={addRow}>+</button>}
                        {removeRow && <button onClick={removeRow}>-</button>}
                    </>
                )
            }
            
        </div>
    )
}