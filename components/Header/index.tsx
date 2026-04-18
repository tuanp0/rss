'use client'
import React, {useState} from 'react'
import { useLayerContext } from '@/context/LayerContext'
import { initDB, refreshSource } from '@/db/groups'
import Container from '@/components/Container'
import Button from '@/components/Button'

import styles from './Header.module.scss'

const Header = () => {
  const { currentStep, setCurrentStep, setShowAddLayer, currentGroup, currentSource, triggerRefresh } = useLayerContext()
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    const db = await initDB()

    if (!db || currentSource === null || currentGroup === null) return

    setRefreshing(true)

    try {
      await refreshSource(db, currentSource, currentGroup)
      triggerRefresh()
    } catch (err) {
      console.error(err)
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <Container className={styles.headerContainer}>
          {currentStep === 1 && <Button text="Accéder aux paramètres" action={() => setShowAddLayer(true)} icon={'parameter'} />}
          {currentStep === 2 && <Button text="Accéder aux catégories" action={() => setCurrentStep(1)} icon={'previous'} />}
          {currentStep === 3 && <Button text="Accéder aux sources" action={() => setCurrentStep(2)} icon={'previous'} />}
          {currentStep === 4 && <Button text="Accéder aux news" action={() => setCurrentStep(3)} icon={'previous'} />}
          <p className={styles.headerTitle}><span className={styles.headerTitleSpan}>TP Reader</span></p>
          {currentStep === 1 && <Button text="Ajouter une catégorie" action={() => setShowAddLayer(true)} icon={'add'} />}
          {currentStep === 2 && <Button text="Ajouter une source" action={()=> setShowAddLayer(true)} icon={'add'} />}
          {currentStep === 3 && <Button text="Rafraîchir la liste" action={handleRefresh} icon={'refresh'} isRefreshing={refreshing} />}
          {/* {currentStep === 4 && <Button text="Sauvegarder ce post" action={() => setShowAddLayer(true)} icon={'save'} />} */}
        </Container>
      </div>
    </header>
  )
}

export default Header