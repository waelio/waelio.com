declare type EnumSudokuCell = {
  id?: string;
  value: number | string | null;
  x?: number;
  y?: number;
  gName?: string
}
declare type Letter = string
export type Letter = {
  [key]: Letter
}
enum Letter {
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
}
export type GridLetters = Array<Letter>

export interface EnumSudokuCells extends Array<EnumSudokuCell> { }
export interface SudokuRol extends EnumSudokuCells { }
export interface SudokuCol extends EnumSudokuCells { }
export interface SudokuBox extends Array<EnumSudokuCells> { }
export interface SudokuGrid extends Array<EnumSudokuCells> {
  [index?: number]: EnumSudokuCells;
  [Grid?: string]: string
}
export interface SudokuInterface extends Array<SudokuGrid> {
  [index: number]: SudokuGrid;
}
export interface SudokuLegends {
  row1: SudokuRow;
  row2: SudokuRow;
}
export interface Difficulty {
  name: string
  value: number
}
declare type Difficulties = Array<Difficulty>
export const DifficultyProps = {
  name: String,
  value: Number,
}
export interface LocationInterface {
  col: number,
  row: number
}
export type GridLocation = Record<string, LocationInterface>
export type GridLocations = Array<GridLocation>
declare type Transaction = {
  sender: string;
  receiver: string;
  addressFrom: string;
  addressTo: string;
  amount: number;
  message: string;
  keyword: string;
  timestamp: number;
  url?: string;
  gifUrl?: string;
}

declare type Transactions = Array<Transaction>
declare type NoteActions = 'show' | 'success' | 'info' | 'warning' | 'error' | 'log' | 'debug' | 'loading'
declare type Note = (action: NoteActions, ...params: any) => any
declare type NoteLoading = (action: NoteActions, ...params: any) => any
declare type NoteDialog = (...params: any) => any
declare type NoteNotify = (...params: any) => any
declare type NoteLoadingBar = (...params: any) => any
declare type NoteLoadingBarStart = (...params: any) => any
declare type NoteLoadingBarStop = (...params: any) => any
declare type NoteLoadingBarReset = (...params: any) => any
declare type NoteLoadingBarSet = (...params: any) => any
declare type NoteLoadingBarSetDefaults = (...params: any) => any
declare type NoteLoadingBarGetDefaults = (...params: any) => any
declare type NoteLoadingBarSetStyle = (...params: any) => any
declare type NoteLoadingBarGetStyle = (...params: any) => any
declare type NoteLoadingBarSetColor = (...params: any) => any
declare type NoteLoadingBarGetColor = (...params: any) => any
declare type NoteLoadingBarSetPadding = (...params: any) => any
declare type NoteLoadingBarGetPadding = (...params: any) => any
declare type NoteLoadingBarSetHeight = (...params: any) => any
declare type NoteLoadingBarGetHeight = (...params: any) => any
declare type NoteLoadingBarSetWidth = (...params: any) => any
declare type NoteLoadingBarGetWidth = (...params: any) => any
declare type NoteLoadingBarSetPosition = (...params: any) => any
declare type NoteLoadingBarGetPosition = (...params: any) => any
declare global {
  interface Window { ethereum: any; }
}