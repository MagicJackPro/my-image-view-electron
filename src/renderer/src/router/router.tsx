import { createBrowserRouter } from 'react-router';
import StartPage from '@renderer/pages/startPage/startPage';
import ViewImagePage from '@renderer/pages/viewImagePage/viewImagePage';
import BasePage from '@renderer/pages/BasePage/BasePage';

const Router = createBrowserRouter([
  {
    path: '/',
    Component: BasePage,
    children: [
      { index: true, Component: StartPage },
      {
        path: 'viewIamge',
        Component: ViewImagePage
      }
    ]
  }
]);

export default Router;
