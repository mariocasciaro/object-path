declare var Symbol: any;

interface ObjectConstructor {
  getOwnPropertySymbols(obj: any): symbol[];
}

interface ErrorConstructor {
  captureStackTrace?(instance: any, constructor: any): void;
}

interface Error {
  stack?: string;
}