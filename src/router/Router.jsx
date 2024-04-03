import { Outlet, createBrowserRouter, redirect, useHref, useNavigate, useOutletContext } from "react-router-dom";
import Login from '../pages/Login';
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard/Dashboard";
import Links from "../pages/Dashboard/Links";
import Profile from "../pages/Dashboard/Profile";
import { Box } from "@mui/material";
import { getAuth } from "firebase/auth";
import { getUser, getUserFromId, getUserFromUsername, getUserLinks } from "../firebase/utils";
import UserLinks from "../pages/UserLinks";
import Home from "../pages/Home";
import { Home as HomeDashboard } from '../pages/Dashboard/Home'
import Init from "../Init";
export const router = createBrowserRouter([
    {
        path: '/',
        element: <Init />,
        children: [
            {
                path: 'login',
                element: <Login />,
                loader: async () => {
                    await getAuth().authStateReady();
                    if (getAuth().currentUser) {
                        return redirect('/dashboard');
                    }
                    return getAuth().currentUser;
                }
            },
            {
                path: 'register',
                element: <Register />,
                loader: async () => {
                    await getAuth().authStateReady();
                    if (getAuth().currentUser) {
                        // console.log(getAuth().currentUser);
                        return redirect('/dashboard');
                    }
                    return getAuth().currentUser;
                }
            },
            {
                path: 'dashboard',
                element: <Dashboard />,
                loader: async () => {
                    await getAuth().authStateReady();
                    if (getAuth().currentUser === null) {
                        return redirect('/login');
                    }
                    return getAuth().currentUser;
                },
                children: [
                    {
                        path: 'links',
                        element: <Links />
                    },
                    {
                        path: 'profile',
                        element: <Profile />,
                        loader: async () => {
                            await getAuth().authStateReady();
                            try {
                                const userData = await getUser();
                                return userData;
                            } catch (error) {
                                return { username: "", email: getAuth().currentUser.email }
                            }
                        }
                    },
                    {
                        path: '',
                        element: <HomeDashboard />
                    }

                ]
            },
            {
                path: ':user',
                element: <UserLinks />,
                loader: async ({ params }) => {
                    if (params.user === undefined) {
                        return redirect('/');
                    }
                    const user = params.user;
                    await getAuth().authStateReady();
                    try {
                        if (user.length > 20) {
                            const userData = await getUserFromId(user);
                            const userLinks = await getUserLinks(userData.id);
                            return { ...userData, links: userLinks }
                        }
                        else {
                            const userData = await getUserFromUsername(user);
                            const userLinks = await getUserLinks(userData);
                            return { ...userData, links: userLinks }
                        }
                    } catch (error) {
                        return redirect('/')
                    }
                }
            },
            {
                path: '',
                element: <Home />
            }
        ]
    }
])