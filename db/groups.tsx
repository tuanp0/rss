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

      if (!db.objectStoreNames.contains('source')) {
        const sourcesStore = db.createObjectStore('source', { keyPath: 'id', autoIncrement: true });
        sourcesStore.createIndex('urls', 'groupId', { unique: false });
      }

      if (!db.objectStoreNames.contains('post')) {
        const postsStore = db.createObjectStore('post', { keyPath: 'id', autoIncrement: true });
        postsStore.createIndex('groupId', 'groupId', { unique: false });
        postsStore.createIndex('sourceId', 'sourceId', { unique: false });
        postsStore.createIndex('url', 'url', { unique: true }); // prevents duplicate posts
      }

      if (!db.objectStoreNames.contains('theme')) {
        db.createObjectStore('theme', { keyPath: 'id' });
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
    const transaction = db.transaction(['group', 'source', 'post'], 'readwrite');
    const groupStore = transaction.objectStore('group');
    const sourceStore = transaction.objectStore('source');
    const postStore = transaction.objectStore('post');

    const sourceIndex = sourceStore.index('urls');
    const getSourcesRequest = sourceIndex.getAll(id);

    getSourcesRequest.onsuccess = () => {
      const sources: { id: number }[] = getSourcesRequest.result;

      for (const source of sources) {

        const postIndex = postStore.index('sourceId');
        const getPostsRequest = postIndex.getAll(source.id);
        getPostsRequest.onsuccess = () => {
          const posts: Post[] = getPostsRequest.result;
          for (const post of posts) {
            postStore.delete(post.id);
          }
        };

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
  favicon: string
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
  url: string,
  favicon: string,
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

      const addRequest = store.add({ groupId, name, url, favicon });
      addRequest.onsuccess = () => resolve();
      addRequest.onerror = () => reject(addRequest.error);
    };

    getExistingRequest.onerror = () => reject(getExistingRequest.error);
  });
};

export const deleteSource = (db: IDBDatabase, id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['source', 'post'], 'readwrite');
    const sourceStore = transaction.objectStore('source');
    const postStore = transaction.objectStore('post');

    const postIndex = postStore.index('sourceId');
    const getPostsRequest = postIndex.getAll(id);

    getPostsRequest.onsuccess = () => {
      const posts: Post[] = getPostsRequest.result;
      for (const post of posts) {
        postStore.delete(post.id);
      }

      const deleteRequest = sourceStore.delete(id);
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };

    getPostsRequest.onerror = () => reject(getPostsRequest.error);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
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

export const refreshSource = async (db: IDBDatabase, sourceId: number, groupId: number): Promise<void> => {
  const { parseRSSFeed } = await import('@/lib/parse-rss')

  const DAYS_LIMIT = 180

  const sources = await getSourcesByGroup(db, groupId)
  const source = sources.find(s => s.id === sourceId)
  if (!source) throw new Error('Source introuvable')

  const { posts } = await parseRSSFeed(source.url)

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - DAYS_LIMIT)

  for (const post of posts) {
    const publishedDate = post.publishedAt ? new Date(post.publishedAt) : null
    if (!publishedDate || isNaN(publishedDate.getTime())) continue
    if (publishedDate < cutoff) continue

    try {
      await addPost(db, groupId, sourceId, post.title, post.postUrl, post.shortDesc, post.content, post.thumbnail, publishedDate.toISOString())
    } catch {}
  }
}

export const refreshAllSources = async (
  db: IDBDatabase,
  groupId: number
): Promise<void> => {
  const sources = await getSourcesByGroup(db, groupId)

  await Promise.all(
    sources.map(source =>
      refreshSource(db, source.id, groupId).catch(err =>
        console.error(`Error refreshing source ${source.id}`, err)
      )
    )
  )
}

// ─── Posts ───────────────────────────────────────────────────────────────────

export interface Post {
  id: number
  groupId: number
  sourceId: number
  title: string
  url: string
  shortDesc: string
  content: string
  thumbnail: string
  publishedAt: Date | string
}

