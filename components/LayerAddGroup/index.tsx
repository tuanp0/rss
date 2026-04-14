import React, { useState, useEffect } from 'react'
import { initDB, addGroup, addSource } from '@/db/groups'
import { useLayerContext } from '@/context/LayerContext'
import Container from '@/components/Container'

import styles from './LayerAddGroup.module.scss'

interface Feed {
    href: string
    title: string
    type: string
}

interface LayerTypes {
    showAddLayer: boolean
    setShowAddLayer: (value: boolean) => void
    onGroupAdded: () => void
}

const index = ({ showAddLayer, setShowAddLayer, onGroupAdded }: LayerTypes) => {
    const { currentStep, currentGroup } = useLayerContext()

    const [nameInput, setNameInput] = useState<string>('')
    const [urlInput, setUrlInput] = useState<string>('')
    const [db, setDb] = useState<IDBDatabase | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [availableFeeds, setAvailableFeeds] = useState<Feed[]>([])

    useEffect(() => {
        initDB()
            .then((db) => setDb(db))
            .catch(console.error)
    }, [])

    const handleAddGroup = async () => {
        if (!db) return
        if (!nameInput.trim()) return

        try {
            await addGroup(db, nameInput.trim())
            setNameInput('')
            setError(null)
            onGroupAdded()
            setShowAddLayer(false)
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message)
            }
        }
    }

    const handleAddSource = async () => {
        if (!db) return
        if (!urlInput.trim()) return

        setLoading(true)
        setError(null)
        setAvailableFeeds([])

        try {
            const res = await fetch(`/api/find-rss?url=${encodeURIComponent(urlInput.trim())}`)
            const data = await res.json()

            if (data.error) throw new Error(data.error)
            if (data.feeds.length === 0) throw new Error("Aucun flux RSS trouvé pour cette URL.")

            if (data.feeds.length === 1) {
                await confirmFeed(data.feeds[0])
            } else {
                setAvailableFeeds(data.feeds) // let user pick
            }
        } catch (err: unknown) {
            if (err instanceof Error) setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const confirmFeed = async (feed: Feed) => {
        if (!db) return
        try {
            await addSource(db, currentGroup, feed.title, feed.href)
            setUrlInput('')
            setAvailableFeeds([])
            onGroupAdded()
            setShowAddLayer(false)
        } catch (err: unknown) {
            if (err instanceof Error) setError(err.message)
        }
    }

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
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
                            {currentStep === 1 && "Ajouter un groupe"}
                            {currentStep === 2 && "Ajouter une source"}
                        </div>
                    </Container>
                </div>
                <div className={styles.layerContent}>
                    <Container>
                        {currentStep === 1 && 
                            <input
                                type={'text'}
                                className={styles.layerInput}
                                value={nameInput}
                                placeholder={'Nom du groupe'}
                                onChange={(e) => {
                                    setNameInput(e.target.value)
                                    setError(null)
                                }}
                            />
                        }

                        {currentStep === 2 && (
                            <>
                                <input
                                    type="text"
                                    className={styles.layerInput}
                                    value={urlInput}
                                    placeholder="URL de la source"
                                    onChange={(e) => { setUrlInput(e.target.value); setError(null); setAvailableFeeds([]) }}
                                />

                                {availableFeeds.length > 1 && (
                                    <ul className={styles.feedList}>
                                        {availableFeeds.map((feed) => (
                                            <li key={feed.href} className={styles.feedItem}>
                                                <button
                                                    type="button"
                                                    className={styles.feedButton}
                                                    onClick={() => confirmFeed(feed)}
                                                >
                                                    <span className={styles.feedTitle}>{feed.title}</span>
                                                    <span className={styles.feedHref}>{feed.href}</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </>
                        )}

                        {error && <p className={styles.layerError}>{error}</p>}
                        {currentStep === 1 && <button type={'button'} className={styles.layerSubmit} onClick={handleAddGroup}>Ajouter</button>}
                        {/* {currentStep === 2 && <button type={'button'} className={styles.layerSubmit} onClick={handleAddSource}>Vérifier l'URL</button>} */}
                        {currentStep === 2 && availableFeeds.length === 0 &&
                            <button type="button" className={styles.layerSubmit} onClick={handleAddSource} disabled={loading}>
                                {loading ? "Recherche..." : "Ajouter"}
                            </button>
                        }
                    </Container>
                </div>
            </div>
        </div>
    )
}

export default index