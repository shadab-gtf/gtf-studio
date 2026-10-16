"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServices } from "@/services/provider";
import { ErrorState } from "@/components/feedback/states";
import { ProjectGridSkeleton } from "@/components/feedback/skeletons";
import { Button } from "@/components/ui/button";
export function FontLicensesSection() {
  const { fonts } = useServices();
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(50);
  const query = useQuery({
    queryKey: ["fonts"],
    queryFn: ({ signal }) => fonts.catalog(signal),
  });
  const filtered =
    query.data?.filter((font) =>
      font.family.toLowerCase().includes(search.toLowerCase()),
    ) ?? [];
  return (
    <>
      <div className="workspace-title">
        <div>
          <h1>Fonts & their makers.</h1>
          <p>
            Source, attribution, and license information for every family in the
            catalog.
          </p>
        </div>
      </div>
      <div className="settings-panel">
        <p>
          Fonts are downloaded from Fontsource’s CDN or Font Library when you
          select them. Each family keeps its own license. Attribution and
          share-alike terms apply where specified. Uploaded fonts remain your
          responsibility and stay on this device.
        </p>
        <label className="field">
          Find a font
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setLimit(50);
            }}
            placeholder="Search family names"
          />
        </label>
      </div>
      {query.isPending ? (
        <ProjectGridSkeleton />
      ) : query.isError ? (
        <ErrorState
          message={query.error.message}
          retry={() => void query.refetch()}
        />
      ) : (
        <div className="font-license-list">
          {filtered.slice(0, limit).map((font) => (
            <article key={font.id}>
              <h2>{font.family}</h2>
              <p>{font.author ?? "See source for designer credits"}</p>
              <a
                href={font.source ?? `https://fontsource.org/fonts/${font.id}`}
                target="_blank"
                rel="noreferrer"
              >
                Family & credits ↗
              </a>
              <a
                href={
                  font.licenseUrl ?? `https://fontsource.org/fonts/${font.id}`
                }
                target="_blank"
                rel="noreferrer"
              >
                {font.license} ↗
              </a>
            </article>
          ))}
          {filtered.length > limit && (
            <Button onClick={() => setLimit(limit + 50)}>Show more</Button>
          )}
        </div>
      )}
    </>
  );
}