export const getPosts = (db: IDBDatabase): Promise<Post[]> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('post', 'readonly');
    const store = transaction.objectStore('post');
    const getAllRequest = store.getAll();

    getAllRequest.onsuccess = () => resolve(getAllRequest.result);
    getAllRequest.onerror = () => reject(getAllRequest.error);
  });
};

export const getPostsByGroup = (db: IDBDatabase, groupId: number): Promise<Post[]> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('post', 'readonly');
    const store = transaction.objectStore('post');
    const index = store.index('groupId');
    const getRequest = index.getAll(groupId);

    getRequest.onsuccess = () => resolve(getRequest.result);
    getRequest.onerror = () => reject(getRequest.error);
  });
};

export const getPostsBySource = (db: IDBDatabase, sourceId: number): Promise<Post[]> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('post', 'readonly');
    const store = transaction.objectStore('post');
    const index = store.index('sourceId');
    const getRequest = index.getAll(sourceId);

    getRequest.onsuccess = () => resolve(getRequest.result);
    getRequest.onerror = () => reject(getRequest.error);
  });
};

export const addPost = (
  db: IDBDatabase,
  groupId: number,
  sourceId: number,
  title: string,
  url: string,
  shortDesc: string,
  content: string,
  thumbnail: string | null,
  publishedAt: Date | string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('post', 'readwrite');
    const store = transaction.objectStore('post');
    const index = store.index('url');

    const getExistingRequest = index.get(url);
    getExistingRequest.onsuccess = () => {
      if (getExistingRequest.result) {
        reject(new Error('Un post avec cette URL existe déjà'));
        return;
      }

      const addRequest = store.add({ groupId, sourceId, title, url, shortDesc, content, thumbnail, publishedAt });

      addRequest.onsuccess = () => resolve();
      addRequest.onerror = () => reject(addRequest.error);
    };

    getExistingRequest.onerror = () => reject(getExistingRequest.error);
  });
};

export const deletePost = (db: IDBDatabase, id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('post', 'readwrite');
    const store = transaction.objectStore('post');
    const deleteRequest = store.delete(id);

    deleteRequest.onsuccess = () => resolve();
    deleteRequest.onerror = () => reject(deleteRequest.error);
  });
};

export const deletePostsBySource = (db: IDBDatabase, sourceId: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('post', 'readwrite');
    const store = transaction.objectStore('post');
    const index = store.index('sourceId');

    const getRequest = index.getAll(sourceId);
    getRequest.onsuccess = () => {
      const posts: Post[] = getRequest.result;
      for (const post of posts) {
        store.delete(post.id);
      }
    };

    getRequest.onerror = () => reject(getRequest.error);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

export const deletePostsByGroup = (db: IDBDatabase, groupId: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('post', 'readwrite');
    const store = transaction.objectStore('post');
    const index = store.index('groupId');

    const getRequest = index.getAll(groupId);
    getRequest.onsuccess = () => {
      const posts: Post[] = getRequest.result;
      for (const post of posts) {
        store.delete(post.id);
      }
    };

    getRequest.onerror = () => reject(getRequest.error);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

// ─── Theme ───────────────────────────────────────────────────────────────────

export interface Theme {
  id: 1;
  color_theme: string;
  font_theme: string;
  size_theme: number;
  location_theme: string;
}

const THEME_ID = 1;

export const getTheme = (db: IDBDatabase): Promise<Theme | null> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('theme', 'readonly');
    const store = transaction.objectStore('theme');
    const getRequest = store.get(THEME_ID);

    getRequest.onsuccess = () => resolve(getRequest.result ?? null);
    getRequest.onerror = () => reject(getRequest.error);
  });
};

export const setTheme = (
  db: IDBDatabase,
  values: Partial<Omit<Theme, 'id'>>
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('theme', 'readwrite');
    const store = transaction.objectStore('theme');
    const getRequest = store.get(THEME_ID);

    getRequest.onsuccess = () => {
      const existing: Theme = getRequest.result ?? { id: THEME_ID, color_theme: '', font_theme: '', size_theme: 16, location_theme: '' };
      const putRequest = store.put({ ...existing, ...values });

      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    };

    getRequest.onerror = () => reject(getRequest.error);
  });
};