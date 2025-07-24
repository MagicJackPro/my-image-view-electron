import { Outlet } from "react-router";
import style from "./basePage.module.css";
import Message from "@renderer/components/Message/Message";

export default function BasePage() {
  return (
    <div className={style["base"]}>
      <div className={style["title-bar"]}>
        <span>my-image-view-electron</span>
      </div>
      <div className={style["body"]}>
        <Message>
          <Outlet />
        </Message>
      </div>
    </div>
  );
}
