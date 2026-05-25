'use client'
import { useState, useEffect } from 'react'
import { LayerProvider, useLayerContext } from '@/context/LayerContext'
import Header from '@/components/Header'
import LayerAddGroup from '@/components/LayerAddGroup'
import LayerDeleteGroup from '@/components/LayerDeleteGroup'
import LayerParameters from '@/components/LayerParameters'
import LayerInformations from '@/components/LayerInformations'
import Footer from '@/components/Footer'
import { initDB, getTheme, Theme } from '@/db/groups'

import styles from './ClientLayout.module.scss'

const TIME_CLASSES = ["night", "morning", "day", "afternoon", "forest"] as const
type TimeOfDay = typeof TIME_CLASSES[number]

const COLOR_CLASSES = ["auto", "light", "night", "morning", "afternoon", "forest", "dark"] as const
const FONT_CLASSES = ["font-default", "font-sansserif", "font-gabriela", "font-monospace"] as const

const getTimeOfDay = (): TimeOfDay => {
  const hour = new Date().getHours()
  if (hour < 6)  return "night"
  if (hour < 12) return "morning"
  if (hour < 14) return "day"
  if (hour < 21) return "afternoon"
  return "night"
}

const TIME_COLORS: Record<TimeOfDay, string> = {
  "night":     "#313131",
  "morning":   "#e8f1f9",
  "day":       "#f0f0f0",
  "afternoon": "#ffefcb",
  "forest":    "#b9c498",
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

function applyThemeToBody(theme: Theme | null, timeOfDay: TimeOfDay | null) {
  document.body.classList.remove(...COLOR_CLASSES, ...TIME_CLASSES)

  const color = theme?.color_theme
  if (!color || color === 'auto') {
    if (timeOfDay) document.body.classList.add(timeOfDay)
  } else {
    document.body.classList.add(color)
  }

  // document.body.classList.remove(...FONT_CLASSES)
  // const font = theme?.font_theme
  // if (font && font !== 'default') {
  //   document.body.classList.add(`font-${font}`)
  // }

  const size = theme?.size_theme
  if (size) {
    document.body.style.setProperty('--font-size-base', `${size}px`)
  }
}

function LayoutInner({ children }: { children: React.ReactNode }) {
  const { showAddLayer, setShowAddLayer, refreshGroups, refreshSources } = useLayerContext()
  const timeOfDay = useTimeOfDay()
  const [theme, setTheme] = useState<Theme | null>(null)

  useEffect(() => {
    initDB()
      .then(db => getTheme(db))
      .then(t => setTheme(t))
      .catch(console.error)
  }, [])

  useEffect(() => {
    applyThemeToBody(theme, timeOfDay)
  }, [theme, timeOfDay])

  // useEffect(() => {
  //   const color = theme?.color_theme
  //   const isAuto = !color || color === 'auto'
  //   const activeTime = isAuto ? timeOfDay : null

  //   let metaColor = '#ffffff'
  //   if (activeTime) metaColor = TIME_COLORS[activeTime]

  //   for (const meta of [
  //     document.querySelector<HTMLMetaElement>('meta[name="theme-color"]'),
  //     document.querySelector<HTMLMetaElement>('meta[name="apple-mobile-web-app-status-bar-style"]'),
  //   ]) {
  //     if (meta) meta.content = metaColor
  //   }
  // }, [theme, timeOfDay])

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
        <LayerParameters onThemeChange={setTheme} />
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