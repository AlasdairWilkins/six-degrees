import {useCallback, useMemo, useState} from 'react'
import type { Dispatch, SetStateAction } from 'react';
import ChainRow from './ChainRow';

import fetchHandler from '../api/fetchHandler';
import { useHandleUsedIds } from '../hooks/useHandleUsedIds';
import type {Movie, Person} from '../types/tmdb'
import type { SubmissionResponse } from '../types/responses';
import type { Chain, CompletedChain } from '../types/sharedProps';

function assertNonNull<T>(value: T | null, message: string): asserts value is T {
    if (value === null) {
        throw new Error(message);
    }
}


type Props = {
    initialActor: Person;
    targetActorId: number;
    completedChains: CompletedChain[],
    setCompletedChains: Dispatch<SetStateAction<CompletedChain[]>>
    reset: () => void;
}

export default ({initialActor, targetActorId, completedChains, setCompletedChains, reset}: Props) => {
    const [chains, setChains] = useState<Chain[]>([[null, null]]);
    const [submissionResult, setSubmissionResult] = useState<SubmissionResponse | null>(null)
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

    const {insertUsedIds, removeUsedIds, updateUsedIds, usedIds: {movie: usedMovieIds, person: usedPersonIds}} = useHandleUsedIds({initialActor, completedChains})

    const onSubmit = useCallback(() => {
        setIsSubmitted(true);

        type Payload = {
            links: {id: number, type: 'person' | 'movie'}[];
            initialActorId: number | undefined;
            targetActorId: number;
        }

        const submitHandler = async (payload: Payload) => {
            const response = await fetchHandler(
                '/api/validate-chain', 
                {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)}
            );
            const result: SubmissionResponse = await response.json();
            setSubmissionResult(result)
        }
        const links: Payload['links'] = [initialActor, ...chains.flat()]
            .map((entry, index) => {
                assertNonNull(entry, 'Cannot submit any chain with missing entries');

                return {
                    id: entry.id,
                    type: index % 2 === 0 ? 'person' : 'movie'
                }
            });

        const payload = {
            links,
            initialActorId: initialActor?.id,
            targetActorId
        }

        submitHandler(payload);
    }, [initialActor, chains])

    const onPlayAgain = useCallback(() => {
        assertNonNull(initialActor, 'Cannot complete a chain without an initial actor');

                const completedChain: CompletedChain = [
                    initialActor,
                    ...chains.map((chain): [Movie, Person] => {
                        const [movie, person] = chain;
                        assertNonNull(movie, 'Cannot complete a chain with a missing movie');
                        assertNonNull(person, 'Cannot complete a chain with a missing person');
                        return [movie, person];
                    })
                ];
                
                setCompletedChains(prev => [...prev, completedChain]);
    }, [initialActor, chains])

    const updateChain = useCallback((index: number, chain: Chain) => {
        const currentChain = chains[index];
        updateUsedIds(currentChain, chain);

        const start = chains.slice(0, index);
        const finish = chains.slice(index + 1);
        setChains([...start, chain, ...finish])
    }, [chains])

    const insertChain = useCallback((index: number, chain: Chain = [null, null]) => {
        insertUsedIds(chain);

        const start = chains.slice(0, index);
        const finish = chains.slice(index);
        setChains([...start, chain, ...finish])
    }, [chains])

    const removeChain = useCallback((index: number) => {
        const chain = chains[index];
        removeUsedIds(chain);

        const start = chains.slice(0, index);
        const finish = chains.slice(index + 1);
        setChains([...start, ...finish])
    }, [chains])
    
    const canSubmit = useMemo(() => {
        return chains.flat().every(value => !!value) && chains[chains.length - 1][1]?.id === targetActorId
    }, [chains])

    return (
        <div>
            {chains.map((chain, index) => {
                const fromActor = index === 0 ? initialActor : null
                return (
                    <ChainRow 
                        isSubmitted={isSubmitted}
                        key={index} 
                        chain={chain} 
                        invalidLinks={submissionResult?.invalidLinks ?? []}
                        updateChains={(chain) => updateChain(index, chain)} 
                        targetActorId={targetActorId}
                        usedMovieIds={usedMovieIds}
                        usedPersonIds={usedPersonIds}
                        {...fromActor ? {fromActor} : {}} 
                        {...chains.length < 6 ? {addRow: () => insertChain(index + 1)} : {}}
                        {...chains.length > 1 ? {removeRow: () => removeChain(index)} : {}}
                    />
                )
            })}
            {!isSubmitted && <button disabled={!canSubmit} onClick={onSubmit}>Submit</button>}
            {
                submissionResult && (
                    <div>
                        {submissionResult.isValid ? (
                            <>
                                <p>Correct!</p>
                                <button onClick={onPlayAgain}>Play again</button>
                                
                            </>
                            ) : (
                            <>
                                <p>Game over!</p>
                                <button onClick={reset}>New game</button>
                            </>
                            )
                        }
                    </div>
                )
            }

        </div>
    )
}