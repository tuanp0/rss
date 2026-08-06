import React, { useState, useEffect, useRef, useCallback } from 'react'
import { initDB, setPostReadStatus } from '@/db/groups'
import { useLayerContext } from '@/context/LayerContext'
import ProgressBar from '@/components/ProgressBar'

import styles from './PostItem.module.scss'

const index = () => {
  const { currentStep, setCurrentStep, currentNewsObject, activeFont, triggerRefresh } = useLayerContext()
  const postRef = useRef<HTMLDivElement>(null);
  const [progressNews, setProgressNews]= useState<number | 0>(0)
  const hasMarkedFullyRead = useRef(false);

  const getSiteName = (url: string): string => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  const formattedTime = currentNewsObject ?
    new Date(currentNewsObject.publishedAt).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }) +
    ' - ' +
    new Date(currentNewsObject.publishedAt).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  : ''

  useEffect(() => {
    setTimeout(() => {
      postRef.current?.scrollTo(0, 0)
    }, 10)

    hasMarkedFullyRead.current = false

    if (currentNewsObject?.id != null && currentNewsObject?.readStatus != 2) {
      initDB()
        .then((db) => setPostReadStatus(db, currentNewsObject.id, 1))
        .catch((err) => console.error('Failed to mark post as opened', err))
    }
  }, [currentNewsObject])

  const handleScroll = useCallback(() => {
    if (!postRef.current || !currentNewsObject?.id) return

    const el = postRef.current
    const maxScroll = el.scrollHeight - el.clientHeight

    if (maxScroll <= 0) {
      hasMarkedFullyRead.current = true
      initDB()
        .then((db) => setPostReadStatus(db, currentNewsObject.id, 2))
        .catch((err) => console.error('Failed to mark post as fully read', err))
      return
    }

    const progress = Math.min((el.scrollTop / maxScroll) * 100 + 2, 100)
    // setProgressNews(progress)
    const reachedEnd = progress >= 100

    if (reachedEnd) {
      hasMarkedFullyRead.current = true
      initDB()
        .then((db) => setPostReadStatus(db, currentNewsObject.id, 2))
        .catch((err) => console.error('Failed to mark post as fully read', err))
    }
  }, [currentNewsObject])

  return (
    <section
      className={`
        ${styles.postItem}
        ${currentStep === 4 ? styles.active : ''}
      `}
      data-scroll="post"
      ref={postRef}
      onScroll={handleScroll}
    >
      {currentNewsObject &&
        <div className={styles.postItemInner}>
          <span className={styles.postItemPrev}
            onClick={() => {
              setCurrentStep(3)
            }}></span>
          <div className={styles.postItemSource}>{getSiteName(currentNewsObject ? currentNewsObject.url : '')}</div>
          <div
            className={`
              ${styles.postItemTitle}
              ${activeFont === 'default' ? `font-serif` : ''}
              ${activeFont === 'sansserif' ? `font-sansserif` : ''}
              ${activeFont === 'gabriela' ? `font-gabriela` : ''}
              ${activeFont === 'monospace' ? `font-monospace` : ''}
              ${activeFont === 'typewriter' ? `font-typewriter` : ''}
            `}
          >
            <a href={currentNewsObject ? currentNewsObject.url : ''} target="_blank" aria-label={currentNewsObject ? currentNewsObject.title : ''} rel="noreferrer">
              {currentNewsObject ? currentNewsObject.title : ''}
            </a>
          </div>
          <time
            className={`
              ${styles.postItemDate}
              ${activeFont === 'default' ? `font-serif` : ''}
              ${activeFont === 'sansserif' ? `font-sansserif` : ''}
              ${activeFont === 'gabriela' ? `font-gabriela` : ''}
              ${activeFont === 'monospace' ? `font-monospace` : ''}
              ${activeFont === 'typewriter' ? `font-typewriter` : ''}
            `} dateTime={currentNewsObject ? new Date(currentNewsObject.publishedAt).toISOString() : ''}>
            {formattedTime}
          </time>

          {/* {currentNewsObject.thumbnail && (
            <img src={currentNewsObject.thumbnail} alt={currentNewsObject.title} className={styles.postItemThumbnail} />
          )} */}
          
          <div
            className={`
              ${styles.postItemDesc}
              ${activeFont === 'default' ? `font-serif` : ''}
              ${activeFont === 'sansserif' ? `font-sansserif` : ''}
              ${activeFont === 'gabriela' ? `font-gabriela` : ''}
              ${activeFont === 'monospace' ? `font-monospace` : ''}
              ${activeFont === 'typewriter' ? `font-typewriter` : ''}
            `}
            dangerouslySetInnerHTML={{ __html: currentNewsObject ? currentNewsObject.shortDesc.replace(']]>', '').trim() : '' }}
          />

          {/* {currentNewsObject && (currentNewsObject.shortDesc !== currentNewsObject.content) && */}
            <div
              className={`
                ${styles.postItemContent}
                ${activeFont === 'default' ? `font-serif` : ''}
                ${activeFont === 'sansserif' ? `font-sansserif` : ''}
                ${activeFont === 'gabriela' ? `font-gabriela` : ''}
                ${activeFont === 'monospace' ? `font-monospace` : ''}
                ${activeFont === 'typewriter' ? `font-typewriter` : ''}
              `}
              dangerouslySetInnerHTML={{ __html: currentNewsObject ? currentNewsObject.content.replace(']]>', '').trim() : '' }}
            />
          {/* } */}
          
        </div>
        
      }
      {/* <ProgressBar width={progressNews} /> */}
    </section>
  )
}

export default index