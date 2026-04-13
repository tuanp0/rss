import React from 'react'
import { useLayerContext } from '@/context/LayerContext'
import Container from '@/components/Container'

import styles from './NewsItem.module.scss'

interface NewsItemTypes {
    image: string
    title: string
    shortDesc: string
}

const index = ({image, title, shortDesc}:NewsItemTypes) => {
  const { setCurrentStep, setShowDeleteLayer, setSelectedGroupId, setSelectedGroupName } = useLayerContext()

  return (
    <div className={styles.newsItem}>
      <Container className={styles.container}>
        <div className={styles.newsItemThumbnail}>
            <img src={image}  className={styles.newsItemThumbnailImg}/>
        </div>
        <div className={styles.newsItemContent}>
            <h2 className={styles.newsItemContentTitle}>{title}</h2>
            <p className={styles.newsItemContentDesc}>{shortDesc}</p>
        </div>
      </Container>
    </div>
  )
}

export default index