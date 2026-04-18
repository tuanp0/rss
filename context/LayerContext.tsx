'use client'
import { createContext, useContext, useState } from 'react'
import { Post } from '@/db/groups'

interface LayerContextType {
  selectedGroupId: number
  setSelectedGroupId: (val: number) => void
  selectedGroupName: string | null
  setSelectedGroupName: (name: string) => void
  selectedSourceId: number
  setSelectedSourceId: (val: number) => void
  selectedSourceName: string | null
  setSelectedSourceName: (name: string) => void
  currentStep: number
  setCurrentStep: (val: number) => void
  currentGroup: number
  setCurrentGroup: (val: number) => void
  currentSource: number
  setCurrentSource: (val: number) => void
  currentNews: Post | null
  setCurrentNews: (value: Post | null) => void
  showAddLayer: boolean
  setShowAddLayer: (val: boolean) => void
  showDeleteLayer: boolean
  setShowDeleteLayer: (val: boolean) => void
  isGroup: boolean
  setIsGroup: (val: boolean) => void
  isSource: boolean
  setIsSource: (val: boolean) => void
  refreshGroups: (() => void) | null
  setRefreshGroups: (fn: (() => void) | null) => void
  refreshSources: (() => void) | null
  setRefreshSources: (fn: (() => void) | null) => void
}

const LayerContext = createContext<LayerContextType | null>(null)

export function LayerProvider({ children }: { children: React.ReactNode }) {
  const [selectedGroupId, setSelectedGroupId] = useState<number>(999)
  const [selectedGroupName, setSelectedGroupName] = useState<string>('')
  const [selectedSourceId, setSelectedSourceId] = useState<number>(999)
  const [selectedSourceName, setSelectedSourceName] = useState<string>('')
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [currentGroup, setCurrentGroup] = useState<number>(0)
  const [currentSource, setCurrentSource] = useState<number>(0)
  const [currentNews, setCurrentNews] = useState<Post | null>(null)
  const [showAddLayer, setShowAddLayer] = useState<boolean>(false)
  const [showDeleteLayer, setShowDeleteLayer] = useState<boolean>(false)
  const [isGroup, setIsGroup] = useState<boolean>(false)
  const [isSource, setIsSource] = useState<boolean>(false)
  const [refreshGroups, setRefreshGroups] = useState<(() => void) | null>(null)
  const [refreshSources, setRefreshSources] = useState<(() => void) | null>(null)

  return (
    <LayerContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        currentGroup,
        setCurrentGroup,
        currentSource,
        setCurrentSource,
        currentNews,
        setCurrentNews,
        showAddLayer,
        setShowAddLayer,
        showDeleteLayer,
        setShowDeleteLayer,
        isGroup,
        setIsGroup,
        isSource,
        setIsSource,
        selectedGroupId,
        setSelectedGroupId,
        selectedGroupName,
        setSelectedGroupName,
        selectedSourceId,
        setSelectedSourceId,
        selectedSourceName,
        setSelectedSourceName,
        refreshGroups,
        setRefreshGroups,
        refreshSources,
        setRefreshSources
      }}
    >
      {children}
    </LayerContext.Provider>
  )
}

export function useLayerContext() {
  const ctx = useContext(LayerContext)
  if (!ctx) throw new Error('useLayerContext must be used within a LayerProvider')
  return ctx
}