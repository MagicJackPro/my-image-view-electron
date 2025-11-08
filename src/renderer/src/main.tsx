import "./assets/base.css";
import "./assets/themeDrak.css";

import { createRoot } from "react-dom/client";
// import App from './App'
import { RouterProvider } from "react-router";
import Router from "./router/router";
import store, { StoreContext } from "./store/store";
// import { ThemeContext, type ThemeFace } from "@renderer/components/ConfigProvider/ConfigProvider";
import { ThemeContext } from "@renderer/components/ConfigProvider/ConfigProvider";


const root = document.getElementById("root");

if (root) {
  root.className = "theme-drak";
}

createRoot(document.getElementById("root")!).render(
  <StoreContext.Provider value={store}>
    <ThemeContext.Provider value={{}}>
      <RouterProvider router={Router} />
    </ThemeContext.Provider>
  </StoreContext.Provider>
);
