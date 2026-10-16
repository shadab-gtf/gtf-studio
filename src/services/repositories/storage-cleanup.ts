import { openDB } from "idb";

export const EDITOR_DATABASE = "gtf-studio-editor-v1";
export const FONT_DATABASE = "gtf-studio-fonts-v1";

export async function deleteProjectAuxiliaryData(projectId: string): Promise<void> {
  let absent = false;
  const db = await openDB(EDITOR_DATABASE, undefined, {
    upgrade(_db, oldVersion, _newVersion, transaction) {
      if (oldVersion === 0) {
        absent = true;
        // Aborting this probe intentionally leaves no empty database behind.
        // idb also wraps the upgrade transaction, whose expected rejection must be consumed.
        void transaction.done.catch(() => undefined);
        transaction.abort();
      }
    },
  }).catch((error: unknown) => {
    if (absent) return null;
    throw error;
  });
  if (!db) return;
  try {
    const stores = ["comments", "versions"].filter((name) => db.objectStoreNames.contains(name));
    if (!stores.length) return;
    const transaction = db.transaction(stores, "readwrite");
    await Promise.all(stores.map(async (name) => {
      const store = transaction.objectStore(name);
      for (const key of await store.index("projectId").getAllKeys(projectId)) await store.delete(key);
    }));
    await transaction.done;
  } finally {
    db.close();
  }
}

function deleteDatabase(name: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(name);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("Browser storage could not be cleared."));
    request.onblocked = () => reject(new Error("Close other GTF Studio tabs and retry the reset. Some local data has not been deleted."));
  });
}

export async function deleteWorkspaceStorage(primaryDatabase: string): Promise<void> {
  for (const name of [EDITOR_DATABASE, FONT_DATABASE, "doory-audio", primaryDatabase]) await deleteDatabase(name);
  if (typeof caches !== "undefined") {
    for (const key of await caches.keys()) if (key.startsWith("doory-audio")) await caches.delete(key);
  }
  if (typeof localStorage !== "undefined") {
    for (let index = localStorage.length - 1; index >= 0; index--) {
      const key = localStorage.key(index);
      if (key && /^(gtf-|doory[.:/-])/.test(key)) localStorage.removeItem(key);
    }
  }
}
