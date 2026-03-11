import React, { useState, useEffect } from 'react'
import Container from '@/components/Container'
import styles from './LayerAddGroup.module.scss'
import { initDB, addGroup } from '@/db/groups'

interface LayerTypes {
    showAddLayer: boolean;
    setShowAddLayer: (value: boolean) => void;
    onGroupAdded: () => void;
}

const index = ({ showAddLayer, setShowAddLayer, onGroupAdded }: LayerTypes) => {
    const [urlInput, setUrlInput] = useState<string>('')
    const [db, setDb] = useState<IDBDatabase | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        initDB()
            .then((db) => setDb(db))
            .catch(console.error);
    }, []);

    const handleAdd = async () => {
        if (!db) return;
        if (!urlInput.trim()) return;

        try {
            await addGroup(db, urlInput.trim());
            setUrlInput('');
            setError(null);
            onGroupAdded();
            setShowAddLayer(false);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            }
        }
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {  // ✅ only fires on the overlay itself
            setShowAddLayer(false)
        }
    }

    return (
        <div className={`${styles.layer} ${showAddLayer ? styles.active : ''}`} onClick={handleOverlayClick}>
            <div className={styles.layerInner}>
                <div className={styles.layerHeader}>
                    <Container>
                        <button className={styles.layerClose} onClick={() => setShowAddLayer(false)}>
                            <span className={styles.layerCloseLine}></span>
                            <span className={styles.layerCloseLine}></span>
                        </button>
                        <div className={styles.layerTitle}>
                            Ajouter un groupe
                        </div>
                    </Container>
                </div>
                <div className={styles.layerContent}>
                    <Container>
                        <input
                            type={'text'}
                            className={styles.layerInput}
                            value={urlInput}
                            placeholder={'Nom du groupe'}
                            onChange={(e) => {
                                setUrlInput(e.target.value)
                                setError(null)
                            }}
                        />
                        {error && <p className={styles.layerError}>{error}</p>}
                        <button type={'button'} className={styles.layerSubmit} onClick={handleAdd}>Ajouter</button>
                    </Container>
                </div>
            </div>
        </div>
    )
}

export default index