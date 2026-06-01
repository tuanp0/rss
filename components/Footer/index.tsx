'use client'
import React, {useState} from 'react'
import { useLayerContext } from '@/context/LayerContext'
import { initDB, refreshSource, refreshAllSources } from '@/db/groups'
import Button from '@/components/Button'
import Container from '@/components/Container'

import styles from "./Footer.module.scss"

const index = () => {
  const { currentStep, setCurrentStep, setShowAddLayer, setShowDeleteLayer, setShowParametersLayer, setShowInformationsLayer, currentGroup, setCurrentGroup, currentSource, setCurrentSource, setCurrentNews, triggerRefresh } = useLayerContext()
    const [refreshing, setRefreshing] = useState(false)
  
    const handleRefresh = async () => {
      const db = await initDB()
  
      if (!db || currentSource === null || currentGroup === null) return
  
      setRefreshing(true)
  
      try {
        if (currentSource === null || currentSource === 0) {
          await refreshAllSources(db, currentGroup)
        } else {
          await refreshSource(db, currentSource, currentGroup)
        }
        
        triggerRefresh()
      } catch (err) {
        console.error(err)
      } finally {
        setRefreshing(false)
      }
    }

  return (
    <footer className={styles.footer}>
          <div className={styles.footerButton}>
            {/* {currentStep === 1 && <Button text="Accéder aux paramètres" action={() => {}} icon={'parameter'} />} */}
            {currentStep === 2 && <Button text="Accéder aux catégories" action={() => setCurrentStep(1)} icon={'previous'} />}
            {currentStep === 3 && <Button text="Accéder aux sources" action={() => setCurrentStep(2)} icon={'previous'} />}
            {currentStep === 4 && <Button text="Accéder aux news" action={() => setCurrentStep(3)} icon={'previous'} />}
          </div>

          <div className={styles.footerContent}>
            <div className={styles.footerContentInner}>
              <button className={styles.footerItem} onClick={() => {
                setCurrentStep(1)
                setShowAddLayer(false)
                setShowDeleteLayer(false)
                setShowInformationsLayer(false)
                setShowParametersLayer(false)
              }}>
                <svg fill="#000000" width="800px" height="800px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={styles.footerItemSvg}>
                  <path d="M2.168,10.555a1,1,0,0,1,.278-1.387l9-6a1,1,0,0,1,1.11,0l9,6A1,1,0,0,1,21,11H19v9a1,1,0,0,1-1,1H6a1,1,0,0,1-1-1V11H3l.019-.019A.981.981,0,0,1,2.168,10.555Z"/>
                </svg>
                <span className={styles.footerItemText}>Home</span>
              </button>
              <button className={styles.footerItem} onClick={() => {
                  setShowAddLayer(false)
                  setShowDeleteLayer(false)
                  setShowInformationsLayer(false)
                  setShowParametersLayer(true)
                }}>
                <svg width="800px" height="800px" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.footerItemSvg}>
                  <path d="M10.5576 2.25C10.8544 2.25 11.1234 2.42509 11.2435 2.69656L11.6859 3.69656C11.9052 4.1924 11.5422 4.75 11 4.75L9 4.75C8.47694 4.75 8.11452 4.22806 8.29727 3.73796L8.67016 2.73796C8.77957 2.44455 9.05975 2.25 9.37289 2.25H10.5576Z" fill="#000000"/>
                  <path d="M9.44253 17.75C9.14568 17.75 8.87676 17.5749 8.75666 17.3034L8.31424 16.3034C8.09488 15.8076 8.45793 15.25 9.00012 15.25H11.0001C11.5232 15.25 11.8856 15.7719 11.7029 16.262L11.33 17.262C11.2206 17.5554 10.9404 17.75 10.6272 17.75H9.44253Z" fill="#000000"/>
                  <path d="M17.7501 10.5575C17.7501 10.8544 17.575 11.1233 17.3035 11.2434L16.3035 11.6858C15.8077 11.9052 15.2501 11.5421 15.2501 10.9999V8.99994C15.2501 8.47688 15.772 8.11445 16.2621 8.29721L17.2621 8.6701C17.5555 8.77951 17.7501 9.05969 17.7501 9.37283V10.5575Z" fill="#000000"/>
                  <path d="M2.25006 9.44247C2.25006 9.14562 2.42515 8.8767 2.69662 8.7566L3.69662 8.31418C4.19246 8.09482 4.75006 8.45786 4.75006 9.00006V11.0001C4.75006 11.5231 4.22812 11.8855 3.73802 11.7028L2.73802 11.3299C2.44461 11.2205 2.25006 10.9403 2.25006 10.6272V9.44247Z" fill="#000000"/>
                  <path d="M15.8744 4.91417C16.0843 5.12408 16.1506 5.43804 16.0436 5.71492L15.6493 6.73486C15.4538 7.24059 14.8028 7.37816 14.4194 6.99477L13.0052 5.58056C12.6354 5.21069 12.7482 4.58535 13.2239 4.36803L14.1947 3.92459C14.4796 3.79449 14.8152 3.85504 15.0367 4.07646L15.8744 4.91417Z" fill="#000000"/>
                  <path d="M4.12575 15.0858C3.91584 14.8759 3.84949 14.562 3.95653 14.2851L4.3508 13.2651C4.5463 12.7594 5.19729 12.6218 5.58068 13.0052L6.9949 14.4194C7.36476 14.7893 7.25196 15.4146 6.77618 15.632L5.8054 16.0754C5.52057 16.2055 5.18488 16.145 4.96346 15.9235L4.12575 15.0858Z" fill="#000000"/>
                  <path d="M15.086 15.8743C14.876 16.0842 14.5621 16.1505 14.2852 16.0435L13.2653 15.6492C12.7595 15.4537 12.622 14.8027 13.0054 14.4193L14.4196 13.0051C14.7894 12.6352 15.4148 12.748 15.6321 13.2238L16.0755 14.1946C16.2056 14.4794 16.1451 14.8151 15.9237 15.0365L15.086 15.8743Z" fill="#000000"/>
                  <path d="M4.91417 4.12575C5.12408 3.91584 5.43804 3.84949 5.71492 3.95653L6.73486 4.3508C7.24059 4.5463 7.37816 5.19729 6.99477 5.58068L5.58056 6.9949C5.21069 7.36476 4.58535 7.25196 4.36803 6.77618L3.92459 5.8054C3.79449 5.52057 3.85504 5.18488 4.07646 4.96346L4.91417 4.12575Z" fill="#000000"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M5.58058 14.4194C6.74366 15.5825 8.32182 16.25 10 16.25C11.6782 16.25 13.2563 15.5825 14.4194 14.4194C15.5825 13.2563 16.25 11.6782 16.25 10C16.25 8.32182 15.5825 6.74366 14.4194 5.58058C13.2563 4.4175 11.6782 3.75 10 3.75C8.32182 3.75 6.74366 4.4175 5.58058 5.58058C4.4175 6.74366 3.75 8.32182 3.75 10C3.75 11.6782 4.4175 13.2563 5.58058 14.4194ZM11.2374 11.2374C10.9099 11.565 10.4724 11.75 10 11.75C9.52756 11.75 9.09009 11.565 8.76256 11.2374C8.43503 10.9099 8.25 10.4724 8.25 10C8.25 9.52756 8.43503 9.09009 8.76256 8.76256C9.09009 8.43503 9.52756 8.25 10 8.25C10.4724 8.25 10.9099 8.43503 11.2374 8.76256C11.565 9.09009 11.75 9.52756 11.75 10C11.75 10.4724 11.565 10.9099 11.2374 11.2374Z" fill="#000000"/>
                </svg>
                <span className={styles.footerItemText}>Param.</span>
              </button>
              <button
                className={styles.footerItem}
                onClick={() => {
                  setShowInformationsLayer(true)
                  setShowAddLayer(false)
                  setShowDeleteLayer(false)
                  setShowParametersLayer(false)
                }}
              >
                <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.footerItemSvg}>
                  <path fillRule="evenodd" clipRule="evenodd" d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM12 17.75C12.4142 17.75 12.75 17.4142 12.75 17V11C12.75 10.5858 12.4142 10.25 12 10.25C11.5858 10.25 11.25 10.5858 11.25 11V17C11.25 17.4142 11.5858 17.75 12 17.75ZM12 7C12.5523 7 13 7.44772 13 8C13 8.55228 12.5523 9 12 9C11.4477 9 11 8.55228 11 8C11 7.44772 11.4477 7 12 7Z" fill="#1C274C"/>
                </svg>
                <span className={styles.footerItemText}>Infos</span>
              </button>
            </div>
          </div>
          
          <div className={styles.footerAction}>
            {currentStep === 1 && <Button text="Ajouter une catégorie" action={() => setShowAddLayer(true)} icon={'add'} />}
            {currentStep === 2 && <Button text="Ajouter une source" action={()=> setShowAddLayer(true)} icon={'add'} />}
            {currentStep >= 3 && <Button text="Rafraîchir la liste" action={handleRefresh} icon={'refresh'} isRefreshing={refreshing} />}
            {/* {currentStep === 4 && <Button text="Sauvegarder ce post" action={() => setShowAddLayer(true)} icon={'save'} />} */}
          </div>

    </footer>
  )
}

export default index