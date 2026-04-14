'use client'
import { useEffect, useState } from 'react'
import { initDB, getGroups, getSourcesCountByGroup } from '@/db/groups'
import { useLayerContext } from '@/context/LayerContext'
import GroupItem from '@/components/GroupItem'

import styles from './GroupList.module.scss'

interface Group {
  id: number
  title: string
  count: number
}

interface GroupsTypes {
  onReady: (refresh: () => void) => void
}

const GroupList = ({ onReady }: GroupsTypes) => {
  const { currentStep, showAddLayer } = useLayerContext()
  const [groups, setGroups] = useState<Group[]>([])
  const [sourceCount, setSourceCount] = useState<Group[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [db, setDb] = useState<IDBDatabase | null>(null)

  const fetchGroups = (dbInstance: IDBDatabase) => {
    Promise.all([
      getGroups(dbInstance),
      getSourcesCountByGroup(dbInstance)
    ])
      .then(([groups, counts]) => {
        const groupsWithCount = groups.map((group) => ({
          ...group,
          count: counts[group.id] || 0
        }))

        setGroups(groupsWithCount)
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
        ${currentStep >= 2 ? styles.past : ''}
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
                groupId={group.id}
                itemCount={group.count}
                onDelete={() => db && fetchGroups(db)}
              />
            ))}
            <span className={styles.groupContentCount}>{groups.length} {groups.length <= 1 ? 'groupe' : 'groupes'}</span>
          </div>
        )}
      </div>
    </section>
  )
}

export default GroupList