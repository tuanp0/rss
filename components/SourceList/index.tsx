import { useLayerContext } from '@/context/LayerContext'

import Container from '@/components/Container'

import styles from './SourceList.module.scss'

const index = () => {
  const { currentStep } = useLayerContext()

  return (
    <section
      className={`
        ${styles.sources}
        ${currentStep === 2 ? styles.active : ''}
      `}
    >
        <Container>
          Toutes les sources
          
        </Container>
    </section>
  )
}

export default index