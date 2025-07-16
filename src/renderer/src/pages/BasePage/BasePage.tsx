import { Outlet } from "react-router";
import style from "./basePage.module.css";

export default function BasePage() {
  return (
    <div className={style["base"]}>
      <div className={style["title-bar"]}>
        <span>my-image-view-electron</span>
      </div>
      <div className={style["body"]}>
        <Outlet />
      </div>
    </div>
  );
}
