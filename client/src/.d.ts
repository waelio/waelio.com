

declare EnumSudokuCell = {
  id?: string,
  value: number | string | null,
  x?: number,
  y?: number,
  gName?: string
}
declare Letter = string

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
enum NoteActions { 'show', 'success', 'info', 'warning', 'error', 'log', 'debug', 'loading' }
declare GridLetters = [...Letter]
declare Note = (action: NoteActions, ...params: any) => any
declare Note.success = (...params: any) => any
declare Note.info = (...params: any) => any
declare Note.error = (...params: any) => any
declare Note.warning = (...params: any) => any
declare Note.log = (...params: any) => any
declare global {
  interface Window { ethereum: any; }
}