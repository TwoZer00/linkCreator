export const navigatorLang = (window.navigator.language.split('-')[0] === 'es' || window.navigator.language.split('-')[0] === 'en') ? window.navigator.language.split('-')[0] : 'en'
export const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
export const isAndroid = /Android/i.test(navigator.userAgent)
export const isMobile = isIOS || isAndroid
export const isDesktop = !isMobile
export const isWindows = /Win/i.test(navigator.userAgent)
export const isMacOS = /Mac/i.test(navigator.userAgent)
export const isLinux = /Linux/i.test(navigator.userAgent)
export const getDeviceInfo = () => {
  return {
    isMobile,
    isAndroid,
    isIOS,
    isDesktop,
    isWindows,
    isLinux,
    isMacOS,
    device: navigator.userAgent
  }
}
