import React, {useEffect, useRef} from 'react'
import { useLayerContext } from '@/context/LayerContext'

import styles from './PostItem.module.scss'

const index = () => {
  const { currentStep, currentNewsObject, activeFont, showParametersLayer, showInformationsLayer, setPostIsPastHeader } = useLayerContext()
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

  const handleScroll = () => {
    const headerTop = parseFloat(
      getComputedStyle(document.documentElement)
        .getPropertyValue("--headerTop")
    );

    let ticking = false;

    if (!ticking) {
      requestAnimationFrame(() => {
        if(postRef.current) {
          setPostIsPastHeader(postRef.current.scrollTop > headerTop - 30);
          ticking = false;
        }
      });
      ticking = true;
    }
  };

  useEffect(() => {
    postRef.current?.scrollTo(0,0)
  }, [currentNewsObject])

  useEffect(() => {
    const postR = postRef.current;
    if (!postR) return;

    postR.addEventListener("scroll", handleScroll, { passive: true });
    return () => postR.removeEventListener("scroll", handleScroll);
  }, [])

  return (
    <section
      className={`
        ${styles.postItem}
        ${showParametersLayer || showInformationsLayer ? styles.secondary : ''}
        ${currentStep === 4 ? styles.active : ''}
      `}
     ref={postRef}
    >
      <div className={styles.postItemInner}>
        <div className={styles.postItemSource}>{getSiteName(currentNewsObject ? currentNewsObject.url : '')}</div>
        <div
          className={`
            ${styles.postItemTitle}
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