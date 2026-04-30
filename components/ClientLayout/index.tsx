'use client'
import { useState, useEffect} from 'react'
import { LayerProvider, useLayerContext } from '@/context/LayerContext'
import Header from '@/components/Header'
import LayerAddGroup from '@/components/LayerAddGroup'
import LayerDeleteGroup from '@/components/LayerDeleteGroup'
import LayerInformations from '@/components/LayerInformations'
import Footer from '@/components/Footer'

import styles from './ClientLayout.module.scss'

const TIME_CLASSES = [
  "night", "morning",
  "day", "afternoon"
] as const

type TimeOfDay = typeof TIME_CLASSES[number]

const getTimeOfDay = (): TimeOfDay => {
  const hour = new Date().getHours()
  if (hour < 6)  return "night"
  if (hour < 12) return "morning"
  if (hour < 14) return "day"
  if (hour < 17) return "afternoon"
  return "night"
}

const TIME_COLORS: Record<TimeOfDay, string> = {
  "night":         "#0a0a1a",
  "morning":       "#f4a261",
  "day":           "#87ceeb",
  "afternoon":     "#f0c040",
}

const useTimeOfDay = (): TimeOfDay | null => {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay | null>(null)

  useEffect(() => {
    setTimeOfDay(getTimeOfDay())
    const interval = setInterval(() => setTimeOfDay(getTimeOfDay()), 60_000)
    return () => clearInterval(interval)
  }, [])

  return timeOfDay
}

function LayoutInner({ children }: { children: React.ReactNode }) {
  const { showAddLayer, setShowAddLayer, refreshGroups, refreshSources } = useLayerContext()

  const timeOfDay = useTimeOfDay()

  useEffect(() => {
    if (!timeOfDay) return
    document.body.classList.remove(...TIME_CLASSES)
    document.body.classList.add(timeOfDay)
  }, [timeOfDay])

  useEffect(() => {
    if (!timeOfDay) return

    // Existing class swap
    document.body.classList.remove(...TIME_CLASSES)
    document.body.classList.add(timeOfDay)

    // 👇 Update the theme-color meta tag
    let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'theme-color'
      document.head.appendChild(meta)
    }
    meta.content = TIME_COLORS[timeOfDay]
  }, [timeOfDay])

  return (
    <>
      <Header />
      <div className={styles.main}>
        {children}
        <LayerAddGroup
          showAddLayer={showAddLayer}
          setShowAddLayer={setShowAddLayer}
          onGroupAdded={() => {
            refreshGroups && refreshGroups()
            refreshSources && refreshSources()
          }}
        />
        <LayerDeleteGroup
          onGroupDeleted={() => {
            refreshGroups && refreshGroups()
            refreshSources && refreshSources()
          }}
          onSourceDeleted={() => {
            refreshGroups && refreshGroups()
            refreshSources && refreshSources()
          }}
        />
        <LayerInformations />
      </div>
      <Footer />
    </>
  )
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayerProvider>
      <LayoutInner>
        {children}
      </LayoutInner>
    </LayerProvider>
  )
}