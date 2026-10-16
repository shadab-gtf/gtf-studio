"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServices } from "@/services/provider";
import { readImage } from "./read-image";
export function useAssetLibrary() {
  const services = useServices();
  const cache = useQueryClient();
  const query = useQuery({
    queryKey: ["assets"],
    queryFn: () => services.assets.list(),
  });
  const upload = useMutation({
    mutationFn: async (file: File) =>
      services.assets.save(await readImage(file)),
    onSuccess: () => {
      void cache.invalidateQueries({ queryKey: ["assets"] });
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => services.assets.delete(id),
    onSuccess: () => {
      void cache.invalidateQueries({ queryKey: ["assets"] });
    },
  });
  return { query, upload, remove };
}
