import { Outlet } from "react-router";
import style from "./basePage.module.css";
import Message from "@renderer/components/Message/Message";
import Icon from "@renderer/assets/icon.svg";

export default function BasePage(): React.JSX.Element {
  return (
    <div className={style["base"]}>
      <div className={style["title-bar"]}>
        <img className={style["icon"]} src={Icon} alt="logo" />
        <span>my-image-view-electron</span>
        <span>&nbsp;{__APP_VERSION__}</span>
      </div>
      <div className={style["body"]}>
        <Message>
          <Outlet />
        </Message>
      </div>
    </div>
  );
}
