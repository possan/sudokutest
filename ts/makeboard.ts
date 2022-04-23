interface Board {
    fullsize: number,
    groupsize: number,
    cells: Array<number>
}



function random()  {
    return Math.floor(Math.random() * 10000000);
}

function createBoard(size: number, groupsize: number) {
    const board : Board = {
        fullsize: size,
        groupsize,
        cells: new Array(size * size).fill(0)
    }
    return board
}

function fillDefaultBoard(target: Board) {
    let o = 0
    const nbase = random() % target.fullsize
    for(let r=0; r<target.fullsize; r++) {
        let n = r * target.groupsize + Math.floor(r / target.groupsize) + nbase
        for(let c=0; c<target.fullsize; c++) {
            n %= target.fullsize
            target.cells[o] = n
            n ++
            o ++
        }
    }
}

function _swapColumns(target: Board, col1: number, col2: number) {
    // console.log('swap column group', col1, col2)
    let o1 = col1
    let o2 = col2
    for(var i=0; i<target.fullsize; i++) {
        let t = target.cells[o1]
        target.cells[o1] = target.cells[o2]
        target.cells[o2] = t
        o1 += target.fullsize
        o2 += target.fullsize
    }
}

function _swapRows(target: Board, row1: number, row2: number) {
    // console.log('swap row group', row1, row2)
    let o1 = row1 * target.fullsize
    let o2 = row2 * target.fullsize
    for(var i=0; i<target.fullsize; i++) {
        let t = target.cells[o1]
        target.cells[o1] = target.cells[o2]
        target.cells[o2] = t
        o1 += 1
        o2 += 1
    }
}

function shuffleBoard(target: Board) {
    var shuffles = target.fullsize * 2
    while(shuffles-- > 0) {
        // shuffle whole row groups
        let rg1 = random() % target.groupsize
        let rg2 = random() % target.groupsize
        if (rg1 !== rg2) {
            for(var o=0; o<target.groupsize; o++) {
                _swapRows(target, rg1*target.groupsize + o, rg2*target.groupsize + o)
            }
        }

        // shuffle whole column groups
        let cg1 = random() % target.groupsize
        let cg2 = random() % target.groupsize
        if (cg1 !== cg2) {
            for(var o=0; o<target.groupsize; o++) {
                _swapColumns(target, cg1*target.groupsize + o, cg2*target.groupsize + o)
            }
        }

        // shuffle in-group rows
        let rg = random() % target.groupsize
        let r1 = rg * target.groupsize + random() % target.groupsize
        let r2 = rg * target.groupsize + random() % target.groupsize
        if (r1 !== 22) {
            // console.log('swap row', r1, r2)
            _swapRows(target, r1, r2)
        }

        // shuffle in-group columns
        let cg = random() % target.groupsize
        let c1 = cg * target.groupsize + random() % target.groupsize
        let c2 = cg * target.groupsize + random() % target.groupsize
        if (c1 !== c2) {
            // console.log('swap column', c1, c2)
            _swapColumns(target, c1, c2)
        }
    }
}

export function randomizeOneBoard(size: number, groupsize: number) {
    let board = createBoard(size, groupsize)
    fillDefaultBoard(board)
    shuffleBoard(board)
    return board
}
