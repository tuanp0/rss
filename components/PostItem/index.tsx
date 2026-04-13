import React from 'react'
import { useLayerContext } from '@/context/LayerContext'

import styles from './PostItem.module.scss'

const index = () => {
  const { currentStep } = useLayerContext()

  return (
    <div className={`
        ${styles.postItem}
        ${currentStep === 4 ? styles.active : ''}
    `}>
      <div className={styles.postItemSource}><a href="">35mmc</a></div>
      <div className={styles.postItemTitle}><a href="">One from the first roll</a></div>
      <div className={styles.postItemContent}>About a month ago (mid-February) I decided that I had an un-used mFT lens sitting in a drawer that I hadn’t used for years. After checking eBay for camera prices I figured</div>
    </div>
  )
}

export default index