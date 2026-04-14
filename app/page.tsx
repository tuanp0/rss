'use client'
import { useState } from 'react'
import { useLayerContext } from '@/context/LayerContext'

import GroupList from '@/components/GroupList'
import SourceList from '@/components/SourceList'
import NewsList from '@/components/NewsList'
import PostItem from '@/components/PostItem'

export default function Home() {
  const { showAddLayer, setShowAddLayer, setRefreshGroups, setRefreshSources } = useLayerContext()

  const [showParametersLayer, setShowParametersLayer] = useState<boolean>(false)
  const [currentStep, setCurrentStep] = useState<number>(1)

  return (
    <>
      <GroupList
        onReady={(refresh) => setRefreshGroups(() => refresh)}
      />
      <SourceList
        onReady={(refresh) => setRefreshSources(() => refresh)}
      />
      <NewsList />
      <PostItem />
      {/*
        <LayerParameters
          showParametersLayer={showParametersLayer}
          setShowParametersLayer={setShowParametersLayer}
        />
      */}
    </>
  );
}