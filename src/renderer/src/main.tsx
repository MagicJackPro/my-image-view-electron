import "./assets/base.css"

import { createRoot } from 'react-dom/client'
// import App from './App'
import {  RouterProvider } from 'react-router'
import Router from "./router/router"
import store,{ StoreContext } from "./store/store" 

createRoot(document.getElementById('root')!).render(
  <StoreContext.Provider value={store}>
    <RouterProvider router ={Router}/>
    {/* <App /> */}
  </StoreContext.Provider>
)
