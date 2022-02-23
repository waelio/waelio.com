export interface EnumSudokuCell = {
  id: string;
  value: number|string|null;
  x?: number;
  y?: number;
  gName?:string
}
export interface EnumSudokuCells extends Array<EnumSudokuCell>{}
export interface SudokuRol extends EnumSudokuCells{}
export interface SudokuCol extends EnumSudokuCells{}
export interface SudokuBox extends Array<EnumSudokuCells>{}
export interface SudokuGrid extends Array<EnumSudokuCells>{}
export interface SudokuInterface extends Array<SudokuGrid>{}
export interface SudokuLegends {
  row1: SudokuRow;
  row2: SudokuRow;
}  
export interface Difficulty {
  name: string
  value: number
}
export type Difficulties = Array<Difficulty>
export const DifficultyProps = {
  name: String,
  value: Number,
}
export type Transaction = {
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