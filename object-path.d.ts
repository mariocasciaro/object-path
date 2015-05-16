declare var objectPath: ObjectPathModule.IObjectPath;

declare module ObjectPathModule {
  
  export interface IObjectPathOptions {
    /**
     * Treat numbers in string paths as arrays when setting properties
     */
    numberAsArray?: boolean;
    /**
     * When set to false, can access non-enumerables
     */
    ownPropertiesOnly?: boolean;
  }
  
  export interface IObjectPathBase {
    set(obj: any, path: any, value: any, doNotReplace: boolean, options: IObjectPathOptions): any;
  }
  
  export interface IObjectPathExtenderBase extends IObjectPathBase {
    merge(base: any, ...args: any[]): any;
  }
  
  export interface IObjectPath extends IObjectPathBase {
    options: IObjectPathOptions;
    set(obj: Object, path: IObjectPathPathTypes, value: any, doNotReplace: boolean): any;
    ensureExists(obj: Object, path: IObjectPathPathTypes, value: any): any;
    get<T>(obj: Object, path: IObjectPathPathTypes, defaultValue?: T): T;
    del(obj: Object, path: IObjectPathPathTypes): any;
    option(options: IObjectPathOptions): IObjectPath;
    extend(ctor: IObjectPathExtender): IObjectPath;
    has(obj: Object, path: IObjectPathPathTypes): boolean;
    coalesce(obj: Object, paths: IObjectPathPathTypes[], defaultValue: any): any;
    push(obj: Object, path: IObjectPathPathTypes, ...args: any[]): IObjectPath;
    insert(obj: Object, path: IObjectPathPathTypes, value: any, at: number): IObjectPath;
    empty(obj: Object, path: IObjectPathPathTypes): any;
    bind(obj: Object): IObjectPathBound;
  }
  
  export interface IObjectPathBound {
    set?(path: IObjectPathPathTypes, value: any, doNotReplace: boolean): any;
    ensureExists?(path: IObjectPathPathTypes, value: any): any;
    get?<T>(path: IObjectPathPathTypes, defaultValue?: T): T;
    del?(path: IObjectPathPathTypes): any;
    has?(path: IObjectPathPathTypes): boolean;
    coalesce?(paths: IObjectPathPathTypes[], defaultValue: any): any;
    push?(path: IObjectPathPathTypes, ...args: any[]): IObjectPath;
    insert?(path: IObjectPathPathTypes, value: any, at: number): IObjectPath;
    empty?(path: IObjectPathPathTypes): any;
  }
  
  export interface IObjectPathConstructor {
    new (options?: IObjectPathOptions): IObjectPath;
  }
  
  export type IObjectPathPathTypes = Array<string|number>|number|string;
  
  export interface IObjectPathExtender {
    (base: IObjectPathBase, options: IObjectPathOptions): Object;
  }
  
}

declare module 'object-path' {
  export = ObjectPathModule;
}