import { makeAutoObservable } from 'mobx';

import { createContext } from "react";

export class Store {
  constructor() {
    makeAutoObservable(this);
  }

  private _dirpath: string = '';
  public get dirpath() : string {
    return this._dirpath;
  }
  
 public setDirPath(path:string){
    this._dirpath = path
 }
  
}

const store = new Store();


export default store;

export const StoreContext = createContext<Store>(store);
