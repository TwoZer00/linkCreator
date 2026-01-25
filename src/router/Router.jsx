import { createBrowserRouter, redirect } from 'react-router-dom'
import Login from '../pages/Login'
import Register from '../pages/Register'
import ResetPassword from '../pages/ResetPassword'
import EmailVerification from '../pages/EmailVerification'
import Dashboard from '../pages/Dashboard/Dashboard'
import Links from '../pages/Dashboard/Links'
import Profile from '../pages/Dashboard/Profile'
import { getAuth } from 'firebase/auth'
import { getUserFromId, getUserFromUsername, getUserLinks } from '../firebase/utils'
import UserLinks from '../pages/UserLinks'
import Home from '../pages/Home'
import { Home as HomeDashboard } from '../pages/Dashboard/Home'
import LinkAnalytics from '../pages/Dashboard/LinkAnalytics'
import Init from '../Init'
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Init />,
    children: [
      {
        path: 'login',
        element: <Login />,
        loader: async () => {
          await getAuth().authStateReady()
          if (getAuth().currentUser) {
            return redirect('/dashboard')
          }
          return getAuth().currentUser
        }
      },
      {
        path: 'register',
        element: <Register />,
        loader: async () => {
          await getAuth().authStateReady()
          if (getAuth().currentUser) {
            // console.log(getAuth().currentUser);
            return redirect('/dashboard')
          }
          return getAuth().currentUser
        }
      },
      {
        path: 'reset-password',
        element: <ResetPassword />
      },
      {
        path: 'verify-email',
        element: <EmailVerification />,
        loader: async () => {
          await getAuth().authStateReady()
          if (!getAuth().currentUser) {
            return redirect('/login')
          }
          if (getAuth().currentUser.emailVerified) {
            return redirect('/dashboard/profile')
          }
          return null
        }
      },
      {
        path: 'dashboard/',
        element: <Dashboard />,
        id: 'dashboard',
        loader: async () => {
          await getAuth().authStateReady()
          if (getAuth().currentUser === null) {
            return redirect('/login')
          }
          if (!getAuth().currentUser.emailVerified) {
            return redirect('/verify-email')
          }
          return false
        },
        children: [
          {
            path: 'links',
            element: <Links />
          },
          {
            path: 'profile',
            element: <Profile />
          },
          {
            path: '',
            element: <HomeDashboard />,
            index: true

          },
          {
            path: 'links/:linkId/analytics',
            element: <LinkAnalytics />
          }

        ]
      },
      {
        path: '',
        element: <Home />
      }
    ]
  },
  {
    path: ':user',
    element: <UserLinks />,
    loader: async ({ params }) => {
      const user = params.user
      if (user === undefined) {
        return redirect('/')
      }
      await getAuth().authStateReady().catch(() => {
        return redirect('/')
      })
      try {
        if (user.length > 20) {
          const userData = await getUserFromId(user)
          const userLinks = await getUserLinks(userData.id)
          return { ...userData, links: userLinks }
        } else {
          const userData = await getUserFromUsername(user)
          const userLinks = await getUserLinks(userData)
          return { ...userData, links: userLinks }
        }
      } catch (error) {
        return redirect('/')
      }
    }
  }
])
