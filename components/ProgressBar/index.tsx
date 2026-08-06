import React from 'react'

import styles from './ProgressBar.module.scss'

interface ProgressBarTypes {
    width: number
}

const index = ({width}:ProgressBarTypes) => {
  return (
    <div className={styles.progressBar}>
      <span style={{ width: `${width}%` }}></span>
    </div>
  )
}

export default index