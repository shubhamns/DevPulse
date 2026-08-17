import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { GitHubRepository } from "@/types/github";

type RepositoryPickerProps = {
  repositories: GitHubRepository[];
  value: string;
  disabled?: boolean;
  onChange: (fullName: string) => void;
};

function formatRepositoryLabel(repository: GitHubRepository): string {
  return `${repository.fullName}${repository.private ? " (private)" : ""}`;
}

export function RepositoryPicker({
  repositories,
  value,
  disabled = false,
  onChange,
}: RepositoryPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedRepository = useMemo(
    () => repositories.find((repository) => repository.fullName === value) ?? null,
    [repositories, value],
  );

  const filteredRepositories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return repositories;
    }

    return repositories.filter((repository) => {
      const haystack = `${repository.fullName} ${repository.owner} ${repository.name}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [repositories, query]);

  useEffect(() => {
    if (!open) {
      setQuery(selectedRepository ? formatRepositoryLabel(selectedRepository) : "");
    }
  }, [open, selectedRepository, value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(repository: GitHubRepository) {
    onChange(repository.fullName);
    setQuery(formatRepositoryLabel(repository));
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        id="repository"
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls="repository-listbox"
        autoComplete="off"
        placeholder="Search or select a repository..."
        className="field-input"
        disabled={disabled}
        value={query}
        onFocus={() => {
          if (disabled) {
            return;
          }

          setOpen(true);
          setQuery("");
        }}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);

          if (!event.target.value.trim()) {
            onChange("");
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
            setQuery(selectedRepository ? formatRepositoryLabel(selectedRepository) : "");
          }
        }}
      />

      {open && !disabled ? (
        <ul
          id="repository-listbox"
          role="listbox"
          className="absolute z-20 mt-2 max-h-60 w-full overflow-auto rounded-2xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          {filteredRepositories.length === 0 ? (
            <li className="px-3 py-2 text-sm text-slate-500">No repositories match your search.</li>
          ) : (
            filteredRepositories.map((repository) => (
              <li key={repository.fullName} role="option" aria-selected={repository.fullName === value}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full px-3 py-2 text-left text-sm transition hover:bg-slate-100",
                    repository.fullName === value && "bg-primary/10 text-primary",
                  )}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelect(repository)}
                >
                  {formatRepositoryLabel(repository)}
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
