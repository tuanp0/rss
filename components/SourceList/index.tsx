'use client'
import { useEffect, useState } from 'react'
import { initDB, getSourcesByGroup } from '@/db/groups'
import { useLayerContext } from '@/context/LayerContext'
import SourceItem from '@/components/SourceItem'

import styles from './SourceList.module.scss'

interface Source {
  id: number
  groupId: number
  name: string
  url: string
  favicon: string  
}

interface SourcesTypes {
  onReady: (refresh: () => void) => void;
}

const SourceList = ({ onReady }: SourcesTypes) => {
  const { currentStep, currentGroup, showAddLayer } = useLayerContext()
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [db, setDb] = useState<IDBDatabase | null>(null)

  const fetchSources = (dbInstance: IDBDatabase) => {
    getSourcesByGroup(dbInstance, currentGroup)
      .then((sources) => {
        setSources(sources)
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
        ${showAddLayer ? styles.secondary : ''}
        ${currentStep === 2 ? styles.active : ''}
        ${currentStep >= 3 ? styles.past : ''}
      `}
    >
      <div className={styles.sourceContent}>
        {loading && <p className={styles.sourceContentText}>Chargement...</p>}
        {!loading && sources.length === 0 && <p className={styles.sourceContentText}>Aucune source</p>}
        {!loading && sources.length > 0 && (
          <div className={styles.sourceList}>
            <SourceItem name={'Toutes les sources'} icon={'star'} sourceId={0} onDelete={() => db && fetchSources(db)}/>
            {sources.map((source, key) => (
              <SourceItem icon={source.favicon} name={getSiteName(source.name)} key={key} sourceId={source.id} onDelete={() => db && fetchSources(db)} />
            ))}
            <span className={styles.sourceContentCount}>{sources.length} {sources.length <= 1 ? 'source' : 'sources'}</span>
          </div>
        )}
      </div>
    </section>
  )
}

export default SourceList