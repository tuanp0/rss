'use client'
import { useEffect, useState } from 'react'
import { initDB, getGroups } from '@/db/groups'
import Container from '@/components/Container'
import GroupItem from '@/components/GroupItem'
import Button from '@/components/Button'
import styles from './GroupList.module.scss'

interface Group {
  id: number;
  title: string;
}

interface GroupsTypes {
  showAddLayer: boolean;
  setShowAddLayer: (value: boolean) => void;
  onReady: (refresh: () => void) => void;
}

const index = ({ showAddLayer, setShowAddLayer, onReady }: GroupsTypes) => {
  const [groups, setGroups] = useState<Group[]>([])
  const [db, setDb] = useState<IDBDatabase | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

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
        onReady(() => fetchGroups(dbInstance)) // expose refresh to parent
      })
      .catch(console.error)
  }, [])

  return (
    <section className={`${styles.group} ${showAddLayer ? styles.secondary : ''}`}>
      <div className={styles.groupHeader}>
        <Container className={styles.groupHeaderContainer}>
          <Button text="Ajouter un groupe" action={() => setShowAddLayer(true)} icon={'parameter'} />
          <p className={styles.groupHeaderTitle}>TP RSS</p>
          <Button text="Ajouter un groupe" action={() => setShowAddLayer(true)} icon={'add'} />
        </Container>
      </div>

      <div className={styles.groupContent}>
        {loading && <p className={styles.groupContentText}>Chargement...</p>}
        {!loading && groups.length === 0 && <p className={styles.groupContentText}>Aucun groupe</p>}
        {!loading && groups.length > 0 && (
          <div className={styles.groupList}>
            {groups.map((group) => (
              <GroupItem text={group.title} key={group.id} itemCount={2} />
            ))}
          </div>
        )}

        
      </div>
    </section>
  )
}

export default index