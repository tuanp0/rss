import React from 'react'
import Link from 'next/link'
import { useLayerContext } from '@/context/LayerContext'
import Container from '@/components/Container'

import styles from './LayerInformations.module.scss'

const index = () => {
  const { showInformationsLayer, setShowInformationsLayer } = useLayerContext()

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
          setShowInformationsLayer(false)
      }
  }

  const getEmail = () => {
    return atob("aGVsbG9AdHVhbnBodW5nLmNvbQ==");
  };

  return (
    <div className={`${styles.layer} ${showInformationsLayer ? styles.active : ''}`} onClick={handleOverlayClick}>
      <div className={styles.layerInner}>
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
              Il suffit d'ajouter cette application web sur l'acran d'accueil de votre téléphone.</i>
            </p>
            <h2>Tuan Phung</h2>
            <p>
              Site internet : <Link href={`https://tuanphung.com/`} title={`Visiter le portfolio`} target={`_blank`}>https://tuanphung.com/</Link><br/>
              Email : <a href={`mailto:${getEmail()}`} title={`Envoyer un mail`}>{getEmail()}</a>
            </p>
          </Container>
        </div>
      </div>
    </div>
  )
}

export default index