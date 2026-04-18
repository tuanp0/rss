import { useState, useEffect } from 'react'
import { initDB, getPosts, getPostsByGroup, getPostsBySource, Post } from '@/db/groups'
import { useLayerContext } from '@/context/LayerContext'
import NewsItem from '@/components/NewsItem'

import styles from './NewsList.module.scss'

const index = () => {
  const { currentStep, currentGroup, currentSource, refreshTrigger } = useLayerContext()

  const [posts, setPosts] = useState<Post[]>([])
  const [db, setDb] = useState<IDBDatabase | null>(null)

  useEffect(() => {
    initDB()
      .then((database) => setDb(database))
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (!db) return

    if (currentSource) {
      getPostsBySource(db, currentSource)
        .then((posts) => setPosts([...posts].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())))
        .catch(console.error)
    } else if (currentGroup) {
      getPostsByGroup(db, currentGroup)
        .then((posts) => setPosts([...posts].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())))
        .catch(console.error)
    } else {
      getPosts(db)
        .then((posts) => setPosts([...posts].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())))
        .catch(console.error)
    }
  }, [db, currentGroup, currentSource, refreshTrigger])

  return (
    <section className={`
      ${styles.news}
      ${currentStep <= 2 ? styles.next : ''}
      ${currentStep === 3 ? styles.active : ''}
      ${currentStep >= 4 ? styles.past : ''}
    `}>
      {posts.length === 0 ? (
        <p className={styles.newsContentText}>Aucun article à afficher.</p>
      ) : (
        posts.map((post) => (
          <NewsItem
            key={post.id}
            title={post.title}
            shortDesc={post.shortDesc}
            content={post.content}
            url={post.url}
            thumbnail={post.thumbnail}
            publishedAt={post.publishedAt}
            post={post}
          />
        ))
      )}
    </section>
  )
}

export default index