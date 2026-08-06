import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLayerContext } from '@/context/LayerContext'
import Container from '@/components/Container'

import styles from './LayerInformations.module.scss'

type LayerInformationsTypes = {
  showInformationsLayer: boolean
  setShowInformationsLayer: (value: boolean) => void
}

const index = ({showInformationsLayer, setShowInformationsLayer}: LayerInformationsTypes) => {
  const { currentStep } = useLayerContext()
  const [appSize, setAppSize] = useState<string | null>(null)
  const [indexedDBSize, setIndexedDBSize] = useState<string | null>(null)

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
          setShowInformationsLayer(false)
      }
  }

  const getEmail = () => {
    return atob("aGVsbG9AdHVhbnBodW5nLmNvbQ==");
  };

  const getCacheStorageSize = async (): Promise<number> => {
    if (!('caches' in window)) return 0

    const cacheNames = await caches.keys()
    let total = 0

    for (const name of cacheNames) {
      const cache = await caches.open(name)
      const requests = await cache.keys()

      for (const request of requests) {
        const response = await cache.match(request)
        if (response) {
          const blob = await response.blob()
          total += blob.size
        }
      }
    }

    return total
  }

  const getIndexedDBSize = async (): Promise<number> => {
    const databases = await indexedDB.databases();

    if (!databases.length) {
      console.log("No IndexedDB databases found.");
      return 0;
    }

    let grandTotal = 0;

    for (const { name } of databases) {
      if (!name) continue;

      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const req = indexedDB.open(name);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });

      for (const storeName of db.objectStoreNames) {
        const tx = db.transaction(storeName, "readonly");
        const store = tx.objectStore(storeName);

        await new Promise<void>((resolve, reject) => {
          const req = store.openCursor();

          req.onsuccess = (e) => {
            const cursor = (e.target as IDBRequest<IDBCursorWithValue | null>).result;

            if (!cursor) {
              resolve();
              return;
            }

            const value = cursor.value;

            try {
              if (value instanceof Blob) {
                grandTotal += value.size;
              } else if (value instanceof ArrayBuffer) {
                grandTotal += value.byteLength;
              } else if (ArrayBuffer.isView(value)) {
                grandTotal += value.byteLength;
              } else {
                grandTotal += new Blob([JSON.stringify(value)]).size;
              }
            } catch {}

            cursor.continue();
          };

          req.onerror = () => reject(req.error);
        });
      }

      db.close();
    }

    return grandTotal;
  };

  function formatSize(bytes:number) {
    const kb = bytes / 1024;
    const mb = kb / 1024;

    if (mb >= 1) {
      return `${mb.toFixed(2)} MB`;
    }

    return `${Math.round(kb)} KB`;
  }

  useEffect(() => {
    const loadSizes = async () => {
      try {
        const [cacheBytes, idbBytes] = await Promise.all([
          getCacheStorageSize(),
          getIndexedDBSize(),
        ])

        setAppSize(formatSize(cacheBytes))
        setIndexedDBSize(formatSize(idbBytes))
      } catch (err) {
        console.error('Failed to compute storage sizes', err)
      }
    }

    if (showInformationsLayer) {
      loadSizes()
    }
  }, [showInformationsLayer])

  return (
    <div className={`${styles.layer} ${showInformationsLayer ? styles.active : ''}`} onClick={handleOverlayClick}>
      <div className={`${styles.layerInner} ${currentStep >= 2 ? styles.open : ''}`}>
        <div className={styles.layerHeader}>
          <Container className={styles.container}>
            <p className={styles.layerTitle}>A propos</p>
            <button className={styles.layerClose} aria-label={`Fermer`} onClick={() => setShowInformationsLayer(false)}>
              <span className={styles.layerCloseLine}></span>
              <span className={styles.layerCloseLine}></span>
            </button>
          </Container>
        </div>
        <div className={styles.layerContent}>
          <Container className={styles.container}>
            <div className={styles.layerContentData}>
              <p>
                App Cache : {appSize}
                <br/>
                Données sur device : {indexedDBSize}
              </p>
            </div>
            <div className={styles.layerContentInformations}>
              <p>
                Une <strong>application web légère et pratique</strong> pour rassembler toutes vos news et articles en un seul endroit.<br/>
                Plus besoin de visiter chaque site un par un, retrouvez les articles de vos sources préférées directement sur votre écran, à tout moment.<br/>
                Entrez l'URL du site et si un flux RSS/ATOM est disponible, les entrées seront récupérées.</p>
              <p>
                <strong>Aucune donnée personelle n'est collectée</strong>. Les flux RSS et articles sont sauvegardés sur le device utilisé.<br/>
                C'est votre espace de lecture personnel. Rapide, privé, et à jour lorsque vous le souhaitez.
              </p>

              <p>
                <i>Une version offline est en place pour pouvoir consulter les articles déjà chargés sans connexion internet.<br/>
                Il suffit d'ajouter cette application web sur l'écran d'accueil de votre téléphone.</i>
              </p>
              <p className={styles.layerContentTitle}>Tuan Phung</p>
              <p>
                Site internet : <Link href={`https://tuanphung.com/`} title={`Visiter le portfolio`} target={`_blank`}>https://tuanphung.com/</Link><br/>
                {/* Email : <a href={`mailto:${getEmail()}`} title={`Envoyer un mail`}>{getEmail()}</a> */}
              </p>
            </div>
          </Container>
        </div>
      </div>
    </div>
  )
}

export default index