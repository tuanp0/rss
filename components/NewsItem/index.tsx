import React from 'react'
import { Post } from '@/db/groups'
import { useLayerContext } from '@/context/LayerContext'
import Container from '@/components/Container'

import styles from './NewsItem.module.scss'

interface NewsItemTypes {
  title: string
  shortDesc: string
  content: string
  url: string
  thumbnail: string
  publishedAt: Date | string
  post: Post
}

const NewsItem = ({
  title,
  content,
  shortDesc,
  publishedAt,
  thumbnail,
  post
}: NewsItemTypes) => {
  const { setCurrentStep, setCurrentNews } = useLayerContext()

  const handleNextStep = () => {
    setCurrentStep(4)
    setCurrentNews(post)
  }

  // Format hour instead of date
  const formattedTime = new Date(publishedAt).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })

  const cleanDesc = shortDesc
    ?.replace('<![CDATA[', '')
    ?.replace(']]>', '')

  return (
    <div className={styles.newsItem} onClick={handleNextStep}>
      <Container className={styles.container}>
        <div className={styles.newsItemThumbnail}>
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className={styles.newsItemThumbnailImg}
            />
          ) : (
            <p className={styles.newsItemThumbnailText}>
              {title.slice(0, 1)}
            </p>
          )}
        </div>

        <div className={styles.newsItemContent}>
          <h2 className={styles.newsItemContentTitle}>
            {title.length > 60 ? title.slice(0, 60) + '...' : title}
          </h2>

          <time
            className={styles.newsItemContentDate}
            dateTime={new Date(publishedAt).toISOString()}
          >
            {formattedTime}
          </time>
        </div>
      </Container>
    </div>
  )
}

export default NewsItem