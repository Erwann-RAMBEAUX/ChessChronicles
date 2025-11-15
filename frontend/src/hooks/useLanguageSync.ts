import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

/**
 * Hook to keep the language parameter in sync with the URL
 * Supports URL-based language switching via lang parameter
 */
export function useLanguageSync() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { i18n } = useTranslation()

  useEffect(() => {
    const urlLang = searchParams.get('lang')
    
    // If URL has lang param and it differs from current language, change language
    if (urlLang && urlLang !== i18n.language) {
      i18n.changeLanguage(urlLang)
    }
    
    // If no lang param in URL, add current language
    if (!urlLang) {
      setSearchParams((params) => {
        params.set('lang', i18n.language)
        return params
      }, { replace: true })
    }
  }, [searchParams, i18n, setSearchParams])

  // Function to change language and update URL
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
    setSearchParams((params) => {
      params.set('lang', lng)
      return params
    }, { replace: true })
  }

  return { changeLanguage }
}
