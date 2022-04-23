// The entry file of your WebAssembly module.

export function addWwo(a: u32, b: u32): u32 {
  return a + b;
}



type NumberType = u32;

class Board {
  public fullsize: u32;
  public groupsize: u32;
  public cells: StaticArray<NumberType>;

  constructor(size: u32, groupsize: u32) {
    this.fullsize = size
    this.groupsize = groupsize
    this.cells = new StaticArray<NumberType>(size * size)
  }
}

let target: Board;
let randomTable: u32[];
let randomIndex : u32 = 0;

function initRandomTable(): void {
  randomTable = new Array<u32>(100);
  for (var k = 0; k < 1000; k++) {
    randomTable[k] = Math.trunc(Math.random() * 10000000) as u32;
  }
}

function random(): u32 {
  // return Math.trunc(Math.random() * 10000000) as u32;
  randomIndex++;
  return randomTable[randomIndex % 100];
}

function createBoard(size: u32, groupsize: u32): Board {
  const board = new Board(size, groupsize);
  return board;
}

function fillDefaultBoard(): void {
  let o: u32 = 0;
  const nbase: u32 = random() % target.fullsize;
  for (let r: u32 = 0; r < target.fullsize; r++) {
    let n: u32 = r * target.groupsize;
    n += Math.trunc(r / target.groupsize) as u32;
    n += nbase;
    for (let c: u32 = 0; c < target.fullsize; c++) {
      n %= target.fullsize;
      target.cells[o] = n as NumberType;
      n++;
      o++;
    }
  }
}

function _swapColumns(col1: u32, col2: u32): void {
  // console.log('swap column group', col1, col2)
  let o1: u32 = col1;
  let o2: u32 = col2;
  for (var i: u32 = 0; i < target.fullsize; i++) {
    let t: NumberType = target.cells[o1];
    target.cells[o1] = target.cells[o2];
    target.cells[o2] = t;
    o1 += target.fullsize;
    o2 += target.fullsize;
  }
}

function _swapRows(row1: u32, row2: u32): void {
  // console.log('swap row group', row1, row2)
  let o1: u32 = row1 * target.fullsize;
  let o2: u32 = row2 * target.fullsize;
  for (let i: u32 = 0; i < target.fullsize; i++) {
    let t: NumberType = target.cells[o1];
    target.cells[o1] = target.cells[o2];
    target.cells[o2] = t;
    o1 += 1;
    o2 += 1;
  }
}

function shuffleBoard(): void {

  let shuffles: u32 = target.fullsize * 2;
  while (shuffles-- > 0) {
    // shuffle whole row groups
    let rg1: u32 = random() % target.groupsize;
    let rg2: u32 = random() % target.groupsize;
    if (rg1 !== rg2) {
      let o1: u32 = rg1 * target.groupsize;
      let o2: u32 = rg2 * target.groupsize;
      for (let o: u32 = 0; o < target.groupsize; o++) {
        _swapRows(o1, o2);
        o1++;
        o2++;
      }
    }

    // shuffle whole column groups
    let cg1: u32 = random() % target.groupsize;
    let cg2: u32 = random() % target.groupsize;
    if (cg1 !== cg2) {
      let o1: u32 = cg1 * target.groupsize;
      let o2: u32 = cg2 * target.groupsize;
      for (let o: u32 = 0; o < target.groupsize; o++) {
        _swapColumns(o1, o2);
        o1++;
        o2++;
      }
    }

    // shuffle in-group rows
    let rg: u32 = (random() % target.groupsize) * target.groupsize;
    let r1: u32 = rg + (random() % target.groupsize);
    let r2: u32 = rg + (random() % target.groupsize);
    if (r1 !== r2) {
      // console.log('swap row', r1, r2)
      _swapRows(r1, r2);
    }

    // shuffle in-group columns
    let cg: u32 = (random() % target.groupsize) * target.groupsize;
    let c1: u32 = cg + (random() % target.groupsize);
    let c2: u32 = cg + (random() % target.groupsize);
    if (c1 !== c2) {
      // console.log('swap column', c1, c2)
      _swapColumns(c1, c2);
    }
  }
}

export function randomizeOneBoardWasm(
  size: u32,
  groupsize: u32
): StaticArray<NumberType> {
  initRandomTable();
  let board = createBoard(size, groupsize);
  target = board;
  fillDefaultBoard();
  shuffleBoard();
  return board.cells;
}

export function randomizeOneBoardWasmMultiple(
  times: u32,
  size: u32,
  groupsize: u32
): StaticArray<NumberType> {
  initRandomTable();
  let board: Board;
  do {
    board = createBoard(size, groupsize);
    target = board;
    fillDefaultBoard();
    shuffleBoard();
  } while (times-- > 0);
  return board.cells;
}
