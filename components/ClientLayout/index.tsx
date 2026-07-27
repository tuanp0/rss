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

const TIME_CLASSES = ['night', 'morning', 'light', 'afternoon', 'bedtime'] as const
type TimeOfDay = typeof TIME_CLASSES[number]

const COLOR_CLASSES = ['auto', 'light', 'night', 'morning', 'afternoon', 'bedtime', 'forest', 'dark', 'wood'] as const

const THEME_COLORS: Record<Exclude<typeof COLOR_CLASSES[number], 'auto'>, string> = {
  dark: '#000000',
  light: '#ffffff',
  night: '#282828',
  morning: '#d7e9f8',
  afternoon: '#ebe7db',
  forest: '#C2D4B4',
  wood: '#443727',
  bedtime: '#242f3f',
}

const getTimeOfDay = (): TimeOfDay => {
  const hour = new Date().getHours()
  if (hour < 6)  return 'night'
  if (hour < 10) return 'morning'
  if (hour < 15) return 'light'
  if (hour < 19) return 'afternoon'
  if (hour < 23) return 'bedtime'
  return 'night'
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

function setMetaThemeColor(colorKey: string) {
  const color = THEME_COLORS[colorKey as keyof typeof THEME_COLORS]
  if (!color) return

  let meta = document.querySelector('meta[name="theme-color"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', 'theme-color')
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', color)
}

function applyThemeToBody(theme: Theme | null, timeOfDay: TimeOfDay | null) {
  document.body.classList.remove(...COLOR_CLASSES, ...TIME_CLASSES)

  const color = theme?.color_theme
  let activeColorKey: string | null = null

  if (color && color !== 'auto') {
    document.body.classList.add(color)
    activeColorKey = color
  } else {
    if (timeOfDay) {
      document.body.classList.add(timeOfDay)
      activeColorKey = timeOfDay
    }
  }

  if (activeColorKey) {
    setMetaThemeColor(activeColorKey)
  }

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
    if (!("serviceWorker" in navigator)) return

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (confirm("Une nouvelle version est disponible !\nRecharger la page ?")) {
        navigator.serviceWorker.ready.then(() => {
          window.location.href = window.location.href
        })
      }
    })

    initDB()
      .then(db => getTheme(db))
      .then(t => setTheme(t))
      .catch(console.error)
  }, [])

  useEffect(() => {
    applyThemeToBody(theme, timeOfDay)
  }, [theme, timeOfDay])

  return (
    <>
      <Header />
      <main className={styles.main} role="main">
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
      </main>
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