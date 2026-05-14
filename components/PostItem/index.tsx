import React, {useEffect, useRef} from 'react'
import { useLayerContext } from '@/context/LayerContext'

import styles from './PostItem.module.scss'

const index = () => {
  const { currentStep, currentNews, activeFont } = useLayerContext()
  const postRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    postRef.current?.scrollTo(0,0)
  }, [currentNews])

  return (
    <section
      className={`
        ${styles.postItem}
        ${currentStep === 4 ? styles.active : ''}
      `}
     ref={postRef}
    >
      <div className={styles.postItemInner}>
        <div className={styles.postItemSource}>{getSiteName(currentNews ? currentNews.url : '')}</div>
        <div
          className={`
            ${styles.postItemTitle}
            ${activeFont === 'sansserif' ? `font-sansserif` : ''}
            ${activeFont === 'monospace' ? `font-monospace` : ''}
            ${activeFont === 'handwritten' ? `font-handwritten` : ''}
            ${activeFont === 'script' ? `font-script` : ''}
          `}
        >
          <a href={currentNews ? currentNews.url : ''} target="_blank" rel="noreferrer">{currentNews ? currentNews.title : ''}</a>
        </div>
        <time className={styles.postItemDate} dateTime={currentNews ? new Date(currentNews.publishedAt).toISOString() : ''}>
          {formattedTime}
        </time>

        {/* {currentNews.thumbnail && (
          <img src={currentNews.thumbnail} alt={currentNews.title} className={styles.postItemThumbnail} />
        )} */}
        
        <div
          className={`
            ${styles.postItemDesc}
            ${activeFont === 'sansserif' ? `font-sansserif` : ''}
            ${activeFont === 'monospace' ? `font-monospace` : ''}
            ${activeFont === 'handwritten' ? `font-handwritten` : ''}
            ${activeFont === 'script' ? `font-script` : ''}
          `}
          dangerouslySetInnerHTML={{ __html: currentNews ? currentNews.shortDesc.replace(']]>', '').trim() : '' }}
        />

        {currentNews && (currentNews.shortDesc !== currentNews.content) &&
          <div
            className={`
              ${styles.postItemContent}
              ${activeFont === 'sansserif' ? `font-sansserif` : ''}
              ${activeFont === 'monospace' ? `font-monospace` : ''}
              ${activeFont === 'handwritten' ? `font-handwritten` : ''}
              ${activeFont === 'script' ? `font-script` : ''}
            `}
            dangerouslySetInnerHTML={{ __html: currentNews ? currentNews.content.replace(']]>', '').trim() : '' }}
          />
        }

      </div>
    </section>
  )
}

export default index