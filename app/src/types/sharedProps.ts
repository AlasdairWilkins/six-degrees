export type SearchEntryProps<SearchType> = {
    result: SearchType;
    onSelect: (selection: SearchType | null) => void;
};

export type SearchAutocompleteProps<SearchType> = {
    value: SearchType | null
    disabled: boolean;
    onSelect?: (selection: SearchType | null) => void
}