import { useLayerContext } from '@/context/LayerContext'
import SouceItem from '@/components/SourceItem'

import styles from './SourceList.module.scss'

const index = () => {
  const { currentStep } = useLayerContext()

  return (
    <section
      className={`
        ${styles.source}
        ${currentStep === 2 ? styles.active : ''}
      `}
    >
      <div className={styles.sourceList}>
        <SouceItem name={'Toutes les sources'} icon={'star'}/>
        <SouceItem name={'Source 1'} />
        <SouceItem name={'Source 2'} />
        <SouceItem name={'Source 3'} />
        <SouceItem name={'Source 4'} />
        <SouceItem name={'Source 5'} />
      </div>
    </section>
  )
}

export default index