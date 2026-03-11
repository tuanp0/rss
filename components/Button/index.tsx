import { useLayerContext } from '@/context/LayerContext'

import styles from './Button.module.scss'

interface Button {
    text: string;
    action?: () => void;
    icon: string;
}

const index = ({text, action, icon}: Button) => {
  const { setCurrentStep } = useLayerContext()

  return (
    <button className={styles.button} onClick={action}>
        {icon === 'add' &&
          <div className={`${styles.buttonAdd} ${styles.buttonIcon}`}>
            <span className={styles.buttonAddLine}></span>
          <span className={styles.buttonAddLine}></span>
          </div>
        }

        {icon === 'previous' &&
          <div className={`${styles.buttonPrev} ${styles.buttonIcon}`} onClick={() => setCurrentStep(1)}>
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
          <div className={styles.buttonIcon}>
            <svg width="800px" height="800px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.buttonIconSvg}>
              <path fillRule="evenodd" clipRule="evenodd" d="M5 3C2.23858 3 0 5.23858 0 8C0 10.7614 2.23858 13 5 13H11C13.7614 13 16 10.7614 16 8C16 5.23858 13.7614 3 11 3H5ZM5 5C3.34315 5 2 6.34315 2 8C2 9.65685 3.34315 11 5 11C6.65685 11 8 9.65685 8 8C8 6.34315 6.65685 5 5 5Z" fill="#000000"/>
            </svg>
          </div>
        }
        {/* <div className={styles.buttonText}>{text}</div> */}
    </button>
  )
}

export default index