import React, { useState, useEffect, useRef } from 'react'
import { initDB, getPosts, getPostsByGroup, getPostsBySource, Post } from '@/db/groups'
import { useLayerContext } from '@/context/LayerContext'
import NewsItem from '@/components/NewsItem'

import styles from './NewsList.module.scss'

const NewsList = () => {
  const { currentStep, currentGroup, currentSource, refreshTrigger } = useLayerContext()
  const [posts, setPosts] = useState<Post[]>([])
  const [db, setDb] = useState<IDBDatabase | null>(null)
  const newsRef = useRef<HTMLDivElement>(null);

  const getSiteName = (url: string): string => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  useEffect(() => {
    newsRef.current?.scrollTo(0,0)
  }, [currentSource])

  useEffect(() => {
    initDB()
      .then((database) => setDb(database))
      .catch(console.error)
  }, [])

  const sortPosts = (posts: Post[]) =>
    [...posts].sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() -
        new Date(a.publishedAt).getTime()
    )

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

  return (
    <section
      className={`
        ${styles.news}
        ${currentStep === 3 ? styles.active : ''}
        ${currentStep >= 4 ? styles.past : ''}
      `}
      ref={newsRef}
    >
      {posts.length === 0 ? (
        <p className={styles.newsContentText}>Aucun article à afficher.</p>
      ) : (
        Object.entries(groupedPosts).map(([date, posts]) => (
          <React.Fragment key={date}>
            <div className={styles.newsContentDay}><p>{date}</p></div>

            {posts.map((post) => (
              <NewsItem
                key={post.id}
                title={post.title}
                shortDesc={post.shortDesc}
                content={post.content}
                url={getSiteName(post.url)}
                thumbnail={post.thumbnail}
                publishedAt={post.publishedAt}
                post={post}
              />
            ))}
          </React.Fragment>
        ))
      )}
    </section>
  )
}

export default NewsList