import React, { useState, useEffect } from 'react'
import { initDB, addGroup, addSource, getSourcesByGroup, addPost } from '@/db/groups'
import { parseRSSFeed } from "@/lib/parse-rss";
import { findRSSFeeds } from "@/lib/find-rss";
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

const DAYS_LIMIT = 180

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
            if (err instanceof Error) setError(err.message)
        }
    }

    const handleAddSource = async () => {
        if (!db) return
        if (!urlInput.trim()) return

        setLoading(true)
        setError(null)
        setAvailableFeeds([])

        try {
            const feeds = await findRSSFeeds(urlInput.trim().toLowerCase())

            if (feeds.length === 0) throw new Error("Aucun flux RSS trouvé pour cette URLsss.")
            if (feeds.length === 1) {
                await confirmFeed(feeds[0])
            } else {
                setAvailableFeeds(feeds)
            }
        } catch (err: unknown) {
            if (err instanceof Error) setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const confirmFeed = async (feed: Feed) => {
        if (!db) return

        setLoading(true)
        setError(null)
        
        try {
            const { posts } = await parseRSSFeed(feed.href)

            if (posts.length === 0) {
                throw new Error("Aucun article trouvé dans ce flux RSS.")
            }

            let title = feed.title.split("»")[0].trim()
            await addSource(db, currentGroup, title, feed.href)
            const sources = await getSourcesByGroup(db, currentGroup)
            const savedSource = sources.find((s) => s.url === feed.href)
            if (!savedSource) throw new Error("Source introuvable après ajout.")

            const cutoff = new Date()
            cutoff.setDate(cutoff.getDate() - DAYS_LIMIT)

            for (const post of posts) {
                const publishedDate = post.publishedAt ? new Date(post.publishedAt) : null

                if (!publishedDate || isNaN(publishedDate.getTime())) continue
                if (publishedDate < cutoff) continue

                try {
                    await addPost(
                        db,
                        currentGroup,
                        savedSource.id,
                        post.title,
                        post.postUrl,
                        post.shortDesc,
                        post.content,
                        post.thumbnail,
                        publishedDate.toISOString()
                    )
                } catch {
                    // Silently skip duplicate posts (same URL already stored)
                }
            }

            setUrlInput('')
            setAvailableFeeds([])
            onGroupAdded()
            setShowAddLayer(false)
        } catch (err: unknown) {
            if (err instanceof Error) setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) setShowAddLayer(false)
    }

    return (
        <div className={`${styles.layer} ${showAddLayer ? styles.active : ''}`} onClick={handleOverlayClick}>
            <div className={styles.layerInner}>
                <div className={styles.layerHeader}>
                    <Container className={styles.container}>
                        <p className={styles.layerTitle}>
                            {currentStep === 1 && "Ajouter un groupe"}
                            {currentStep === 2 && "Ajouter une source"}
                        </p>
                        <button className={styles.layerClose} onClick={() => setShowAddLayer(false)}>
                            <span className={styles.layerCloseLine}></span>
                            <span className={styles.layerCloseLine}></span>
                        </button>
                    </Container>
                </div>
                <div className={styles.layerContent}>
                    <Container>
                        {currentStep === 1 &&
                            <input
                                type="text"
                                className={styles.layerInput}
                                value={nameInput}
                                placeholder="Nom du groupe"
                                onChange={(e) => { setNameInput(e.target.value); setError(null) }}
                            />
                        }

                        {currentStep === 2 && (
                            <>
                                <input
                                    type="url"
                                    className={styles.layerInput}
                                    value={urlInput}
                                    placeholder="URL de la source"
                                    onChange={(e) => { setUrlInput(e.target.value); setError(null); setAvailableFeeds([]) }}
                                />

                                {availableFeeds.length > 1 && (
                                    <>
                                        <p className={styles.layerFeedText}>Quel feed utiliser ?</p>
                                        <ul className={styles.layerFeedList}>
                                            {availableFeeds.map((feed) => (
                                                <li key={feed.href} className={styles.layerFeedItem}>
                                                    <button
                                                        type="button"
                                                        className={styles.layerFeedButton}
                                                        onClick={() => confirmFeed(feed)}
                                                        disabled={loading}
                                                    >
                                                        <span className={styles.layerFeedTitle}>{feed.title}</span>
                                                        <br/>
                                                        <span className={styles.layerFeedHref}>{feed.href}</span>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </>
                        )}

                        {error && <p className={styles.layerError}>{error}</p>}

                        {currentStep === 1 &&
                            <button type="button" className={styles.layerSubmit} onClick={handleAddGroup}>
                                Ajouter
                            </button>
                        }

                        {currentStep === 2 && availableFeeds.length === 0 &&
                            <button type="button" className={styles.layerSubmit} onClick={handleAddSource} disabled={loading}>
                                {loading ? "Recherche..." : "Ajouter"}
                            </button>
                        }

                        {currentStep === 2 && availableFeeds.length > 0 && loading &&
                            <p className={styles.layerFeedText}>Récupération des articles...</p>
                        }
                    </Container>
                </div>
            </div>
        </div>
    )
}

export default index