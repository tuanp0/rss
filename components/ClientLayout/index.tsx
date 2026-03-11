'use client'
import { LayerProvider, useLayerContext } from '@/context/LayerContext'
import Header from '@/components/Header'
import LayerAddGroup from '@/components/LayerAddGroup'
import LayerDeleteGroup from '@/components/LayerDeleteGroup'
import Footer from '@/components/Footer'

function LayoutInner({ children }: { children: React.ReactNode }) {
  const { showAddLayer, setShowAddLayer, showDeleteLayer, setShowDeleteLayer, refreshGroups } = useLayerContext()

  return (
    <>
      <Header />
      {children}
      <LayerAddGroup
        showAddLayer={showAddLayer}
        setShowAddLayer={setShowAddLayer}
        onGroupAdded={() => refreshGroups && refreshGroups()}
      />
      <LayerDeleteGroup
        onGroupDeleted={() => refreshGroups && refreshGroups()}
      />
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