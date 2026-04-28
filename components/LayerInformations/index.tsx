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
            <button className={styles.layerClose} onClick={() => setShowInformationsLayer(false)}>
              <span className={styles.layerCloseLine}></span>
              <span className={styles.layerCloseLine}></span>
            </button>
          </Container>
        </div>
        <div className={styles.layerContent}>
          <Container>
            <p>Une <strong>application web légère et pratique</strong> pour rassembler tous vos flux RSS en un seul endroit.<br/>
              Plus besoin de visiter chaque site un par un, retrouvez les derniers articles de vos sources préférées directement sur votre écran, à tout moment.</p>
            <p><strong>Aucune donnée personelle n'est collectée</strong>. Les flux RSS sont sauvegardés sur le device utilisé de l'utilisateur.</p>
            <p>Une version offline sera prochainement mise en place pour pouvoir consulter les articles déjà chargés sans connexion internet.</p>
            <p>C'est votre espace de lecture personnel. Rapide, privé, et à jour lorsque vous le souhaitez.</p>
            <h2>Tuan Phung</h2>
            <p>
              Site internet : <Link href={`https://tuanphung.com/`}target={`_blank`}>https://tuanphung.com/</Link><br/>
              Email : <a href={`mailto:${getEmail()}`}>{getEmail()}</a>
            </p>
          </Container>
        </div>
      </div>
    </div>
  )
}

export default index