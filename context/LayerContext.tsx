'use client'
import { createContext, useContext, useState } from 'react'

interface LayerContextType {
  currentStep: number
  setCurrentStep: (val: number) => void
  showAddLayer: boolean
  setShowAddLayer: (val: boolean) => void
  refreshGroups: (() => void) | null
  setRefreshGroups: (fn: (() => void) | null) => void
}

const LayerContext = createContext<LayerContextType | null>(null)

export function LayerProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [showAddLayer, setShowAddLayer] = useState<boolean>(false)
  const [refreshGroups, setRefreshGroups] = useState<(() => void) | null>(null)

  return (
    <LayerContext.Provider value={{ currentStep, setCurrentStep, showAddLayer, setShowAddLayer, refreshGroups, setRefreshGroups }}>
      {children}
    </LayerContext.Provider>
  )
}

export function useLayerContext() {
  const ctx = useContext(LayerContext)
  if (!ctx) throw new Error('useLayerContext must be used within a LayerProvider')
  return ctx
}