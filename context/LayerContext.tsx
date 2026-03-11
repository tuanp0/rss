'use client'
import { createContext, useContext, useState } from 'react'

interface LayerContextType {
  selectedGroupId: number
  setSelectedGroupId: (val: number) => void
  selectedGroupName: string | null
  setSelectedGroupName: (name: string) => void
  currentStep: number
  setCurrentStep: (val: number) => void
  showAddLayer: boolean
  setShowAddLayer: (val: boolean) => void
  showDeleteLayer: boolean
  setShowDeleteLayer: (val: boolean) => void
  refreshGroups: (() => void) | null
  setRefreshGroups: (fn: (() => void) | null) => void
}

const LayerContext = createContext<LayerContextType | null>(null)

export function LayerProvider({ children }: { children: React.ReactNode }) {
  const [selectedGroupId, setSelectedGroupId] = useState<number>(999)
  const [selectedGroupName, setSelectedGroupName] = useState<string>('')
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [showAddLayer, setShowAddLayer] = useState<boolean>(false)
  const [showDeleteLayer, setShowDeleteLayer] = useState<boolean>(false)
  const [refreshGroups, setRefreshGroups] = useState<(() => void) | null>(null)

  return (
    <LayerContext.Provider value={{ currentStep, setCurrentStep, showAddLayer, setShowAddLayer, showDeleteLayer, setShowDeleteLayer, selectedGroupId, setSelectedGroupId, selectedGroupName, setSelectedGroupName, refreshGroups, setRefreshGroups }}>
      {children}
    </LayerContext.Provider>
  )
}

export function useLayerContext() {
  const ctx = useContext(LayerContext)
  if (!ctx) throw new Error('useLayerContext must be used within a LayerProvider')
  return ctx
}