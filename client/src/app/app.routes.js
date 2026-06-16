import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router-dom'
import { createElement } from 'react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AuthHome from '../features/auth/pages/AuthHome'
import Login from '../features/auth/pages/Login'
import Register from '../features/auth/pages/Register'
import { fetchCurrentUser } from '../features/auth/model/authSlice'

const ProtectedRoute = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const { status, user } = useSelector((state) => state.auth)

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchCurrentUser())
    }
  }, [dispatch, status])

  if (status === 'loading' || status === 'idle') {
    return createElement(
      'main',
      {
        className:
          'flex min-h-screen items-center justify-center bg-gradient-to-b from-white via-slate-50 to-slate-100',
      },
      createElement(
        'div',
        { className: 'flex flex-col items-center gap-4' },
        createElement('div', {
          className:
            'h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900',
        }),
        createElement(
          'p',
          { className: 'text-sm text-slate-500' },
          'Checking your session...'
        )
      )
    )
  }

  if (!user || status === 'unauthenticated') {
    return createElement(Navigate, {
      to: '/login',
      replace: true,
      state: { from: location.pathname },
    })
  }

  return createElement(Outlet)
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: createElement(Navigate, { to: '/login', replace: true }),
  },
  {
    path: '/login',
    element: createElement(Login),
  },
  {
    path: '/register',
    element: createElement(Register),
  },
  {
    path: '/dashboard',
    element: createElement(ProtectedRoute),
    children: [
      {
        index: true,
        element: createElement(AuthHome),
      },
    ],
  },
])
