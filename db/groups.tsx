const DB_NAME = 'tprssDB';
const DB_VERSION = 1;

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
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

export const getGroupsCount = (db: IDBDatabase): Promise<number> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('group', 'readonly');
    const store = transaction.objectStore('group');
    const countRequest = store.count();

    countRequest.onsuccess = () => resolve(countRequest.result);
    countRequest.onerror = () => reject(countRequest.error);
  });
};

export const getGroups = (db: IDBDatabase): Promise<{id: number, title: string}[]> => {
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
    const transaction = db.transaction('group', 'readwrite');
    const store = transaction.objectStore('group');
    const deleteRequest = store.delete(id);

    deleteRequest.onsuccess = () => resolve();
    deleteRequest.onerror = () => reject(deleteRequest.error);
  });
};