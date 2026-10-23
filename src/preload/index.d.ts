import type DialogAPI from "./dialog";
import type { FSAPIFace } from "./fs";
import type { SqliteFace } from "./sqlite";
import type { FcFace } from "./fc";
import type { LogApiFace } from "./logger";

declare global {
  interface Window {
    api: {
      sqlite: SqliteFace;
      dialog: DialogAPI;
      fs: FSAPIFace;
      webUtils: {
        getPathForFile: (file: File) => string;
      };
      fc: FcFace;
      log: LogApiFace;
    };
  }
}
