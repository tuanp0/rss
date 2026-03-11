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
          <p className={styles.headerTitle}>TP RSS</p>
          <Button text="Ajouter une catégorie" action={() => setShowAddLayer(true)} icon={'add'} />
        </Container>
      </div>
    </header>
  )
}

export default Header