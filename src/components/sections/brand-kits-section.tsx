"use client";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServices } from "@/services/provider";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Plus, Trash2 } from "@/components/ui/icons";
import { ErrorState, EmptyState } from "@/components/feedback/states";
import { ProjectGridSkeleton } from "@/components/feedback/skeletons";
import type { BrandKit } from "@/types/studio";
export function BrandKitsSection() {
  const services = useServices();
  const cache = useQueryClient();
  const query = useQuery({
    queryKey: ["brand-kits"],
    queryFn: () => services.brandKits.list(),
  });
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [colors, setColors] = useState([
    "#29afe4",
    "#e24397",
    "#17212b",
    "#ffffff",
  ]);
  const [font, setFont] = useState<BrandKit["font"]>("Manrope");
  const save = useMutation({
    mutationFn: (kit: BrandKit) => services.brandKits.save(kit),
    onSuccess: () => {
      void cache.invalidateQueries({ queryKey: ["brand-kits"] });
      setOpen(false);
      setName("");
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => services.brandKits.delete(id),
    onSuccess: () => {
      void cache.invalidateQueries({ queryKey: ["brand-kits"] });
    },
  });
  return (
    <>
      <div className="workspace-title">
        <div>
          <h1>Make it unmistakably yours.</h1>
          <p>Your colors and type, ready whenever you are.</p>
        </div>
        <Button variant="primary" onClick={() => setOpen(true)}>
          <Plus size={18} />
          Create a brand kit
        </Button>
      </div>
      {remove.isError && (
        <p role="alert" className="error-text">
          {remove.error.message}
        </p>
      )}
      {query.isPending ? (
        <ProjectGridSkeleton />
      ) : query.isError ? (
        <ErrorState
          message={query.error.message}
          retry={() => void query.refetch()}
        />
      ) : !query.data.length ? (
        <EmptyState
          title="Your signature starts here"
          description="Create a kit to keep your favorite colors and fonts together."
        />
      ) : (
        <div className="kit-grid">
          {query.data.map((kit) => (
            <article className="kit-card" key={kit.id}>
              <h2>{kit.name}</h2>
              <div className="kit-colors">
                {kit.colors.map((color, index) => (
                  <span
                    key={`${color}-${index}`}
                    style={{ background: color }}
                    title={color}
                  />
                ))}
              </div>
              <div className="kit-footer">
                <span style={{ fontFamily: kit.font }}>Aa · {kit.font}</span>
                <button
                  className="icon-button"
                  aria-label={`Delete ${kit.name}`}
                  onClick={() => remove.mutate(kit.id)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="A style all your own"
        description="Keep a few favorite colors and a typeface ready for every design."
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            save.mutate({ id: crypto.randomUUID(), name, colors, font });
          }}
        >
          <label className="field">
            Brand name
            <input
              required
              maxLength={120}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your brand"
            />
          </label>
          <span className="muted">Brand colors</span>
          <div className="color-inputs">
            {colors.map((color, index) => (
              <input
                key={index}
                type="color"
                value={color}
                aria-label={`Brand color ${index + 1}`}
                onChange={(event) =>
                  setColors(
                    colors.map((value, i) =>
                      i === index ? event.target.value : value,
                    ),
                  )
                }
              />
            ))}
          </div>
          <label className="field">
            Typeface
            <select
              value={font}
              onChange={(event) =>
                setFont(event.target.value as BrandKit["font"])
              }
            >
              <option>Manrope</option>
              <option>Georgia</option>
              <option>Arial</option>
            </select>
          </label>
          {save.isError && (
            <p role="alert" className="error-text">
              {save.error.message}
            </p>
          )}
          <Button
            variant="primary"
            className="full-width"
            type="submit"
            disabled={save.isPending}
          >
            Save brand kit
          </Button>
        </form>
      </Modal>
    </>
  );
}
