'use client'
import { useEffect, useState, useRef } from 'react'
import { initDB, getSourcesByGroup, getPostsCountBySource } from '@/db/groups'
import { useLayerContext } from '@/context/LayerContext'
import SourceItem from '@/components/SourceItem'

import styles from './SourceList.module.scss'

interface Source {
  id: number
  groupId: number
  name: string
  url: string
  favicon: string
  postsCount: number
}

interface SourcesTypes {
  onReady: (refresh: () => void) => void;
}

const SourceList = ({ onReady }: SourcesTypes) => {
  const { currentStep, setCurrentStep, currentGroup, showAddLayer, showDeleteLayer } = useLayerContext()
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [db, setDb] = useState<IDBDatabase | null>(null)

  const sourceRef = useRef<HTMLDivElement>(null)

  const fetchSources = (dbInstance: IDBDatabase) => {
    getSourcesByGroup(dbInstance, currentGroup)
      .then(async (sources) => {
        const sourcesWithCounts = await Promise.all(
          sources.map(async (source) => ({
            ...source,
            postsCount: await getPostsCountBySource(dbInstance, source.id)
          }))
        )
        setSources(sourcesWithCounts)
        setLoading(false)
      })
      .catch(console.error)
  }

  const getSiteName = (url: string): string => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  useEffect(() => {
    initDB()
      .then((dbInstance) => {
        setDb(dbInstance)
        fetchSources(dbInstance)
        onReady(() => fetchSources(dbInstance))
      })
      .catch(console.error)
  }, [currentGroup])

  useEffect(() => {
    initDB()
      .then((dbInstance) => {
        setDb(dbInstance)
        fetchSources(dbInstance)
        onReady(() => fetchSources(dbInstance))
      })
      .catch(console.error)
  }, [])

  return (
    <section
      className={`
        ${styles.source}
        ${showAddLayer || showDeleteLayer ? styles.secondary : ''}
        ${currentStep === 2 ? styles.active : ''}
        ${currentStep >= 3 ? styles.past : ''}
      `}
      data-scroll="source"
      ref={sourceRef}
    >
      
      <div className={styles.sourceContent}>
        {loading && <p className={styles.sourceContentText}>Chargement...</p>}
        {!loading && sources.length === 0 && currentStep == 2 &&
          <>
            <p className={styles.sourceContentText}>
              <strong>Ajouter une source en cliquant sur l'icône "+"<br/>
              en bas à droite.</strong><br/>
              (ex: https://fujixweekly.com)
            </p>
            <br/>
            <p className={styles.sourceContentText}>
              <strong>Swiper la source vers la droite<br/>
              pour la supprimer.</strong>
            </p>
            <br/>
            <p className={styles.sourceContentText}>
              <strong>Toucher la tranche gauche de l'écran<br/>
              ou cliquer sur la flèche gauche<br/>
              pour revenir à l'étape précédente</strong>
            </p>
          </>
        }
        <span className={styles.sourcePrev} onClick={() => setCurrentStep(1)}></span>
        {!loading && sources.length > 0 && (
          <div className={styles.sourceList}>
            <div className={styles.sourceListAll}>
              <SourceItem
                name={'Toutes les sources'}
                icon={'star'}
                sourceId={0}
                postsCount={sources.reduce((sum, s) => sum + s.postsCount, 0)}
                onDelete={() => db && fetchSources(db)}
              />
            </div>
            {sources.map((source, key) => (
              <SourceItem
                icon={source.favicon}
                name={getSiteName(source.name)}
                key={source.id}
                sourceId={source.id}
                postsCount={source.postsCount}
                onDelete={() => db && fetchSources(db)}
              />
            ))}
            <span className={styles.sourceContentCount}>{sources.length} {sources.length <= 1 ? 'source' : 'sources'}</span>
          </div>
        )}
      </div>
    </section>
  )
}

export default SourceList