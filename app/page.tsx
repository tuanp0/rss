'use client'
import { useLayerContext } from '@/context/LayerContext'

import GroupList from '@/components/GroupList'
import SourceList from '@/components/SourceList'
import NewsList from '@/components/NewsList'
import PostItem from '@/components/PostItem'

export default function Home() {
  const {setRefreshGroups, setRefreshSources } = useLayerContext()

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
    </>
  );
}