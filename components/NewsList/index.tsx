import React, { useState, useEffect, useRef } from 'react'
import { initDB, getPosts, getPostsByGroup, getPostsBySource, Post, refreshSource, refreshAllSources } from '@/db/groups'
import { checkOnline } from '@/lib/check-online'
import { useLayerContext } from '@/context/LayerContext'
import NewsItem from '@/components/NewsItem'

import styles from './NewsList.module.scss'

const NewsList = () => {
  const { currentStep, setCurrentStep, currentGroup, currentSource, refreshTrigger, showParametersLayer, showInformationsLayer, triggerRefresh, setOfflineAlert} = useLayerContext()

  const [posts, setPosts] = useState<Post[]>([])
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [refreshHeight, setRefreshHeight] = useState<number | null>(0)
  const [refreshingActive, setRefreshingActive] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [db, setDb] = useState<IDBDatabase | null>(null)
  const minSwipeDistance = 100

  const touchStartRef = useRef<number | null>(null)
  const newsRef = useRef<HTMLDivElement>(null)

  const getSiteName = (url: string): string => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  const onTouchStart = (e: React.TouchEvent) => {
    if (refreshing) return
    touchStartRef.current = e.targetTouches[0].clientY
  }

  const onTouchMove = (e :React.TouchEvent) => {
    if (touchStartRef.current === null || refreshing) return

    const currentY = e.targetTouches[0].clientY
    const distance = currentY - touchStartRef.current
    const scrollTop = e.currentTarget.scrollTop

    if (scrollTop === 0 && distance > 0) {
      const height = Math.min(distance / minSwipeDistance, 1)
      setRefreshHeight(height)
      setRefreshingActive(height >= 1)
    } else {
      setRefreshHeight(0)
      setRefreshingActive(false)
    }
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    touchStartRef.current = null

    if (refreshingActive) {
      handleRefresh()
    } else {
      setRefreshHeight(0)
      setRefreshingActive(false)
    }
  }

  const showOfflineBanner = () => {
    setOfflineAlert(true)
    setTimeout(() => setOfflineAlert(false), 4000)
  }

  const handleRefresh = async () => {
    const online = await checkOnline()
    if (!online) {
      showOfflineBanner()
      return
    }

    const db = await initDB()
    if (!db || currentSource === null || currentGroup === null) return

    setRefreshing(true)
    try {
      if (currentSource === null || currentSource === 0) {
        await refreshAllSources(db, currentGroup)
      } else {
        await refreshSource(db, currentSource, currentGroup)
      }

      triggerRefresh()
    } catch (err) {
      console.error(err)
    } finally {
      setRefreshing(false)
      setRefreshingActive(false)
      setRefreshHeight(0)
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
        ${showParametersLayer || showInformationsLayer ? styles.secondary : ''}
        ${currentStep === 3 ? styles.active : ''}
        ${currentStep >= 4 ? styles.past : ''}
      `}
      data-scroll="news"
      onTouchStart={(e) => onTouchStart(e)}
      onTouchMove={(e) => onTouchMove(e)}
      onTouchEnd={(e) => onTouchEnd(e)}
      ref={newsRef}
    >
      <span className={`${styles.newsRefresh} ${refreshing ? styles.spin: ''} ${refreshingActive ? styles.active : ''}`} style={{ opacity: `${refreshHeight}` }}>
        <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.newsRefreshIcon}>
          <path d="M4.06189 13C4.02104 12.6724 4 12.3387 4 12C4 7.58172 7.58172 4 12 4C14.5006 4 16.7332 5.14727 18.2002 6.94416M19.9381 11C19.979 11.3276 20 11.6613 20 12C20 16.4183 16.4183 20 12 20C9.61061 20 7.46589 18.9525 6 17.2916M9 17H6V17.2916M18.2002 4V6.94416M18.2002 6.94416V6.99993L15.2002 7M6 20V17.2916" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
      {posts.length === 0 ? (
        currentStep == 2 && <p className={styles.newsText}>Aucun article à afficher.</p>
      ) : (
        <div className={styles.newsContent}>
          <span className={styles.newsContentPrev} onClick={() => setCurrentStep(2)}></span>
          {Object.entries(groupedPosts).map(([date, posts]) => (
            <div key={date}>
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
                  newsId={post.id}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default NewsList