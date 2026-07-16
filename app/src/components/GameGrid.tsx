import {useCallback, useEffect, useMemo, useState} from 'react'
import useTmdbSearch from '../hooks/useTmdbSearch'
import ChainRow from './ChainRow';

import fetchHandler from '../api/fetchHandler';
import type {Movie, Person} from '../types/tmdb'
import type { SubmissionResponse } from '../types/responses';

function assertNonNull<T>(value: T | null, message: string): asserts value is T {
    if (value === null) {
        throw new Error(message);
    }
}

const targetActorId = 4724 // Kevin Bacon's TMDB id

type Chain = [Movie | null, Person | null];

export default () => {
    const [initialActor, setInitialActor] = useState<Person | null>(null)

    const {results} = useTmdbSearch<Person>({endpoint: 'person', query: 'Tom Cruise'})

    const [chains, setChains] = useState<Chain[]>([[null, null]]);
    const [submissionResult, setSubmissionResult] = useState<SubmissionResponse | null>(null)
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

    const [usedMovieIds, setUsedMovieIds] = useState<Set<number>>(new Set())
    const [usedPersonIds, setUsedPersonIds] = useState<Set<number>>(new Set())

    const handleUsedIds = useCallback((method: 'add' | 'delete', [movie, person]: Chain) => {
        if (movie?.id) {
            setUsedMovieIds(prev => {
                const updated = new Set(prev);
                updated[method](movie.id);
                return updated;
            })
        }
        if (person?.id) {
            setUsedPersonIds(prev => {
                const updated = new Set(prev);
                updated[method](person.id);
                return updated;
            })
        }
    }, []);

    const insertUsedIds = useCallback((chain: Chain) => handleUsedIds('add', chain), [handleUsedIds]);
    const removeUsedIds = useCallback((chain: Chain) => handleUsedIds('delete', chain), [handleUsedIds]);
    const updateUsedIds = useCallback((oldChain: Chain, newChain: Chain) => {
        removeUsedIds(oldChain);
        insertUsedIds(newChain);
    }, [removeUsedIds, insertUsedIds]);

    useEffect(() => {
        if (!results.length) {
            return
        }

        setInitialActor(results[0]);
        setUsedPersonIds(new Set([results[0].id]))
    }, [results])

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

    if (!initialActor) {
        return (
            <div>Loading game...</div>
        )
    }

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
            <button disabled={!canSubmit} onClick={onSubmit}>Submit</button>
            {
                submissionResult && (
                    <div>
                        {submissionResult.isValid ? 'Correct!' : 'Sorry, that isn\'t a valid link.'}
                    </div>
                )
            }

        </div>
    )
}