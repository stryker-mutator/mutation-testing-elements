export interface Location {
  start: Position;
  end: Position;
}

export interface Position {
  line: number;
  column: number;
}
