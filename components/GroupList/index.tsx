'use client'
import { useEffect, useState } from 'react'
import { initDB, getGroups } from '@/db/groups'
import { useLayerContext } from '@/context/LayerContext'
import GroupItem from '@/components/GroupItem'
import styles from './GroupList.module.scss'

interface Group {
  id: number;
  title: string;
}

interface GroupsTypes {
  onReady: (refresh: () => void) => void;
}

const GroupList = ({ onReady }: GroupsTypes) => {
  const { currentStep, showAddLayer } = useLayerContext()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [db, setDb] = useState<IDBDatabase | null>(null)

  const fetchGroups = (dbInstance: IDBDatabase) => {
    getGroups(dbInstance)
      .then((groups) => {
        setGroups(groups)
        setLoading(false)
      })
      .catch(console.error)
  }

  useEffect(() => {
    initDB()
      .then((dbInstance) => {
        setDb(dbInstance)
        fetchGroups(dbInstance)
        onReady(() => fetchGroups(dbInstance))
      })
      .catch(console.error)
  }, [])

  return (
    <section
      className={`
        ${styles.group}
        ${showAddLayer ? styles.secondary : ''}
        ${currentStep === 1 ? styles.active : ''}
      `}
    >
      <div className={styles.groupContent}>
        {loading && <p className={styles.groupContentText}>Chargement...</p>}
        {!loading && groups.length === 0 && <p className={styles.groupContentText}>Aucun groupe</p>}
        {!loading && groups.length > 0 && (
          <div className={styles.groupList}>
            {groups.map((group) => (
              <GroupItem
                text={group.title}
                key={group.id}
                id={group.id}
                itemCount={2}
                onDelete={() => db && fetchGroups(db)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default GroupList