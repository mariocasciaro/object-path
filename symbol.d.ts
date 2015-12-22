declare var Symbol: any;

interface ObjectConstructor {
  getOwnPropertySymbols(obj: any): symbol[];
}