'use client'
import { useState, useEffect } from 'react'
import { Icon } from '@iconify/react';
import { fetchWeather, type WeatherData, getWeatherCondition } from '@/lib/weather'
import { useLayerContext } from '@/context/LayerContext'
import Container from '@/components/Container'
import Button from '@/components/Button'

import styles from './Header.module.scss'

const Header = () => {
  const { currentStep, selectedGroupName, selectedSourceName, location, offlineMessage } = useLayerContext()

  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [error, setError] = useState("")

  const truncate = (text: string, maxWidth: number): string => {
    let width = 0
    let result = ''

    for (const char of text) {
      const code = char.codePointAt(0) ?? 0
      const isFullWidth = (
        (code >= 0x1100 && code <= 0x115F) ||
        (code >= 0x2E80 && code <= 0x303F) ||
        (code >= 0x3040 && code <= 0x33FF) ||
        (code >= 0xAC00 && code <= 0xD7AF) ||
        (code >= 0xF900 && code <= 0xFAFF) ||
        (code >= 0xFF01 && code <= 0xFF60) ||
        (code >= 0xFFE0 && code <= 0xFFE6) ||
        (code >= 0x20000 && code <= 0x2FA1F)
      )
      width += isFullWidth ? 2 : 1
      if (width > maxWidth) return result + '...'
      result += char
    }

    return result
  }

  useEffect(() => {
    if (!location?.trim()) return
    
    fetchWeather(location)
      .then(setWeather)
      .catch(() => setError("City not found"))
  }, [location])

  const condition = weather ? getWeatherCondition(weather.weather_code) : null

  return (
    <header className={styles.header} role="banner">
      <div className={styles.headerContent}>
        <Container className={styles.headerContainer}>
          <p className={styles.headerTitle}>
            <span className={`
              ${styles.headerTitleSpan}
              ${currentStep === 1 ? styles.active : ''}
              ${currentStep >= 2 ? styles.past : ''}
            `}>
              <img src={`./tpreader-logo.png`} alt={`Logo TP Reader`} className={styles.headerTitleLogo}/>
              TP Reader
            </span>
            <span className={`
              ${styles.headerTitleSpan}
              ${currentStep < 2 ? styles.next : ''}
              ${currentStep === 2 ? styles.active : ''}
              ${currentStep > 2 ? styles.past : ''}
            `}>
              {selectedGroupName ? 
                truncate(selectedGroupName, 18)
                : 'TP Reader'
              }
            </span>
            <span className={`
              ${styles.headerTitleSpan}
              ${currentStep < 3 ? styles.next : ''}
              ${currentStep === 3 ? styles.active : ''}
              ${currentStep > 3 ? styles.past : ''}
            `}>
              {selectedSourceName ?
                truncate(selectedSourceName, 18)
                : 'TP Reader'
              }
            </span>

            <span className={`
              ${styles.headerTitleSpan}
              ${currentStep <= 3 ? styles.next : ''}
              ${currentStep === 4 ? styles.active : ''}
            `}>
              {location === '' && !error && !weather ?
                <>
                  <img src={`./tpreader-logo.png`} className={styles.headerTitleLogo}/>
                  TP Reader
                </>
              :
                null
              }
              {error && weather === null ? <span>{error}</span> : null}
              {weather ?
                <span className={styles.headerTitleSpanWeather}>
                  {/* <img src={`./tpreader-logo.png`} className={styles.headerTitleLogo}/> */}
                  <span className={styles.headerTitleSpanWeatheContent}>
                    <span className={styles.headerTitleSpanWeatherInfos}>
                      <span className={styles.headerTitleSpanWeatherInfo}>
                        {condition ? <Icon icon={`wi:${condition}`} width={32} className={styles.headerTitleSpanWeatherIcon}/> : ''} {weather.apparent_temperature}°C
                      </span>
                      <span className={styles.headerTitleSpanWeatherInfo}>
                        <Icon icon={`wi:humidity`} width={32} className={styles.headerTitleSpanWeatherIcon}/>{weather.humidity}%
                      </span>
                      <span className={styles.headerTitleSpanWeatherInfo}>
                        <Icon icon={`wi:strong-wind`} width={32} className={styles.headerTitleSpanWeatherIcon}/> {weather.wind_speed} km/h
                      </span>
                    </span>
                    <span className={styles.headerTitleSpanWeatherLocation}>{weather.city}, {weather.country}</span>
                  </span>
                </span>
              :
                null
              }
            </span>
          </p>

          <div className={`${styles.headerOffline} ${offlineMessage ? styles.active : null}`}>
            <svg className={styles.headerOfflineSvg} fill="#000000" width="800px" height="800px" viewBox="0 0 36 36" version="1.1"  preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
                <circle cx="18" cy="29.54" r="3"></circle>
                <path d="M29.18,17.71l.11-.17a1.51,1.51,0,0,0-.47-2.1A20.57,20.57,0,0,0,18,12.37c-.56,0-1.11,0-1.65.07l3.21,3.21a17.41,17.41,0,0,1,7.6,2.52A1.49,1.49,0,0,0,29.18,17.71Z"></path>
                <path d="M32.76,9.38A27.9,27.9,0,0,0,10.18,6.27L12.81,8.9A24.68,24.68,0,0,1,31.1,12.12a1.49,1.49,0,0,0,2-.46l.11-.17A1.51,1.51,0,0,0,32.76,9.38Z"></path>
                <path d="M3,4.75l3.1,3.1A27.28,27.28,0,0,0,3.18,9.42a1.51,1.51,0,0,0-.48,2.11l.11.17a1.49,1.49,0,0,0,2,.46,24.69,24.69,0,0,1,3.67-1.9l3.14,3.14a20.63,20.63,0,0,0-4.53,2.09,1.51,1.51,0,0,0-.46,2.1l.11.17a1.49,1.49,0,0,0,2,.46A17.46,17.46,0,0,1,14.25,16l3.6,3.6a13.39,13.39,0,0,0-6.79,1.93,1.5,1.5,0,0,0-.46,2.09l.1.16a1.52,1.52,0,0,0,2.06.44,10.2,10.2,0,0,1,9-.7L29,30.75l1.41-1.41-26-26Z"></path>
                <rect x="0" y="0" width="36" height="36" fillOpacity="0"/>
            </svg>
            Pas de connexion internet
          </div>

        </Container>
      </div>
    </header>
  )
}

export default Header