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

const index = ({ title, content, shortDesc, publishedAt, thumbnail, post }: NewsItemTypes) => {
  const { setCurrentStep, setCurrentNews } = useLayerContext()

  const handleNextStep = () => {
    setCurrentStep(4)
    setCurrentNews(post)
  }

  const formattedDate = new Date(publishedAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const cleanDesc = shortDesc
    ?.replace('<![CDATA[', '')
    ?.replace(']]>', '');

  return (
    <div className={styles.newsItem} onClick={handleNextStep}>
      <Container className={styles.container}>
        <div className={styles.newsItemThumbnail}>
            {thumbnail && <img src={thumbnail} alt={title} className={styles.newsItemThumbnailImg}/>}
        </div>
        <div className={styles.newsItemContent}>
            <h2 className={styles.newsItemContentTitle}>{title}</h2>
            {/* <p className={styles.newsItemContentDesc} dangerouslySetInnerHTML={{__html: cleanDesc}} /> */}
            <time className={styles.newsItemContentDate} dateTime={new Date(publishedAt).toISOString()}>
              {formattedDate}
            </time>
        </div>
      </Container>
    </div>
  )
}

export default index