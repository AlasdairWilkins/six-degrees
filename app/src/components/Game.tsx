import { useEffect, useMemo, useState } from 'react';
import useTmdbSearch from '../hooks/useTmdbSearch'

import GameGrid from './GameGrid';

import type { Person } from '../types/tmdb';
import type { CompletedChain } from '../types/sharedProps'

type Props = {
    reset: () => void;
}

const targetActorId = 4724 // Kevin Bacon's TMDB id


export default function ({ reset }: Props) {
    const [completedChains, setCompletedChains] = useState<CompletedChain[]>([]);

    const { fetch, results } = useTmdbSearch<Person>({ endpoint: 'person' })

    const initialActorName = useMemo(() => {
        const initialActorNames = ['Tom Hollander', 'Tom Holland', 'Tom Hanks', 'Tom Hiddleston']

        return initialActorNames[(completedChains.length % initialActorNames.length)]
    }, [completedChains])

    const [initialActor, setInitialActor] = useState<Person | null>(null)

    useEffect(() => {
        setInitialActor(null)
        fetch(initialActorName)
    }, [fetch, initialActorName])

    useEffect(() => {
        if (!results.length) {
            return
        }

        setInitialActor(results[0]);
    }, [results])

    return (
        <div>
            {
                completedChains.map(([fromActor, ...chains], index) => {
                    return (
                        <div key={index}>
                            {
                                chains.map(([movie, person], index) => (
                                    <p key={index}>{index === 0 ? fromActor.name : 'Who'} was in {movie.title} with {person.name}</p>
                                ))
                            }
                        </div>
                    )
                })
            }
            {
                !initialActor ? (
                    <div>Loading game...</div>
                ) : (
                    <GameGrid
                        key={initialActorName}
                        initialActor={initialActor}
                        targetActorId={targetActorId}
                        reset={reset}
                        completedChains={completedChains}
                        setCompletedChains={setCompletedChains}
                    />
                )
            }
        </div>
    )
}