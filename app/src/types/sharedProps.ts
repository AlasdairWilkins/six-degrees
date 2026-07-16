import type {Movie, Person} from '../types/tmdb'

export type SearchEntryProps<SearchType> = {
    disabled: boolean;
    result: SearchType;
    onSelect: (selection: SearchType | null) => void;
};

export type SearchAutocompleteProps<SearchType> = {
    value: SearchType | null;
    disabled: boolean;
    usedIds: Set<number>;
    onSelect?: (selection: SearchType | null) => void;
}

export type CompletedChain = [Person, ...[Movie, Person][]]