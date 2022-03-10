import { ViteSSGContext } from 'vite-ssg'
import type  waelioUtils  from './waelio-utils.d'

export type UserModule = (ctx: ViteSSGContext) => void
export type WaelioUtils = (ctx: waelioUtils) => void
export type EnumSudokuCell = {
  index?: number;
  value: number | string | null;
  x?: number;
  y?: number;
  gName?: string
}

export interface Letter{
  'A':'A',
  'B':'B',
  'C':'C',
  'D':'D',
  'E':'E',
  'F':'F',
  'G':'G',
  'H':'H',
  'I':'I',
}
// export type Letter = Letter
export type GridLetters = Array<Letter>
export interface EnumSudokuCells extends Array<EnumSudokuCell> { }

export interface EnumSudokuCells extends Array<EnumSudokuCell> { }
export interface SudokuRow extends EnumSudokuCells { }
export interface SudokuCol extends EnumSudokuCells { }
export interface SudokuBox extends Array<EnumSudokuCells> { }
export interface SudokuGrid extends Array<EnumSudokuCells> {}
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