type MovieKnownFor = {
    media_type: 'movie';
    title: string;
}

type TVKnownFor = {
    media_type: 'tv';
    name: string;
}

type KnownFor = MovieKnownFor | TVKnownFor;

export type Person = {
  id: number;
  name: string;
  known_for: KnownFor[];
  known_for_department: string;
  popularity: number
};

export type Movie = {
    id: number;
    popularity: number;
    release_date: string;
    title: string;
}