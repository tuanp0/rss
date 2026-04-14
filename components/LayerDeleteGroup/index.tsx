import React, { useState, useEffect } from 'react'
import { initDB, deleteGroup, deleteSource } from '@/db/groups'
import { useLayerContext } from '@/context/LayerContext'
import Container from '@/components/Container'
import styles from './LayerDeleteGroup.module.scss'

interface LayerTypes {
    onGroupDeleted: () => void
    onSourceDeleted: () => void
}

const index = ({onGroupDeleted, onSourceDeleted}:LayerTypes) => {
    const { currentStep, showDeleteLayer, setShowDeleteLayer, selectedGroupId, selectedGroupName, selectedSourceId, selectedSourceName } = useLayerContext()

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            setShowDeleteLayer(false)
        }
    }

    const handleDeleteGroup = async () => {
        if (selectedGroupId === null) return
        const db = await initDB()
        await deleteGroup(db, selectedGroupId)
        setShowDeleteLayer(false)
        onGroupDeleted()
    }

    const handleDeleteSource = async () => {
        if (selectedSourceId === null) return
        const db = await initDB()
        await deleteSource(db, selectedSourceId)
        setShowDeleteLayer(false)
        onSourceDeleted()
    }

    return (
        <div className={`${styles.layer} ${showDeleteLayer ? styles.active : ''}`} onClick={handleOverlayClick}>
            <div className={styles.layerInner}>
                <div className={styles.layerHeader}>
                    <Container>
                        <div className={styles.layerTitle}>
                            {currentStep === 1 && `Supprimer le groupe : ${selectedGroupName}`}
                            {currentStep === 2 && `Supprimer la source : ${selectedSourceName}`}
                        </div>
                    </Container>
                </div>
                <div className={styles.layerContent}>
                    <Container>
                        {currentStep === 1 && <button type={'button'} className={styles.layerSubmit} onClick={() => handleDeleteGroup()}>Supprimer</button>}
                        {currentStep === 2 && <button type={'button'} className={styles.layerSubmit} onClick={() => handleDeleteSource()}>Supprimer</button>}
                    </Container>
                </div>
            </div>
        </div>
    )
}

export default index