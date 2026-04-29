import React from 'react'
import { useLayerContext } from '@/context/LayerContext'

import styles from './PostItem.module.scss'

const index = () => {
  const { currentStep, currentNews } = useLayerContext()
  // if (!currentNews) return null

  const getSiteName = (url: string): string => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  const formattedTime = currentNews ?
    new Date(currentNews.publishedAt).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }) +
    ' - ' +
    new Date(currentNews.publishedAt).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  : ''

  return (
    <section className={`
      ${styles.postItem}
      ${currentStep === 4 ? styles.active : ''}
    `}>
      <div className={styles.postItemInner}>
        <div className={styles.postItemSource}>{getSiteName(currentNews ? currentNews.url : '')}</div>
        <div className={styles.postItemTitle}>
          <a href={currentNews ? currentNews.url : ''} target="_blank" rel="noreferrer">{currentNews ? currentNews.title : ''}</a>
        </div>
        <time className={styles.postItemDate} dateTime={currentNews ? new Date(currentNews.publishedAt).toISOString() : ''}>
          {formattedTime}
        </time>
        {/* {currentNews.thumbnail && (
          <img src={currentNews.thumbnail} alt={currentNews.title} className={styles.postItemThumbnail} />
        )} */}
        <div
          className={styles.postItemDesc}
          dangerouslySetInnerHTML={{ __html: currentNews ? currentNews.shortDesc.replace(']]>', '').trim() : '' }}
        />
        {currentNews && (currentNews.shortDesc !== currentNews.content) &&
          <div
            className={styles.postItemContent}
            dangerouslySetInnerHTML={{ __html: currentNews ? currentNews.content.replace(']]>', '').trim() : '' }}
          />
        }
      </div>
    </section>
  )
}

export default index