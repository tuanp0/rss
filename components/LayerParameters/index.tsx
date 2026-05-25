import React, { useState, useEffect } from 'react'
import { initDB, getTheme, setTheme, Theme } from '@/db/groups'
import { useLayerContext } from '@/context/LayerContext'
import Container from '@/components/Container'
import Button from '@/components/Button'

import styles from './LayerParameters.module.scss'

type Props = { onThemeChange?: (theme: Theme) => void }

const index = ({ onThemeChange }: Props) => {
  const { showParametersLayer, setShowParametersLayer, activeColor, setActiveColor, activeFont, setActiveFont, activeSize, setActiveSize, location, setLocation } = useLayerContext()
  const [db, setDb] = useState<IDBDatabase | null>(null)

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
          setShowParametersLayer(false)
      }
  }

  const handleTheme = async (key: 'color' | 'font' | 'size' | 'ville', val: string) => {
    if (!db) return

    if (key === 'color') {
      setActiveColor(val)
      await setTheme(db, { color_theme: val })
    }
    if (key === 'font') {
      setActiveFont(val)
      await setTheme(db, { font_theme: val })
    }
    if (key === 'size') {
      const newSize = val === 'more' ? Math.min(activeSize + 2, 32) : Math.max(activeSize - 2, 10)
      setActiveSize(newSize)
      await setTheme(db, { size_theme: newSize })
    }

    if (key === 'ville') {
      setLocation(val)
      await setTheme(db, { location_theme: val })
    }

    const updated = await getTheme(db)
    if (updated) onThemeChange?.(updated)
  }

  useEffect(() => {
    initDB()
      .then(async (database) => {
        setDb(database)
        const theme = await getTheme(database)
        if (theme?.size_theme) setActiveSize(theme.size_theme)
        if (theme?.color_theme) setActiveColor(theme.color_theme)
        if (theme?.font_theme) setActiveFont(theme.font_theme)
        if (theme?.location_theme) setLocation(theme.location_theme)
      })
    .catch(console.error)
  }, [])

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
          <Container className={styles.container}>
            <h2>Couleur de fond</h2>
            <div className={styles.layerContentParameter}>
              <div className={`${styles.layerContentParameterItem} ${activeColor === 'auto' ? styles.active : ''}`} onClick={() => handleTheme('color', 'auto')}>
                <span className={`${styles.layerContentParameterStyle} ${styles.auto}`}></span>
                <span className={styles.layerContentParameterText}>Auto</span>
              </div>
              <div className={`${styles.layerContentParameterItem} ${activeColor === 'light' ? styles.active : ''}`} onClick={() => handleTheme('color', 'light')}>
                <span className={`${styles.layerContentParameterStyle} light`}></span>
                <span className={styles.layerContentParameterText}>Light</span>
              </div>
              <div className={`${styles.layerContentParameterItem} ${activeColor === 'night' ? styles.active : ''}`} onClick={() => handleTheme('color', 'night')}>
                <span className={`${styles.layerContentParameterStyle} night`}></span>
                <span className={styles.layerContentParameterText}>Night</span>
              </div>
              <div className={`${styles.layerContentParameterItem} ${activeColor === 'morning' ? styles.active : ''}`} onClick={() => handleTheme('color', 'morning')}>
                <span className={`${styles.layerContentParameterStyle} morning`}></span>
                <span className={styles.layerContentParameterText}>Morning</span>
              </div>
              <div className={`${styles.layerContentParameterItem} ${activeColor === 'afternoon' ? styles.active : ''}`} onClick={() => handleTheme('color', 'afternoon')}>
                <span className={`${styles.layerContentParameterStyle} afternoon`}></span>
                <span className={styles.layerContentParameterText}>Afternoon</span>
              </div>
              <div className={`${styles.layerContentParameterItem} ${activeColor === 'dark' ? styles.active : ''}`} onClick={() => handleTheme('color', 'dark')}>
                <span className={`${styles.layerContentParameterStyle} dark`}></span>
                <span className={styles.layerContentParameterText}>Dark</span>
              </div>
            <div className={`${styles.layerContentParameterItem} ${activeColor === 'forest' ? styles.active : ''}`} onClick={() => handleTheme('color', 'forest')}>
                <span className={`${styles.layerContentParameterStyle} forest`}></span>
                <span className={styles.layerContentParameterText}>Forest</span>
              </div>
            </div>
            <h2>Police de texte</h2>
            <div className={styles.layerContentParameter}>
              <div className={`${styles.layerContentParameterItem} ${activeFont === 'default' ? styles.active : ''}`} onClick={() => handleTheme('font', 'default')}>
                <span className={`${styles.layerContentParameterStyle} font-serif`}>Aa</span>
                <span className={styles.layerContentParameterText}>Times New Roman</span>
              </div>
              <div className={`${styles.layerContentParameterItem} ${activeFont === 'sansserif' ? styles.active : ''}`} onClick={() => handleTheme('font', 'sansserif')}>
                <span className={`${styles.layerContentParameterStyle} font-sansserif`}>Aa</span>
                <span className={styles.layerContentParameterText}>Roboto</span>
              </div>
              <div className={`${styles.layerContentParameterItem} ${activeFont === 'gabriela' ? styles.active : ''}`} onClick={() => handleTheme('font', 'gabriela')}>
                <span className={`${styles.layerContentParameterStyle} font-gabriela`}>Aa</span>
                <span className={styles.layerContentParameterText}>Gabriela</span>
              </div>
              <div className={`${styles.layerContentParameterItem} ${activeFont === 'monospace' ? styles.active : ''}`} onClick={() => handleTheme('font', 'monospace')}>
                <span className={`${styles.layerContentParameterStyle} font-monospace`}>Aa</span>
                <span className={styles.layerContentParameterText}>Monospace</span>
              </div>
            </div>
            <div className={styles.layerContentHalf}>
              <div className={styles.layerContentSize}>
                <h2>Taille de texte</h2>
                <div className={styles.layerContentParameter}>
                  <Button text="Réduire la taille" action={() => handleTheme('size', 'less')} icon={'minus'} />
                  <div className={styles.layerContentParameterVal}>{activeSize}</div>
                  <Button text="Augmenter la taille" action={() => handleTheme('size', 'more')} icon={'add'} />
                </div>
              </div>
              <div className={styles.layerContentLocation}>
                <h2>Localisation Méteo</h2>
                  <input
                    type="text"
                    className={styles.layerContentLocationInput}
                    defaultValue={location ?? ''}
                    placeholder={'Ville'}
                    onBlur={(e) => { handleTheme('ville', e.target.value) }}
                  />
              </div>
            </div>
          </Container>
        </div>
      </div>
    </div>
  )
}

export default index