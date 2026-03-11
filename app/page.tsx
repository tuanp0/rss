'use client'
import { useState } from 'react'
import Image from "next/image";
import GroupList from '@/components/GroupList'
import Sources from '@/components/Sources'
import Lists from '@/components/Lists'
import News from '@/components/News'
import LayerAddGroup from '@/components/LayerAddGroup'

export default function Home() {
  const [showAddLayer, setShowAddLayer] = useState<boolean>(false)
  const [showParametersLayer, setShowParametersLayer] = useState<boolean>(false)
  const [refreshGroups, setRefreshGroups] = useState<(() => void) | null>(null)

  return (
    <>
      <GroupList
        showAddLayer={showAddLayer}
        setShowAddLayer={setShowAddLayer}
        onReady={(refresh) => setRefreshGroups(() => refresh)}
      />
      {/* <Sources />
      <Lists />
      <News /> */}
      <LayerAddGroup
        showAddLayer={showAddLayer}
        setShowAddLayer={setShowAddLayer}
        onGroupAdded={() => refreshGroups && refreshGroups()}
      />
      {/*
        <LayerParameters
          showParametersLayer={showParametersLayer}
          setShowParametersLayer={setShowParametersLayer}
        />
      */}
    </>
  );
}
