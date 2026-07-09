import React from 'react'
import { useLayerContext } from '@/context/LayerContext'
import Button from '@/components/Button'
import styles from './GroupItem.module.scss'

interface GroupItemTypes {
    groupId: number
    text: string
    itemCount: number
    onDelete: () => void
}

const GroupItem = ({ groupId, text, itemCount, onDelete }: GroupItemTypes) => {
  const { currentStep, setCurrentStep, currentGroup, setCurrentGroup, setCurrentSource, setShowDeleteLayer, setIsGroup, setIsSource, setSelectedGroupId, setSelectedGroupName } = useLayerContext()

  const handleNextStep = (groupId: number, name: string) => {
    setCurrentGroup(groupId)
    setSelectedGroupName(name)
    setCurrentStep(2)
  }
  
  const handleDeleteGroup = (groupId: number, name: string) => {
    setSelectedGroupId(groupId)
    setSelectedGroupName(name)
    setIsGroup(true)
    setIsSource(false)
    setShowDeleteLayer(true)
  }

  return (
    <div className={`${styles.groupItem} ${currentGroup === groupId && currentStep >= 2 ? styles.active : ''}`} onClick={() => handleNextStep(groupId, text)}>
        <div className={styles.groupItemIcon}>
            <svg fill="#000000" width="800px" height="800px" viewBox="0 2 15 15" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.644 15.26a16.9 16.9 0 0 1-.706-.014l-.11-.025a1.51 1.51 0 0 1-1.14-1.185l-.018-.092c-.005-.106-.01-.406-.01-.667V4.434a.477.477 0 0 1 .476-.475H11.77a.476.476 0 0 1 .475.475v1.529h1.591a.506.506 0 0 1 .504.504v7.192a1.6 1.6 0 0 1-1.6 1.6zm0-1.109h8.572a1.598 1.598 0 0 1-.077-.491v-2.174a2.16 2.16 0 0 1-.003-.109v-6.31H1.769v8.21c0 .218.003.43.006.544l.002.008a.401.401 0 0 0 .3.312l.01.002c.133.004.358.008.557.008zM9.91 6.815H2.95v1.109h6.96zm-4 2.383H2.95v3.532h2.96zm4.002.026H7.033v1.109h2.878zm0 2.41H7.033v1.108h2.878zm2.336-4.563v6.589a.492.492 0 0 0 .984 0V7.07z"/>
            </svg>
        </div>
        <div className={styles.groupItemContent}>
            <p className={styles.groupItemText}>{text}</p>
            <p className={styles.groupItemCount}>{itemCount} {itemCount <= 1 ? 'source' : 'sources'}</p>
        </div>
        <div className={styles.groupItemDelete} onClick={(e) => e.stopPropagation()}>
            <Button
                text="Supprimer la catégorie"
                action={() => handleDeleteGroup(groupId, text)}
                icon={'delete'}
            />
        </div>
    </div>
  )
}

export default GroupItem