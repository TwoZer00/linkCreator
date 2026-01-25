import { collection, getDocs, getFirestore, onSnapshot, collectionGroup } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

export const checkForReportedLinks = async () => {
  const auth = getAuth()
  const db = getFirestore()
  
  if (!auth.currentUser) return []
  
  const userLinksCollection = collection(db, `user/${auth.currentUser.uid}/link`)
  const linksSnapshot = await getDocs(userLinksCollection)
  
  const reportedLinks = []
  
  for (const linkDoc of linksSnapshot.docs) {
    const reportsCollection = collection(db, `user/${auth.currentUser.uid}/link/${linkDoc.id}/healthReports`)
    const reportsSnapshot = await getDocs(reportsCollection)
    
    if (!reportsSnapshot.empty) {
      const brokenReports = reportsSnapshot.docs.filter(doc => doc.data().status === 'broken')
      if (brokenReports.length > 0) {
        reportedLinks.push({
          linkId: linkDoc.id,
          linkName: linkDoc.data().name,
          reportCount: brokenReports.length
        })
      }
    }
  }
  
  return reportedLinks
}

export const subscribeToReports = (userId, callback) => {
  const db = getFirestore()
  const reportsQuery = collectionGroup(db, 'healthReports')
  
  return onSnapshot(reportsQuery, async (snapshot) => {
    const userReports = snapshot.docs.filter(doc => 
      doc.ref.path.includes(`user/${userId}/link/`) && doc.data().status === 'broken'
    )
    
    if (userReports.length > 0) {
      const reportedLinks = await checkForReportedLinks()
      callback(reportedLinks)
    }
  })
}