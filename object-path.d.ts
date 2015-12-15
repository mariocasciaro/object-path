declare namespace ObjectPath {

  export interface Options {
    /**
     * Treat numbers in string paths as arrays when setting properties
     */
    numberAsArray?: boolean;
    /**
     * When set to false, can access non-enumerables
     */
    ownPropertiesOnly?: boolean;
  }

  export const defaultOptions: ObjectPath.Options;
  
  export function merge(base: any, ...args: any[]): any;
  export function isEmpty(value: any, ownPropertiesOnly?: boolean): boolean;
  export function toString(type: any): string;
  export function isNumber(value: any): boolean;
  export function isString(obj: any): boolean;
  export function isObject(obj: any): boolean;
  export function isArray(obj: any): boolean;
  export function isBoolean(obj: any): boolean;
  export function getKey(key: string): number | string;
  export function ensureExists(obj: any, path: any, value: any, ownPropertiesOnly?: boolean, numberAsArray?: boolean): any;
  export function set(obj: any, path: any, value: any, doNotReplace: boolean, ownPropertiesOnly?: boolean, numberAsArray?: boolean): any;
  export function del(obj: any, path: any, ownPropertiesOnly?: boolean): any;
  export function has(obj: any, path: any, ownPropertiesOnly?: boolean): boolean;
  export function insert(obj: any, path: any, value: any, at: number, ownPropertiesOnly?: boolean, numberAsArray?: boolean): void;
  export function empty(obj: any, path: any, ownPropertiesOnly?: boolean, numberAsArray?: boolean): any;
  export function push(obj: any, path: any, args: any[], ownPropertiesOnly?: boolean, numberAsArray?: boolean): void;
  export function coalesce<T>(obj: any, paths: any, defaultValue: T, ownPropertiesOnly?: boolean): T;
  export function get<T>(obj: any, path: any, defaultValue: T, ownPropertiesOnly?: boolean): T;

  export var instance: Class;

  export interface Base {
  }

  export interface ExtenderBase extends Base {
    merge(base: any, ...args: any[]): any;
    isEmpty(value: any, ownPropertiesOnly?: boolean): boolean;
    toString(type: any): string;
    isNumber(value: any): boolean;
    isString(obj: any): boolean;
    isObject(obj: any): boolean;
    isArray(obj: any): boolean;
    isBoolean(obj: any): boolean;
    getKey(key: string): number | string;
    ensureExists(obj: any, path: any, value: any, ownPropertiesOnly?: boolean, numberAsArray?: boolean): any;
    set(obj: any, path: any, value: any, doNotReplace: boolean, ownPropertiesOnly?: boolean, numberAsArray?: boolean): any;
    del(obj: any, path: any, ownPropertiesOnly?: boolean): any;
    has(obj: any, path: any, ownPropertiesOnly?: boolean): boolean;
    insert(obj: any, path: any, value: any, at: number, ownPropertiesOnly?: boolean, numberAsArray?: boolean): void;
    empty(obj: any, path: any, ownPropertiesOnly?: boolean, numberAsArray?: boolean): any;
    push(obj: any, path: any, args: any[], ownPropertiesOnly?: boolean, numberAsArray?: boolean): void;
    coalesce<T>(obj: any, paths: any, defaultValue: T, ownPropertiesOnly?: boolean): T;
    get<T>(obj: any, path: any, defaultValue: T, ownPropertiesOnly?: boolean): T;
  }

  export interface ObjectPath extends Base {
    set(obj: Object, path: PathTypes, value: any, doNotReplace: boolean): any;
    ensureExists(obj: Object, path: PathTypes, value: any): any;
    get<T>(obj: Object, path: PathTypes, defaultValue?: T): T;
    del(obj: Object, path: PathTypes): any;
    option(options: Options): ObjectPath;
    extend(ctor: Extender): ObjectPath;
    has(obj: Object, path: PathTypes): boolean;
    coalesce(obj: Object, paths: PathTypes[], defaultValue: any): any;
    push(obj: Object, path: PathTypes, ...args: any[]): ObjectPath;
    insert(obj: Object, path: PathTypes, value: any, at: number): ObjectPath;
    empty(obj: Object, path: PathTypes): any;
    bind<O extends Object>(obj: O): Bound<O>;
  }

  export interface Class extends ObjectPath {
    options: Options;
  }

  export interface Bound<O extends Object> {
    set?(path: PathTypes, value: any, doNotReplace: boolean): any;
    ensureExists?(path: PathTypes, value: any): any;
    get?<T>(path: PathTypes, defaultValue?: T): T;
    del?(path: PathTypes): any;
    has?(path: PathTypes): boolean;
    coalesce?(paths: PathTypes[], defaultValue: any): any;
    push?(path: PathTypes, ...args: any[]): Bound<O>;
    insert?(path: PathTypes, value: any, at: number): Bound<O>;
    empty?(path: PathTypes): any;
  }

  export type PathTypes = Array<string | number> | number | string;
  export type Extender = (base: ExtenderBase, options: Options) => Object;
}

declare module 'object-path' {
  export = ObjectPath;
}

declare var objectPath: ObjectPath.Class;