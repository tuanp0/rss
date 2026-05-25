import { useLayerContext } from '@/context/LayerContext'

import styles from './Button.module.scss'

interface Button {
    text: string
    action?: () => void
    icon: string
    isRefreshing?: boolean
}

const index = ({text, action, icon, isRefreshing}: Button) => {
  const { setCurrentStep } = useLayerContext()

  return (
    <button className={styles.button} onClick={action}>
        {icon === 'add' &&
          <div className={`${styles.buttonAdd} ${styles.buttonIcon}`}>
            <span className={styles.buttonAddLine}></span>
            <span className={styles.buttonAddLine}></span>
          </div>
        }

        {icon === 'minus' &&
          <div className={`${styles.buttonAdd} ${styles.buttonIcon}`}>
            <span className={styles.buttonAddLine}></span>
          </div>
        }

        {icon === 'previous' &&
          <div className={`${styles.buttonPrev} ${styles.buttonIcon}`}>
            <span className={styles.buttonPrevLine}></span>
            <span className={styles.buttonPrevLine}></span>
          </div>
        }

        {icon === 'delete' &&
          <div className={`${styles.buttonDelete} ${styles.buttonIcon}`}>
            <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.buttonIconSvg}>
              <path d="M10 12L14 16M14 12L10 16M18 6L17.1991 18.0129C17.129 19.065 17.0939 19.5911 16.8667 19.99C16.6666 20.3412 16.3648 20.6235 16.0011 20.7998C15.588 21 15.0607 21 14.0062 21H9.99377C8.93927 21 8.41202 21 7.99889 20.7998C7.63517 20.6235 7.33339 20.3412 7.13332 19.99C6.90607 19.5911 6.871 19.065 6.80086 18.0129L6 6M4 6H20M16 6L15.7294 5.18807C15.4671 4.40125 15.3359 4.00784 15.0927 3.71698C14.8779 3.46013 14.6021 3.26132 14.2905 3.13878C13.9376 3 13.523 3 12.6936 3H11.3064C10.477 3 10.0624 3 9.70951 3.13878C9.39792 3.26132 9.12208 3.46013 8.90729 3.71698C8.66405 4.00784 8.53292 4.40125 8.27064 5.18807L8 6" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        }

        {icon === 'parameter' &&
          <div className={`${styles.buttonParameter} ${styles.buttonIcon}`}>
            <svg width="800px" height="800px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.buttonIconSvg}>
              <path fillRule="evenodd" clipRule="evenodd" d="M5 3C2.23858 3 0 5.23858 0 8C0 10.7614 2.23858 13 5 13H11C13.7614 13 16 10.7614 16 8C16 5.23858 13.7614 3 11 3H5ZM5 5C3.34315 5 2 6.34315 2 8C2 9.65685 3.34315 11 5 11C6.65685 11 8 9.65685 8 8C8 6.34315 6.65685 5 5 5Z" fill="#000000"/>
            </svg>
          </div>
        }

        {icon === 'refresh' &&
          <div className={`${styles.buttonRefresh} ${styles.buttonIcon} ${isRefreshing ? styles.refreshing : ''}`}>
            <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.buttonIconSvg}>
              <path d="M4.06189 13C4.02104 12.6724 4 12.3387 4 12C4 7.58172 7.58172 4 12 4C14.5006 4 16.7332 5.14727 18.2002 6.94416M19.9381 11C19.979 11.3276 20 11.6613 20 12C20 16.4183 16.4183 20 12 20C9.61061 20 7.46589 18.9525 6 17.2916M9 17H6V17.2916M18.2002 4V6.94416M18.2002 6.94416V6.99993L15.2002 7M6 20V17.2916" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        }

        {icon === 'save' &&
          <div className={`${styles.buttonSave} ${styles.buttonIcon}`}>
            <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.buttonIconSvg}>
              <path d="M16 8.98987V20.3499C16 21.7999 14.96 22.4099 13.69 21.7099L9.76001 19.5199C9.34001 19.2899 8.65999 19.2899 8.23999 19.5199L4.31 21.7099C3.04 22.4099 2 21.7999 2 20.3499V8.98987C2 7.27987 3.39999 5.87988 5.10999 5.87988H12.89C14.6 5.87988 16 7.27987 16 8.98987Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 5.10999V16.47C22 17.92 20.96 18.53 19.69 17.83L16 15.77V8.98999C16 7.27999 14.6 5.88 12.89 5.88H8V5.10999C8 3.39999 9.39999 2 11.11 2H18.89C20.6 2 22 3.39999 22 5.10999Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 12H11" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 14V10" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        }
        {/* <div className={styles.buttonText}>{text}</div> */}
    </button>
  )
}

export default index