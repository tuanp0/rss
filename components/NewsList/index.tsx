import { useState, useEffect } from 'react'
import { initDB, getPosts, getPostsByGroup, getPostsBySource, Post } from '@/db/groups'
import { useLayerContext } from '@/context/LayerContext'
import NewsItem from '@/components/NewsItem'

import styles from './NewsList.module.scss'

const NewsList = () => {
  const { currentStep, currentGroup, currentSource, refreshTrigger } = useLayerContext()

  const [posts, setPosts] = useState<Post[]>([])
  const [db, setDb] = useState<IDBDatabase | null>(null)

  // Init DB
  useEffect(() => {
    initDB()
      .then((database) => setDb(database))
      .catch(console.error)
  }, [])

  // Sort helper
  const sortPosts = (posts: Post[]) =>
    [...posts].sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() -
        new Date(a.publishedAt).getTime()
    )

  // Fetch posts
  useEffect(() => {
    if (!db) return

    const fetchData = async () => {
      try {
        let data: Post[] = []

        if (currentSource) {
          data = await getPostsBySource(db, currentSource)
        } else if (currentGroup) {
          data = await getPostsByGroup(db, currentGroup)
        } else {
          data = await getPosts(db)
        }

        setPosts(sortPosts(data))
      } catch (error) {
        console.error(error)
      }
    }

    fetchData()
  }, [db, currentGroup, currentSource, refreshTrigger])

  // Group posts by date
  const groupPostsByDate = (posts: Post[]) => {
    return posts.reduce((groups: Record<string, Post[]>, post) => {
      const dateKey = new Date(post.publishedAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })

      if (!groups[dateKey]) {
        groups[dateKey] = []
      }

      groups[dateKey].push(post)
      return groups
    }, {})
  }

  const groupedPosts = groupPostsByDate(posts)
  console.log(groupedPosts)
  return (
    <section
      className={`
        ${styles.news}
        ${currentStep <= 2 ? styles.next : ''}
        ${currentStep === 3 ? styles.active : ''}
        ${currentStep >= 4 ? styles.past : ''}
      `}
    >
      {posts.length === 0 ? (
        <p className={styles.newsContentText}>Aucun article à afficher.</p>
      ) : (
        Object.entries(groupedPosts).map(([date, posts]) => (
          <div key={date} className={styles.newsGroup}>
            <p className={styles.newsContentDay}>{date}</p>

            {posts.map((post) => (
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
            ))}
          </div>
        ))
      )}
    </section>
  )
}

export default NewsList