'use client'
import { useLayerContext } from '@/context/LayerContext'
import Container from '@/components/Container'
import Button from '@/components/Button'

import styles from './Header.module.scss'

const Header = () => {
  const { currentStep, selectedGroupName, selectedSourceName } = useLayerContext()

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <Container className={styles.headerContainer}>
          <p className={styles.headerTitle}>
            <span className={`
              ${styles.headerTitleSpan}
              ${currentStep === 1 || currentStep === 4 ? styles.active : ''}
              ${currentStep === 2 || currentStep === 3 ? styles.past : ''}
            `}>
              <img src={`./tpreader-logo.png`} className={styles.headerTitleLogo}/>
              TP Reader
            </span>
            <span className={`
              ${styles.headerTitleSpan}
              ${currentStep < 2 ? styles.next : ''}
              ${currentStep === 2 ? styles.active : ''}
              ${currentStep > 2 ? styles.past : ''}
            `}>
              {selectedGroupName ? 
                selectedGroupName.length > 16 ? selectedGroupName.slice(0, 16) + '...' : selectedGroupName
                : 'TP Reader'
              }
            </span>
            <span className={`
              ${styles.headerTitleSpan}
              ${currentStep < 3 ? styles.next : ''}
              ${currentStep === 3 ? styles.active : ''}
              ${currentStep > 3 ? styles.past : ''}
            `}>
              {selectedSourceName ?
                selectedSourceName.length > 18 ? selectedSourceName.slice(0, 18) + '...' : selectedSourceName
                : 'TP Reader'
              }
            </span>

            
            {/* <span className={`${styles.headerTitleSpan}`}>
              {(currentStep === 1 || currentStep === 4) && 'TP Reader'}
              {currentStep === 2 && (
                selectedGroupName ?
                  selectedGroupName.length > 16 ? selectedGroupName.slice(0, 16) + '...' : selectedGroupName
                : 'TP Reader'
              )}
              {currentStep === 3 && (
                selectedSourceName ?
                  selectedSourceName.length > 18 ? selectedSourceName.slice(0, 18) + '...' : selectedSourceName
                : 'TP Reader'
              )}
              </span> */}
            
          </p>
        </Container>
      </div>
    </header>
  )
}

export default Header