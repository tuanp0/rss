import React from 'react'
import { useLayerContext } from '@/context/LayerContext'

import styles from './PostItem.module.scss'

const index = () => {
  const { currentStep, currentNews } = useLayerContext()

  if (!currentNews) return null

  const getSiteName = (url: string): string => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  return (
    <section className={`
      ${styles.postItem}
      ${currentStep === 4 ? styles.active : ''}
    `}>
      <div className={styles.postItemInner}>
        <div className={styles.postItemSource}>{getSiteName(currentNews.url)}</div>
        <div className={styles.postItemTitle}>
          <a href={currentNews.url} target="_blank" rel="noreferrer">{currentNews.title}</a>
        </div>
        <time className={styles.postItemDate} dateTime={new Date(currentNews.publishedAt).toISOString()}>
          {new Date(currentNews.publishedAt).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </time>
        {/* {currentNews.thumbnail && (
          <img src={currentNews.thumbnail} alt={currentNews.title} className={styles.postItemThumbnail} />
        )} */}
        <div
          className={styles.postItemContent}
          dangerouslySetInnerHTML={{ __html: currentNews.content }}
        />
      </div>
    </section>
  )
}

export default index