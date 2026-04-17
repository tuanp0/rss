'use client'
import React from 'react'
import Container from '@/components/Container'
import Button from '@/components/Button'
import { useLayerContext } from '@/context/LayerContext'
import styles from './Header.module.scss'

const Header = () => {
  const { currentStep, setCurrentStep, setShowAddLayer } = useLayerContext()

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <Container className={styles.headerContainer}>
          {currentStep === 1 && <Button text="Accéder aux paramètres" action={() => setShowAddLayer(true)} icon={'parameter'} />}
          {currentStep === 2 && <Button text="Accéder aux catégories" action={() => setCurrentStep(1)} icon={'previous'} />}
          {currentStep === 3 && <Button text="Accéder aux sources" action={() => setCurrentStep(2)} icon={'previous'} />}
          {currentStep === 4 && <Button text="Accéder aux news" action={() => setCurrentStep(3)} icon={'previous'} />}
          <p className={styles.headerTitle}>TP Reader</p>
          {currentStep === 1 && <Button text="Ajouter une catégorie" action={() => setShowAddLayer(true)} icon={'add'} />}
          {currentStep === 2 && <Button text="Ajouter une source" action={()=> setShowAddLayer(true)} icon={'add'} />}
          {/* {currentStep === 3 && <Button text="Rafraîchir la liste" action={() => setShowAddLayer(true)} icon={'refresh'} />}
          {currentStep === 4 && <Button text="Sauvegarder ce post" action={() => setShowAddLayer(true)} icon={'save'} />} */}
        </Container>
      </div>
    </header>
  )
}

export default Header