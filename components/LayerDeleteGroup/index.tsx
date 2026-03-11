import React, { useState, useEffect } from 'react'
import { initDB, deleteGroup } from '@/db/groups'
import { useLayerContext } from '@/context/LayerContext'
import Container from '@/components/Container'
import styles from './LayerDeleteGroup.module.scss'

interface LayerTypes {
    onGroupDeleted: () => void
}

const index = ({onGroupDeleted}:LayerTypes) => {
    const { showDeleteLayer, setShowDeleteLayer, selectedGroupId, selectedGroupName } = useLayerContext()

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

    return (
        <div className={`${styles.layer} ${showDeleteLayer ? styles.active : ''}`} onClick={handleOverlayClick}>
            <div className={styles.layerInner}>
                <div className={styles.layerHeader}>
                    <Container>
                        <div className={styles.layerTitle}>
                            Supprimer la catégorie : {selectedGroupName}
                        </div>
                    </Container>
                </div>
                <div className={styles.layerContent}>
                    <Container>
                        <button type={'button'} className={styles.layerSubmit} onClick={() => handleDeleteGroup()}>Supprimer</button>
                    </Container>
                </div>
            </div>
        </div>
    )
}

export default index