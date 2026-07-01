import React, {useEffect, useRef} from 'react'
import { useLayerContext } from '@/context/LayerContext'

import styles from './PostItem.module.scss'

const index = () => {
  const { currentStep, currentNewsObject, activeFont, showParametersLayer, showInformationsLayer } = useLayerContext()
  const postRef = useRef<HTMLDivElement>(null);

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
    postRef.current?.scrollTo(0,0)
  }, [currentNewsObject])

  return (
    <section
      className={`
        ${styles.postItem}
        ${showParametersLayer || showInformationsLayer ? styles.secondary : ''}
        ${currentStep === 4 ? styles.active : ''}
      `}
      data-scroll="post"
      ref={postRef}
    >
      <div className={styles.postItemInner}>
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
          <a href={currentNewsObject ? currentNewsObject.url : ''} target="_blank" rel="noreferrer">{currentNewsObject ? currentNewsObject.title : ''}</a>
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
    </section>
  )
}

export default index