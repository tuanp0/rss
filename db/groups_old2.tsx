const DB_NAME = 'tprssDB';
const DB_VERSION = 2;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('IndexedDB is not available on the server'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('group')) {
        const groupsStore = db.createObjectStore('group', { keyPath: 'id', autoIncrement: true });
        groupsStore.createIndex('category', 'title', { unique: false });
      }

      if (!db.objectStoreNames.contains('source')) {
        const sourcesStore = db.createObjectStore('source', { keyPath: 'id', autoIncrement: true });
        sourcesStore.createIndex('urls', 'groupId', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

// ─── Groups ──────────────────────────────────────────────────────────────────

export const getGroupsCount = (db: IDBDatabase): Promise<number> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('group', 'readonly');
    const store = transaction.objectStore('group');
    const countRequest = store.count();

    countRequest.onsuccess = () => resolve(countRequest.result);
    countRequest.onerror = () => reject(countRequest.error);
  });
};

export const getSourcesCountByGroup = (
  db: IDBDatabase
): Promise<Record<number, number>> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('source', 'readonly');
    const store = transaction.objectStore('source');
    const getAllRequest = store.getAll();

    getAllRequest.onsuccess = () => {
      const sources: Source[] = getAllRequest.result;

      const counts: Record<number, number> = {};

      for (const source of sources) {
        counts[source.groupId] = (counts[source.groupId] || 0) + 1;
      }

      resolve(counts);
    };

    getAllRequest.onerror = () => reject(getAllRequest.error);
  });
};

export const getGroups = (db: IDBDatabase): Promise<{ id: number; title: string }[]> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('group', 'readonly');
    const store = transaction.objectStore('group');
    const getAllRequest = store.getAll();

    getAllRequest.onsuccess = () => resolve(getAllRequest.result);
    getAllRequest.onerror = () => reject(getAllRequest.error);
  });
};

export const addGroup = (db: IDBDatabase, title: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('group', 'readwrite');
    const store = transaction.objectStore('group');
    const getAllRequest = store.getAll();

    getAllRequest.onsuccess = () => {
      const groups = getAllRequest.result;
      const alreadyExists = groups.some(
        (group) => group.title.toLowerCase() === title.toLowerCase()
      );

      if (alreadyExists) {
        reject(new Error('Un groupe avec ce nom existe déjà'));
        return;
      }

      const addRequest = store.add({ title });
      addRequest.onsuccess = () => resolve();
      addRequest.onerror = () => reject(addRequest.error);
    };

    getAllRequest.onerror = () => reject(getAllRequest.error);
  });
};

export const deleteGroup = (db: IDBDatabase, id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['group', 'source'], 'readwrite');
    const groupStore = transaction.objectStore('group');
    const sourceStore = transaction.objectStore('source');
    const index = sourceStore.index('urls');

    const getSourcesRequest = index.getAll(id);

    getSourcesRequest.onsuccess = () => {
      const sources: { id: number }[] = getSourcesRequest.result;
      for (const source of sources) {
        sourceStore.delete(source.id);
      }
      const deleteRequest = groupStore.delete(id);
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };

    getSourcesRequest.onerror = () => reject(getSourcesRequest.error);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

// ─── Sources ─────────────────────────────────────────────────────────────────

export interface Source {
  id: number;
  groupId: number;
  name: string;
  url: string;
}

export const getSourcesByGroup = (db: IDBDatabase, groupId: number): Promise<Source[]> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('source', 'readonly');
    const store = transaction.objectStore('source');
    const index = store.index('urls');
    const getRequest = index.getAll(groupId);

    getRequest.onsuccess = () => resolve(getRequest.result);
    getRequest.onerror = () => reject(getRequest.error);
  });
};

export const addSource = (
  db: IDBDatabase,
  groupId: number,
  name: string,
  url: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('source', 'readwrite');
    const store = transaction.objectStore('source');
    const index = store.index('urls');

    const getExistingRequest = index.getAll(groupId);
    getExistingRequest.onsuccess = () => {
      const sources: Source[] = getExistingRequest.result;
      const alreadyExists = sources.some(
        (source) => source.url.toLowerCase() === url.toLowerCase()
      );

      if (alreadyExists) {
        reject(new Error('Cette URL existe déjà dans ce groupe'));
        return;
      }

      const addRequest = store.add({ groupId, name, url });
      addRequest.onsuccess = () => resolve();
      addRequest.onerror = () => reject(addRequest.error);
    };

    getExistingRequest.onerror = () => reject(getExistingRequest.error);
  });
};

export const deleteSource = (db: IDBDatabase, id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('source', 'readwrite');
    const store = transaction.objectStore('source');
    const deleteRequest = store.delete(id);

    deleteRequest.onsuccess = () => resolve();
    deleteRequest.onerror = () => reject(deleteRequest.error);
  });
};

export const updateSource = (
  db: IDBDatabase,
  id: number,
  name: string,
  url: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('source', 'readwrite');
    const store = transaction.objectStore('source');

    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const existing: Source = getRequest.result;
      if (!existing) {
        reject(new Error('Source introuvable'));
        return;
      }

      const putRequest = store.put({ ...existing, name, url });
      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    };

    getRequest.onerror = () => reject(getRequest.error);
  });
};