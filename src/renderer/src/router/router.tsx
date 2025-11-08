// import { createBrowserRouter } from 'react-router';
import { createHashRouter } from 'react-router';
import StartPage from '@renderer/pages/startPage/startPage';
import ViewImagePage from '@renderer/pages/viewImagePage/viewImagePage';
import BasePage from '@renderer/pages/BasePage/BasePage';
import SettingPage from '@renderer/pages/SettingPage/SettingPage';

const Router = createHashRouter([
  {
    path: '/',
    Component: BasePage,
    children: [
      { index: true, Component: StartPage },
      {
        path: 'viewIamge',
        Component: ViewImagePage
      },
      {
        path: 'setting',
        Component: SettingPage
      }
    ]
  }
]);

export default Router;
