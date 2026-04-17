import { useLayerContext } from '@/context/LayerContext'
import NewsItem from '@/components/NewsItem'

import styles from './NewsList.module.scss'

const index = () => {
  const { currentStep } = useLayerContext()

  return (
    <section className={`
      ${styles.news}
      ${currentStep <= 2 ? styles.next : ''}
      ${currentStep === 3 ? styles.active : ''}
      ${currentStep >= 4 ? styles.past : ''}
    `}>
      <NewsItem
        image={`https://www.35mmc.com/wp-content/uploads/2026/03/03-small.png`}
        title={'One from the first roll'}
        shortDesc={'About a month ago (mid-February) I decided that I had an un-used mFT lens sitting in a drawer that I hadn’t used for years. After checking eBay for camera prices I figured'}
      />
      <NewsItem
        image={`https://www.35mmc.com/wp-content/uploads/2026/03/05-1.jpg`}
        title={'Tokyoites 2007~2009'}
        shortDesc={'The 28mm has always been my favourite lens for capturing crowds. It lets you frame plenty of action without introducing too much distortion. During my years living in Tokyo I re'}
      />
      <NewsItem
        image={`https://www.35mmc.com/wp-content/uploads/2026/03/New-Design-91.png`}
        title={'Why being bad at photography led me to create the world’s first digital ‘light meter watch'}
        shortDesc={'Ever wondered if you can learn manual exposure without having a camera in your hand? It’s an odd question and to be honest I wouldn’t blame you if you hadn’t. But it’s a questio'}
      />
      <NewsItem
        image={`https://www.35mmc.com/wp-content/uploads/2026/03/03-small.png`}
        title={'One from the first roll'}
        shortDesc={'About a month ago (mid-February) I decided that I had an un-used mFT lens sitting in a drawer that I hadn’t used for years. After checking eBay for camera prices I figured'}
      />
      <NewsItem
        image={`https://www.35mmc.com/wp-content/uploads/2026/03/05-1.jpg`}
        title={'Tokyoites 2007~2009'}
        shortDesc={'The 28mm has always been my favourite lens for capturing crowds. It lets you frame plenty of action without introducing too much distortion. During my years living in Tokyo I re'}
      />
      <NewsItem
        image={`https://www.35mmc.com/wp-content/uploads/2026/03/New-Design-91.png`}
        title={'Why being bad at photography led me to create the world’s first digital ‘light meter watch'}
        shortDesc={'Ever wondered if you can learn manual exposure without having a camera in your hand? It’s an odd question and to be honest I wouldn’t blame you if you hadn’t. But it’s a questio'}
      />
      <NewsItem
        image={`https://www.35mmc.com/wp-content/uploads/2026/03/03-small.png`}
        title={'One from the first roll'}
        shortDesc={'About a month ago (mid-February) I decided that I had an un-used mFT lens sitting in a drawer that I hadn’t used for years. After checking eBay for camera prices I figured'}
      />
      <NewsItem
        image={`https://www.35mmc.com/wp-content/uploads/2026/03/05-1.jpg`}
        title={'Tokyoites 2007~2009'}
        shortDesc={'The 28mm has always been my favourite lens for capturing crowds. It lets you frame plenty of action without introducing too much distortion. During my years living in Tokyo I re'}
      />
      <NewsItem
        image={`https://www.35mmc.com/wp-content/uploads/2026/03/New-Design-91.png`}
        title={'Why being bad at photography led me to create the world’s first digital ‘light meter watch'}
        shortDesc={'Ever wondered if you can learn manual exposure without having a camera in your hand? It’s an odd question and to be honest I wouldn’t blame you if you hadn’t. But it’s a questio'}
      />
    </section>
  )
}

export default index