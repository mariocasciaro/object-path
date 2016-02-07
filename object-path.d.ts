declare namespace ObjectPath {

  export interface PathTypesAny {
    [index: string]: any;
  }
  export type PathTypes = (Array<string | number | symbol>) | (number | string | symbol | PathTypesAny);
  export type Extender<T> = (base: ExtenderBase) => T;

  export class ObjectPathError implements ReferenceError {
    message: string;
    name: string;
    constructor(message: string);
  }

  function isNumber(value: any): value is number;
  function isString(obj: any): obj is string;
  function isObject(obj: any): obj is Object;
  function isSymbol(obj: any): obj is symbol;
  function isArray(obj: any): obj is any[];
  function isBoolean(obj: any): obj is boolean;
  function merge<T extends any, U>(base: T, ...args: any[]): T & U;
  function isEmpty(value: string | boolean | symbol | number | Array<any> | Object, ownPropertiesOnly?: boolean): boolean;
  function getKey(key: string | symbol): number | string | symbol;
  function ensureExists<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes, value: any, noThrow?: boolean, ownPropertiesOnly?: boolean): any;
  function set<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes, value: any, doNotReplace?: boolean, noThrow?: boolean, ownPropertiesOnly?: boolean): any;
  function del<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes, noThrow?: boolean, ownPropertiesOnly?: boolean): O;
  function has<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes, noThrow?: boolean, ownPropertiesOnly?: boolean): boolean;
  function insert<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes, value: any, at?: number, noThrow?: boolean, ownPropertiesOnly?: boolean): void;
  function empty<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes, noThrow?: boolean, ownPropertiesOnly?: boolean): any;
  function push<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes, args: Array<any>, noThrow?: boolean, ownPropertiesOnly?: boolean): void;
  function coalesce<O extends ObjectPath.O, T>(obj: O, paths: ObjectPath.PathTypes[], defaultValue: T, noThrow?: boolean, ownPropertiesOnly?: boolean): T;
  function get<O extends ObjectPath.O, T>(obj: O, path: ObjectPath.PathTypes, defaultValue?: T, noThrow?: boolean, ownPropertiesOnly?: boolean): T;
  function bind<O extends ObjectPath.O>(obj: O, noThrow?: boolean, ownPropertiesOnly?: boolean): Bound<O>;
  function extend<T>(ctor: ObjectPath.Extender<T>, noConflict?: boolean): ObjectPath.Wrapper;

  export interface Wrapper {
    ensureExists: typeof ensureExists;
    set: typeof set;
    del: typeof del;
    has: typeof has;
    insert: typeof insert;
    empty: typeof empty;
    push: typeof push;
    coalesce: typeof coalesce;
    get: typeof get;
    bind: typeof bind;
    extend: typeof extend;
    ObjectPathError: typeof ObjectPathError;
  }

  export interface O extends Object {
    [index: string]: any;
  }

  export interface Base {
  }

  export interface ExtenderBase extends Base {
    isNumber: typeof isNumber;
    isString: typeof isString;
    isObject: typeof isObject;
    isSymbol: typeof isSymbol;
    isArray: typeof isArray;
    isBoolean: typeof isBoolean;
    merge: typeof merge;
    isEmpty: typeof isEmpty;
    getKey: typeof getKey;
    ensureExists: typeof ensureExists;
    set: typeof set;
    del: typeof del;
    has: typeof has;
    insert: typeof insert;
    empty: typeof empty;
    push: typeof push;
    coalesce: typeof coalesce;
    get: typeof get;
    extend: typeof extend;
    bind: typeof bind;
    ObjectPathError: typeof ObjectPathError;
  }

  export interface Bound<O extends Object> {
    ensureExists(path: ObjectPath.PathTypes, value: any, noThrow?: boolean, ownPropertiesOnly?: boolean): any;
    set(path: ObjectPath.PathTypes, value: any, doNotReplace?: boolean, noThrow?: boolean, ownPropertiesOnly?: boolean): any;
    del(path: ObjectPath.PathTypes, noThrow?: boolean, ownPropertiesOnly?: boolean): O;
    has(path: ObjectPath.PathTypes, noThrow?: boolean, ownPropertiesOnly?: boolean): boolean;
    insert(path: ObjectPath.PathTypes, value: any, at?: number, noThrow?: boolean, ownPropertiesOnly?: boolean): void;
    empty(path: ObjectPath.PathTypes, noThrow?: boolean, ownPropertiesOnly?: boolean): any;
    push(path: ObjectPath.PathTypes, args: Array<any>, noThrow?: boolean, ownPropertiesOnly?: boolean): void;
    coalesce<T>(paths: ObjectPath.PathTypes[], defaultValue: T, noThrow?: boolean, ownPropertiesOnly?: boolean): T;
    get<T>(path: ObjectPath.PathTypes, defaultValue: T, noThrow?: boolean, ownPropertiesOnly?: boolean): T;
    extend<T>(ctor: ObjectPath.Extender<T>, noConflict?: boolean): ObjectPath.Wrapper;
  }

}

declare module 'object-path' {
  var objectPath: ObjectPath.Wrapper;
  export = objectPath;
}

declare var objectPath: ObjectPath.Wrapper;