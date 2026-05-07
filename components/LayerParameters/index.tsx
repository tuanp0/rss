import React from 'react'
import Link from 'next/link'
import { useLayerContext } from '@/context/LayerContext'
import Container from '@/components/Container'

import styles from './LayerParameters.module.scss'

const index = () => {
  const { showParametersLayer, setShowParametersLayer } = useLayerContext()

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
          setShowParametersLayer(false)
      }
  }

  return (
    <div className={`${styles.layer} ${showParametersLayer ? styles.active : ''}`} onClick={handleOverlayClick}>
      <div className={styles.layerInner}>
        <div className={styles.layerHeader}>
          <Container className={styles.container}>
            <p className={styles.layerTitle}>Paramètres</p>
            <button className={styles.layerClose} onClick={() => setShowParametersLayer(false)}>
              <span className={styles.layerCloseLine}></span>
              <span className={styles.layerCloseLine}></span>
            </button>
          </Container>
        </div>
        <div className={styles.layerContent}>
          <Container>
            <h2>Couleur de fond</h2>
            <div className={styles.layerContentParameter}>
              <div className={styles.layerContentParameterItem}>
                <span className={`${styles.layerContentParameterStyle} light`}></span>
                <span className={styles.layerContentParameterText}>Light</span>
              </div>
              <div className={styles.layerContentParameterItem}>
                <span className={`${styles.layerContentParameterStyle} night`}></span>
                <span className={styles.layerContentParameterText}>Night</span>
              </div>
              <div className={styles.layerContentParameterItem}>
                <span className={`${styles.layerContentParameterStyle} morning`}></span>
                <span className={styles.layerContentParameterText}>Morning</span>
              </div>
              <div className={styles.layerContentParameterItem}>
                <span className={`${styles.layerContentParameterStyle} afternoon`}></span>
                <span className={styles.layerContentParameterText}>Afternoon</span>
              </div>
              <div className={styles.layerContentParameterItem}>
                <span className={`${styles.layerContentParameterStyle} dark`}></span>
                <span className={styles.layerContentParameterText}>Dark</span>
              </div>
            </div>
            <h2>Police de texte</h2>
            <div className={styles.layerContentParameter}>
              <div className={styles.layerContentParameterItem}>
                <span className={styles.layerContentParameterStyle}>Aa</span>
                <span className={styles.layerContentParameterText}>Serif</span>
              </div>
              <div className={styles.layerContentParameterItem}>
                <span className={styles.layerContentParameterStyle}>Aa</span>
                <span className={styles.layerContentParameterText}>Sans-Serif</span>
              </div>
              <div className={styles.layerContentParameterItem}>
                <span className={styles.layerContentParameterStyle}>Aa</span>
                <span className={styles.layerContentParameterText}>Monospace</span>
              </div>
              <div className={styles.layerContentParameterItem}>
                <span className={styles.layerContentParameterStyle}>Aa</span>
                <span className={styles.layerContentParameterText}>Handwritten</span>
              </div>
              <div className={styles.layerContentParameterItem}></div>
            </div>
            <h2>Taille de texte</h2>
            <div className={styles.layerContentParameter}>
              <div className={styles.layerContentParameterItem}>
                <span className={styles.layerContentParameterButton}>-</span>
              </div>
              <div className={styles.layerContentParameterVal}>16</div>
              <div className={styles.layerContentParameterItem}>
                <span className={styles.layerContentParameterButton}>+</span>
              </div>
            </div>
          </Container>
        </div>
      </div>
    </div>
  )
}

export default index