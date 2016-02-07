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

  export function toString(type: any): string;
  export function isNumber(value: any): value is number;
  export function isString(obj: any): obj is string;
  export function isObject(obj: any): obj is Object;
  export function isSymbol(obj: any): obj is symbol;
  export function isArray(obj: any): obj is any[];
  export function isBoolean(obj: any): obj is boolean;
  export function merge(base: any, ...args: any[]): any;
  export function isEmpty(value: string | boolean | symbol | number | Array<any> | Object, ownPropertiesOnly?: boolean): boolean;
  export function getKey(key: string | symbol): number | string | symbol;
  export function ensureExists<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes, value: any, ownPropertiesOnly?: boolean, numberAsArray?: boolean): any;
  export function set<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes, value: any, doNotReplace?: boolean, ownPropertiesOnly?: boolean, numberAsArray?: boolean): any;
  export function del<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes, ownPropertiesOnly?: boolean): any;
  export function has<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes, ownPropertiesOnly?: boolean): boolean;
  export function insert<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes, value: any, at?: number, ownPropertiesOnly?: boolean, numberAsArray?: boolean): void;
  export function empty<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes, ownPropertiesOnly?: boolean, numberAsArray?: boolean): any;
  export function push<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes, args: Array<any>, ownPropertiesOnly?: boolean, numberAsArray?: boolean): void;
  export function coalesce<O extends ObjectPath.O, T>(obj: O, paths: ObjectPath.PathTypes[], defaultValue: T, ownPropertiesOnly?: boolean): T;
  export function get<O extends ObjectPath.O, T>(obj: O, path: ObjectPath.PathTypes, defaultValue: T, ownPropertiesOnly?: boolean): T;

  export interface Wrapper {

  }

  export interface O extends Object {
    [index: string]: any;
  }

  export interface Base {
  }

  export interface ExtenderBase extends Base {
    toString(type: any): string;
    isNumber(value: any): value is number;
    isString(obj: any): obj is string;
    isObject(obj: any): obj is Object;
    isSymbol(obj: any): obj is symbol;
    isArray(obj: any): obj is any[];
    isBoolean(obj: any): obj is boolean;
    merge(base: any, ...args: any[]): any;
    isEmpty(value: string | boolean | symbol | number | Array<any> | Object, ownPropertiesOnly?: boolean): boolean;
    getKey(key: string | symbol): number | string | symbol;
    ensureExists<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes, value: any, ownPropertiesOnly?: boolean, numberAsArray?: boolean): any;
    set<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes, value: any, doNotReplace?: boolean, ownPropertiesOnly?: boolean, numberAsArray?: boolean): any;
    del<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes, ownPropertiesOnly?: boolean): any;
    has<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes, ownPropertiesOnly?: boolean): boolean;
    insert<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes, value: any, at?: number, ownPropertiesOnly?: boolean, numberAsArray?: boolean): void;
    empty<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes, ownPropertiesOnly?: boolean, numberAsArray?: boolean): any;
    push<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes, args: Array<any>, ownPropertiesOnly?: boolean, numberAsArray?: boolean): void;
    coalesce<O extends ObjectPath.O, T>(obj: O, paths: ObjectPath.PathTypes[], defaultValue: T, ownPropertiesOnly?: boolean): T;
    get<O extends ObjectPath.O, T>(obj: O, path: ObjectPath.PathTypes, defaultValue: T, ownPropertiesOnly?: boolean): T;
  }

  export interface Bound<O extends Object> {
    set?(path: PathTypes, value: any, doNotReplace: boolean): any;
    ensureExists?(path: PathTypes, value: any): any;
    get?<T>(path: PathTypes, defaultValue?: T): T;
    del?(path: PathTypes): any;
    has?(path: PathTypes): boolean;
    coalesce?(paths: PathTypes[], defaultValue: any): any;
    push?(path: PathTypes, args: any[]): Bound<O>;
    insert?(path: PathTypes, value: any, at: number): Bound<O>;
    empty?(path: PathTypes): any;
  }

}

declare module 'object-path' {
  var objectPath: ObjectPath.Wrapper;
  export = objectPath;
}

declare var objectPath: ObjectPath.Wrapper;