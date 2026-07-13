import {useState} from 'react';

import MovieSearchAutocomplete from './MovieSearchAutocomplete';
import PersonSearchAutocomplete from './PersonSearchAutocomplete';

import type {Movie, Person} from '../types/tmdb';
import './ChainRow.css';


type Props = {
    fromActor?: Person;
    movie?: Movie;
    targetActorId: number;
    onClick: () => void;
}

export default ({fromActor, movie, targetActorId}: Props) => {
    const [toActor, setToActor] = useState<Person | null>(null);

    return (
        <div className='chain-row'>
            <span>{fromActor ? fromActor.name : 'Who was in'}</span>
            {movie ? movie.title : <MovieSearchAutocomplete />}
            <span>with</span>
            {toActor ? toActor.name : <PersonSearchAutocomplete onSelect={(person) => setToActor(person)} />}
            <button onClick={() => console.log('add row')}>+</button>
            <button disabled={targetActorId !== toActor?.id} onClick={() => console.log('submit')}>Submit</button>
        </div>
    )
}