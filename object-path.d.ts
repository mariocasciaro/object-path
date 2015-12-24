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

  export interface PathTypesAny {
    [index: string]: any;
  }
  export type PathTypes = (Array<string | number | symbol>) | (number | string  | symbol | PathTypesAny);
  export type Extender = (base: ExtenderBase, options: Options) => Object;
  export const defaultOptions: Options;

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
  export function bind<O extends ObjectPath.O>(obj: O, from?: ObjectPath.Class): ObjectPath.Bound<O>;

  export var instance: Class;

  export interface O extends Object, Array<any> {
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

  export interface ObjectPath extends Base {
    set<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes, value: any, doNotReplace: boolean): any;
    ensureExists<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes, value: any): any;
    get<O extends ObjectPath.O, T>(obj: O, path: ObjectPath.PathTypes, defaultValue?: T): T;
    del<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes): any;
    option(options: ObjectPath.Options): ObjectPath.Class;
    extend(ctor: ObjectPath.Extender): ObjectPath.Class;
    has<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes): boolean;
    coalesce<O extends ObjectPath.O>(obj: O, paths: ObjectPath.PathTypes[], defaultValue: any): any;
    push<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes, args: any[] | any): ObjectPath.Class;
    insert<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes, value: any, at: number): ObjectPath.Class;
    empty<O extends ObjectPath.O>(obj: O, path: ObjectPath.PathTypes): any;
    bind<O extends ObjectPath.O>(obj: O): ObjectPath.Bound<O>;
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
    push?(path: PathTypes, args: any[]): Bound<O>;
    insert?(path: PathTypes, value: any, at: number): Bound<O>;
    empty?(path: PathTypes): any;
  }

}

declare module 'object-path' {
  export = ObjectPath;
}

declare var ObjectPathBase: typeof ObjectPath;
declare var objectPath: ObjectPath.Class;