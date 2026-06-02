'use client'
import { useState, useEffect } from 'react'
import { Icon } from '@iconify/react';
import { fetchWeather, type WeatherData, getWeatherCondition } from '@/lib/weather'
import { useLayerContext } from '@/context/LayerContext'
import Container from '@/components/Container'
import Button from '@/components/Button'

import styles from './Header.module.scss'

const Header = () => {
  const { currentStep, selectedGroupName, selectedSourceName, location } = useLayerContext()

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
        </Container>
      </div>
    </header>
  )
}

export default Header