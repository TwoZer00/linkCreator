export const reportLinkHealthPublic = async (linkId, userId, reportData) => {
  try {
    // Use a public API endpoint or cloud function instead of direct Firestore write
    const response = await fetch('/api/report-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        linkId,
        userId,
        ...reportData
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to submit report')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Report submission failed:', error)
    throw error
  }
}