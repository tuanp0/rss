'use client'
import { LayerProvider, useLayerContext } from '@/context/LayerContext'
import Header from '@/components/Header'
import LayerAddGroup from '@/components/LayerAddGroup'
import LayerDeleteGroup from '@/components/LayerDeleteGroup'
import LayerInformations from '@/components/LayerInformations'
import Footer from '@/components/Footer'

import styles from './ClientLayout.module.scss'

function LayoutInner({ children }: { children: React.ReactNode }) {
  const { showAddLayer, setShowAddLayer, showDeleteLayer, setShowDeleteLayer, refreshGroups, refreshSources } = useLayerContext()

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