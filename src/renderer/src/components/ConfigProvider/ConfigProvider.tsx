import { createContext } from "react";
import type { ReactNode } from "react";

interface RadioGeneralTheme {
  backgroundColor?: string;
  borderColor?: string;
  color?: string;
}
interface RadioTheme {
  default?: RadioGeneralTheme;
  defaultHover?: RadioGeneralTheme;
  checked?: RadioGeneralTheme;
  disabled?: RadioGeneralTheme;
}

export interface ThemeFace {
  radio?: RadioTheme;
}

interface ConfigProviderFace {
  theme?: ThemeFace;
  children?: ReactNode;
}
export const ThemeContext = createContext<ConfigProviderFace["theme"]>(undefined);

export function ConfigProvider(props: ConfigProviderFace) {
  return <ThemeContext value={props?.theme}>{props.children}</ThemeContext>;
}
