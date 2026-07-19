import type {Movie, Person} from '../types/tmdb'

export type Chain = [Movie | null, Person | null];

export type SearchAutocompleteProps<SearchType> = {
    value: SearchType | null;
    disabled: boolean;
    usedIds: Set<number>;
    onSelect?: (selection: SearchType | null) => void;
}

export type CompletedChain = [Person, ...[Movie, Person][]]