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
      </div>
    </section>
  )
}

export default index