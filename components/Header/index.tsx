'use client'
import Container from '@/components/Container'
import Button from '@/components/Button'

import styles from './Header.module.scss'

const Header = () => {

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <Container className={styles.headerContainer}>
          <p className={styles.headerTitle}><span className={styles.headerTitleSpan}>TP Reader</span></p>
        </Container>
      </div>
    </header>
  )
}

export default Header