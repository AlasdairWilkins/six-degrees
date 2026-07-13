export type SearchEntryProps<SearchType> = {
    result: SearchType;
    onSelect: (selection: SearchType | null) => void;
};