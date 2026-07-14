import {useCallback, useState} from 'react';

import MovieSearchAutocomplete from './MovieSearchAutocomplete';
import PersonSearchAutocomplete from './PersonSearchAutocomplete';

import type {Movie, Person} from '../types/tmdb';
import './ChainRow.css';


type Props = {
    chain: [Movie | null, Person | null];
    addRow?: () => void,
    removeRow?: () => void,
    updateChains: (chain: [Movie | null, Person | null]) => void;
    fromActor?: Person;
    targetActorId: number;
}

export default ({addRow, chain, updateChains, fromActor, removeRow, targetActorId}: Props) => {
    const [movie, person] = chain;

    const updateChain = useCallback((item: {movie: Movie | null} | {person: Person | null}) => {
        if ('movie' in item) {
            updateChains([item.movie, chain[1]])
        } else {
            updateChains([chain[0], item.person])
        }
    }, [chain, updateChains]);

    return (
        <div className='chain-row'>
            <span>{fromActor ? fromActor.name : 'Who'} was in</span>
            {movie ? movie.title : <MovieSearchAutocomplete onSelect={(movie) => updateChain({movie})} />}
            <span>with</span>
            {person ? person.name : <PersonSearchAutocomplete onSelect={(person) => updateChain({person})} />}
            {addRow && <button disabled={person?.id === targetActorId} onClick={addRow}>+</button>}
            {removeRow && <button onClick={removeRow}>-</button>}
        </div>
    )
}