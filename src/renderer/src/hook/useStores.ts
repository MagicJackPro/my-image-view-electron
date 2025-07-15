import { useContext } from "react";
import { Store,StoreContext } from "@renderer/store/store";

export const useStore = () => useContext(StoreContext) as Store;
