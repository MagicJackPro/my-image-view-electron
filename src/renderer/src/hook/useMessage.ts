import { useContext } from "react";
import { MessageContext } from "@renderer/components/Message/Message";

import type { ContextFace } from "@renderer/components/Message/Message";

export default function useMessage() {
  return useContext<ContextFace>(MessageContext);
}
