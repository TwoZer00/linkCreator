export const generateFingerprint = () => {
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillText('Browser fingerprint', 2, 2)
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      navigator.platform,
      canvas.toDataURL()
    ].join('|')
    
    return btoa(fingerprint).slice(0, 32)
  } catch (error) {
    console.error('Fingerprint generation failed:', error)
    return btoa(navigator.userAgent + Date.now()).slice(0, 32)
  }
}