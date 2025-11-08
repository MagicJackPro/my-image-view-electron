import { Outlet } from "react-router";
import style from "./basePage.module.css";
import Message from "@renderer/components/Message/Message";
import { Icon } from "../../assets/icon/icon";

export default function BasePage(): React.JSX.Element {
  return (
    <div className={style["base"]}>
      <div className={style["title-bar"]}>
        <Icon style={{ width: 20, height: 20 }} />
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
