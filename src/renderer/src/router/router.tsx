import { createBrowserRouter } from 'react-router'
import StartPage from '@renderer/pages/startPage/startPage'
import ViewImagePage from '@renderer/pages/viewImagePage/viewImagePage'
const Router = createBrowserRouter([
  {
    path: '/',
    children: [
      { index: true, element: <StartPage /> },
      {
        path: 'viewIamge',
        element: <ViewImagePage />
      }
    ]
  }
])

export default Router
