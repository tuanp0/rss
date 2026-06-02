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
  newsId: number
}

const NewsItem = ({
  title,
  content,
  url,
  shortDesc,
  publishedAt,
  thumbnail,
  post,
  newsId
}: NewsItemTypes) => {
  const { currentStep, setCurrentStep, currentSource, currentNews, setCurrentNews, setCurrentNewsObject } = useLayerContext()

  const handleNextStep = () => {
    setCurrentStep(4)
    setCurrentNews(newsId)
    setCurrentNewsObject(post)
  }

  // Format hour instead of date
  const formattedTime = new Date(publishedAt).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })

  const cleanDesc = shortDesc
    ?.replace('<![CDATA[', '')
    ?.replace(']]>', '')

  const firstCharTitle = title.startsWith('『') || title.startsWith('"')  || title.startsWith('“') || title.startsWith('【') ?
    title.slice(1, 2)
  :
    title.slice(0, 1)

  const truncate = (text: string, maxWidth: number): string => {
      let width = 0
      let result = ''
  
      for (const char of text) {
        const code = char.codePointAt(0) ?? 0
        const isFullWidth = (
          (code >= 0x1100 && code <= 0x115F) ||
          (code >= 0x2E80 && code <= 0x303F) ||
          (code >= 0x3040 && code <= 0x33FF) ||
          (code >= 0xAC00 && code <= 0xD7AF) ||
          (code >= 0xF900 && code <= 0xFAFF) ||
          (code >= 0xFF01 && code <= 0xFF60) ||
          (code >= 0xFFE0 && code <= 0xFFE6) ||
          (code >= 0x20000 && code <= 0x2FA1F)
        )
        width += isFullWidth ? 2 : 1
        if (width > maxWidth) return result + '...'
        result += char
      }
  
      return result
    }

  return (
    <div className={`${styles.newsItem} ${newsId === currentNews && currentStep >= 4 ? styles.active : ''}`} onClick={handleNextStep}>
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
              {firstCharTitle}
            </p>
          )}
        </div>

        <div className={styles.newsItemContent}>
          <div className={styles.newsItemContentInfo}>
            {currentSource === 0 && <span className={styles.newsItemContentSite}>{url}</span>}
            <time
              className={styles.newsItemContentDate}
              dateTime={new Date(publishedAt).toISOString()}
            >
              {formattedTime}
            </time>
          </div>
          <h2 className={styles.newsItemContentTitle}>
            {title ? truncate(title, 70) : title}
          </h2>
        </div>
      </Container>
    </div>
  )
}

export default NewsItem