declare interface DialogAPI {
  /** 对话框 MessageBox Electron api
   * @param {Electron.MessageBoxOptions} config
   */
  SecondaryConfirmation: (
    config: Electron.MessageBoxOptions
  ) => Promise<Electron.MessageBoxReturnValue>;
}
