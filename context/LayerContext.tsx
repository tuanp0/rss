'use client'
import { createContext, useContext, useState, useMemo } from 'react'
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
  currentNews: number
  setCurrentNews: (val: number) => void
  currentNewsObject: Post | null
  setCurrentNewsObject: (value: Post | null) => void
  showAddLayer: boolean
  setShowAddLayer: (val: boolean) => void
  showDeleteLayer: boolean
  setShowDeleteLayer: (val: boolean) => void
  showParametersLayer: boolean
  setShowParametersLayer: (val: boolean) => void
  showInformationsLayer: boolean
  setShowInformationsLayer: (val: boolean) => void
  isGroup: boolean
  setIsGroup: (val: boolean) => void
  isSource: boolean
  setIsSource: (val: boolean) => void
  refreshGroups: (() => void) | null
  setRefreshGroups: (fn: (() => void) | null) => void
  refreshSources: (() => void) | null
  setRefreshSources: (fn: (() => void) | null) => void
  refreshTrigger: number
  setRefreshTrigger: (val: number) => void
  triggerRefresh: () => void
  activeColor: string | null
  setActiveColor: (name: string) => void
  activeFont: string | null
  setActiveFont: (name: string) => void
  activeSize: number
  setActiveSize: (val: number) => void
  location: string | null
  setLocation: (name: string) => void
  offlineIcon: boolean
  setOfflineIcon: (val:boolean) => void
  offlineAlert: boolean
  setOfflineAlert: (val:boolean) => void
  // groupIsPastHeader: boolean
  // setGroupIsPastHeader: (val:boolean) => void
  // sourceIsPastHeader: boolean
  // setSourceIsPastHeader: (val:boolean) => void
  // newsIsPastHeader: boolean
  // setNewsIsPastHeader: (val:boolean) => void
  // postIsPastHeader: boolean
  // setPostIsPastHeader: (val:boolean) => void
}

const LayerContext = createContext<LayerContextType | null>(null)

export function LayerProvider({ children }: { children: React.ReactNode }) {
  const [selectedGroupId, setSelectedGroupId] = useState<number>(999)
  const [selectedGroupName, setSelectedGroupName] = useState<string>('')
  const [selectedSourceId, setSelectedSourceId] = useState<number>(999)
  const [selectedSourceName, setSelectedSourceName] = useState<string>('')
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [currentGroup, setCurrentGroup] = useState<number>(999)
  const [currentSource, setCurrentSource] = useState<number>(999)
  const [currentNews, setCurrentNews] = useState<number>(999)
  const [currentNewsObject, setCurrentNewsObject] = useState<Post | null>(null)
  const [showAddLayer, setShowAddLayer] = useState<boolean>(false)
  const [showDeleteLayer, setShowDeleteLayer] = useState<boolean>(false)
  const [showParametersLayer, setShowParametersLayer] = useState<boolean>(false)
  const [showInformationsLayer, setShowInformationsLayer] = useState<boolean>(false)
  const [isGroup, setIsGroup] = useState<boolean>(false)
  const [isSource, setIsSource] = useState<boolean>(false)
  const [refreshGroups, setRefreshGroups] = useState<(() => void) | null>(null)
  const [refreshSources, setRefreshSources] = useState<(() => void) | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0)
  const triggerRefresh = () => setRefreshTrigger(n => n + 1)
  const [activeColor, setActiveColor] = useState<string>('auto')
  const [activeFont, setActiveFont] = useState<string>('default')
  const [activeSize, setActiveSize] = useState<number>(16)
  const [location, setLocation] = useState<string>('')
  const [offlineIcon, setOfflineIcon] = useState<boolean>(false)
  const [offlineAlert, setOfflineAlert] = useState<boolean>(false)
  // const [groupIsPastHeader, setGroupIsPastHeader] = useState<boolean>(false)
  // const [sourceIsPastHeader, setSourceIsPastHeader] = useState<boolean>(false)
  // const [newsIsPastHeader, setNewsIsPastHeader] = useState<boolean>(false)
  // const [postIsPastHeader, setPostIsPastHeader] = useState<boolean>(false)

  const value = useMemo(() => ({
    currentStep,
    setCurrentStep,
    currentGroup,
    setCurrentGroup,
    currentSource,
    setCurrentSource,
    currentNews,
    setCurrentNews,
    currentNewsObject,
    setCurrentNewsObject,
    showAddLayer,
    setShowAddLayer,
    showDeleteLayer,
    setShowDeleteLayer,
    showParametersLayer,
    setShowParametersLayer,
    showInformationsLayer,
    setShowInformationsLayer,
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
    setRefreshSources,
    refreshTrigger,
    setRefreshTrigger,
    triggerRefresh,
    activeColor,
    setActiveColor,
    activeFont,
    setActiveFont,
    activeSize,
    setActiveSize,
    location,
    setLocation,
    offlineIcon,
    setOfflineIcon,
    offlineAlert,
    setOfflineAlert,
    // groupIsPastHeader,
    // setGroupIsPastHeader,
    // sourceIsPastHeader,
    // setSourceIsPastHeader,
    // newsIsPastHeader,
    // setNewsIsPastHeader,
    // postIsPastHeader,
    // setPostIsPastHeader
  }), [
    currentStep, currentGroup, currentSource, currentNews, currentNewsObject,
    showAddLayer, showDeleteLayer, showParametersLayer, showInformationsLayer,
    isGroup, isSource,
    selectedGroupId, selectedGroupName, selectedSourceId, selectedSourceName,
    refreshGroups, refreshSources, refreshTrigger,
    activeColor, activeFont, activeSize,
    location, offlineIcon, offlineAlert,
    // groupIsPastHeader, sourceIsPastHeader, newsIsPastHeader, postIsPastHeader
  ])

  return (
    <LayerContext.Provider value={value}>
      {children}
    </LayerContext.Provider>
  )
}

export function useLayerContext() {
  const ctx = useContext(LayerContext)
  if (!ctx) throw new Error('useLayerContext must be used within a LayerProvider')
  return ctx
}