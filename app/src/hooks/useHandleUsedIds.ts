import { useCallback, useState } from "react";

import type { Movie, Person } from "../types/tmdb";
import type { Chain, CompletedChain } from "../types/sharedProps";

type Entry<EntryType> = EntryType | null;

type NamedEntry<Name, EntryType> = [type: Name, ...Entry<EntryType>[]];

type HandleUsedIdBaseParams =
  NamedEntry<"movie", Movie> | NamedEntry<"person", Person>;
type HandleUsedIdParams = [method: "add" | "delete", ...HandleUsedIdBaseParams];

type GetUsedIdParams = {
  initialActor: Person;
  initialMovie?: Movie;
  completedChains: CompletedChain[];
};

type Params = GetUsedIdParams & { targetActorId: number };

const getUsedIds = ({
  initialActor,
  initialMovie,
  completedChains,
  targetActorId,
}: Params) => {
  const usedMovieIds = new Set<number>(initialMovie ? [initialMovie.id] : []);
  const usedPersonIds = new Set<number>([initialActor.id]);

  for (const [previousInitialActor, ...chain] of completedChains) {
    usedPersonIds.add(previousInitialActor.id);

    for (const [movie, person] of chain) {
      usedMovieIds.add(movie.id);
      if (person.id !== targetActorId) {
        usedPersonIds.add(person.id);
      }
    }
  }

  return {
    movie: usedMovieIds,
    person: usedPersonIds,
  };
};

export const useHandleUsedIds = (params: Params) => {
  const [usedIds, setUsedIds] = useState<{
    movie: Set<number>;
    person: Set<number>;
  }>(getUsedIds(params));

  const { targetActorId } = params;

  const handleUsedId = useCallback((...params: HandleUsedIdParams) => {
    const [method, type, entry] = params;

    if (
      !entry?.id ||
      (type === "person" && method === "add" && entry?.id === targetActorId)
    ) {
      return;
    }

    setUsedIds((prev) => {
      const updated = new Set(prev[type]);
      updated[method](entry.id);
      return {
        ...prev,
        [type]: updated,
      };
    });
  }, []);

  const insertUsedId = useCallback(
    (...params: HandleUsedIdBaseParams) => handleUsedId("add", ...params),
    [handleUsedId],
  );
  const insertUsedMovieId = useCallback(
    (movie: Movie | null) => insertUsedId("movie", movie),
    [insertUsedId],
  );
  const insertUsedPersonId = useCallback(
    (person: Person | null) => insertUsedId("person", person),
    [insertUsedId],
  );

  const insertUsedIds = useCallback(
    ([movie, person]: Chain) => {
      insertUsedMovieId(movie);
      insertUsedPersonId(person);
    },
    [insertUsedMovieId, insertUsedPersonId],
  );

  const removeUsedId = useCallback(
    (...params: HandleUsedIdBaseParams) => handleUsedId("delete", ...params),
    [handleUsedId],
  );
  const removeUsedMovieId = useCallback(
    (movie: Movie | null) => removeUsedId("movie", movie),
    [removeUsedId],
  );
  const removeUsedPersonId = useCallback(
    (person: Person | null) => removeUsedId("person", person),
    [removeUsedId],
  );

  const removeUsedIds = useCallback(
    ([movie, person]: Chain) => {
      removeUsedMovieId(movie);
      removeUsedPersonId(person);
    },
    [removeUsedMovieId, removeUsedPersonId],
  );

  const updateUsedMovieId = useCallback(
    (oldMovie: Entry<Movie>, newMovie: Entry<Movie>) => {
      removeUsedMovieId(oldMovie);
      insertUsedMovieId(newMovie);
    },
    [removeUsedMovieId, insertUsedMovieId],
  );
  const updateUsedPersonId = useCallback(
    (oldPerson: Entry<Person>, newPerson: Entry<Person>) => {
      removeUsedPersonId(oldPerson);
      insertUsedPersonId(newPerson);
    },
    [removeUsedPersonId, insertUsedPersonId],
  );

  const updateUsedIds = useCallback(
    ([oldMovie, oldPerson]: Chain, [newMovie, newPerson]: Chain) => {
      updateUsedMovieId(oldMovie, newMovie);
      updateUsedPersonId(oldPerson, newPerson);
    },
    [updateUsedMovieId, updateUsedPersonId],
  );

  return {
    usedIds,

    insertUsedIds,
    removeUsedIds,
    updateUsedIds,
  };
};
