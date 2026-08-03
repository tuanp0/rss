import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLayerContext } from '@/context/LayerContext'
import Container from '@/components/Container'

import styles from './LayerInformations.module.scss'

const index = () => {
  const { currentStep, showInformationsLayer, setShowInformationsLayer } = useLayerContext()
  const [appSize, setAppSize] = useState<number | null>(null)
  const [indexedDBSize, setIndexedDBSize] = useState<number | null>(null)

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
          setShowInformationsLayer(false)
      }
  }

  const getEmail = () => {
    return atob("aGVsbG9AdHVhbnBodW5nLmNvbQ==");
  };




  // Get Cache Storage size (PWA app shell: precached JS/CSS/images/fonts)
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

  // Get IndexedDB size, preferring the Chromium usageDetails breakdown,
  // falling back to the total storage estimate on other browsers
  const getIndexedDBSize = async (): Promise<number> => {
    if (!('storage' in navigator) || !navigator.storage.estimate) return 0

    const estimate: any = await navigator.storage.estimate()

    if (estimate.usageDetails?.indexedDB !== undefined) {
      return estimate.usageDetails.indexedDB
    }

    // Fallback: not precise (includes caches too), but better than nothing
    return estimate.usage ?? 0
  }

  useEffect(() => {
    const loadSizes = async () => {
      try {
        const [cacheBytes, idbBytes] = await Promise.all([
          getCacheStorageSize(),
          getIndexedDBSize(),
        ])

        setAppSize(Math.round(cacheBytes / 1024))
        setIndexedDBSize(Math.round(idbBytes / 1024))
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
      <div className={`${styles.layerInner} ${currentStep >= 2 ? styles.step2up : ''}`}>
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
                Application : {appSize}kb
                <br/>
                Données : {indexedDBSize}kb
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
              <h2>Tuan Phung</h2>
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