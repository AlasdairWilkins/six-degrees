import {useMemo, useState} from 'react';

import GameGrid from './GameGrid';

import type {CompletedChain} from '../types/sharedProps'

type Props = {
    reset: () => void;
}

export default function ({reset}: Props) {
    const [completedChains, setCompletedChains] = useState<CompletedChain[]>([]);

    const initialActorName = useMemo(() => {
        const initialActorNames = ['Tom Hollander', 'Tom Holland', 'Tom Hanks', 'Tom Hiddleston']
        
        return initialActorNames[(completedChains.length % initialActorNames.length)]
    }, [completedChains])

    return (
        <div>
            {
                completedChains.map(([fromActor, ...chains], index) => {
                    return (
                        <div key={fromActor.id}>
                            {
                                chains.map(([movie, person], index) => (
                                    <p key={index}>{index === 0 ? fromActor.name : 'Who'} was in {movie.title} with {person.name}</p>
                                ))
                            }
                        </div>
                    )
                })
            }
            <GameGrid key={initialActorName} initialActorName={initialActorName} reset={reset} setCompletedChains={setCompletedChains}/>
        </div>
    )
}