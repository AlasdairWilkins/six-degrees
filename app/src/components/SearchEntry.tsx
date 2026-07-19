import { useMemo } from "react";

import type { Movie, Person } from "../types/tmdb";

import "./SearchEntry.css";

type Props<SearchType> = {
  disabled: boolean;
  entry: SearchType;
  onSelect: (entry: SearchType | null) => void;
  format: (entry: SearchType) => string;
};

export default function SearchEntry<SearchType extends Person | Movie>({
  disabled,
  onSelect,
  format,
  entry,
}: Props<SearchType>) {
  const formattedDisplay = useMemo(() => format(entry), [format, entry]);

  return (
    <li
      className={disabled ? "disabled" : undefined}
      onClick={() => !disabled && onSelect(entry)}
    >
      {formattedDisplay}
    </li>
  );
}
