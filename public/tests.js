import { add, randomizeOneBoardWasm, randomizeOneBoardWasmMultiple } from "./wasm/release.js";
import { randomizeOneBoard } from '../ts/makeboard'

function renderBoardHtml2(cells, fullsize, groupsize) {
    var html = []
    html.push(`<div class="board"><table class="fs${fullsize} gs${groupsize}">`)
    var o = 0
    for(var r=0; r<fullsize; r++) {
        html.push(`<tr class="r${r}">`)
        for(var c=0; c<fullsize; c++) {
            html.push(`<td class="c${c}">${cells[o]}</td>`)
            o ++
        }
        html.push(`</tr>`)
    }

    html.push(`</table></div>`)
    return html.join('')
}

function renderBoardHtml(board) {
    return renderBoardHtml2(board.cells, board.fullsize, board.groupsize)
}

async function measure1() {
    const T0 = Date.now()
    let board
    for(let k=0; k<100000; k++) {
        board = randomizeOneBoard(9, 3);
    }
    const DT = Date.now() - T0
    console.log('DT', DT)
    document.getElementById('n1').textContent = `${DT} ms (100000 boards)`

    setTimeout(measure2, 1000)
}

async function measure2() {
    let T0 = Date.now()
    let board
    for(let k=0; k<100000; k++) {
        board = randomizeOneBoardWasm(9, 3);
    }
    let DT = Date.now() - T0
    console.log('DT', DT)
    document.getElementById('n2').textContent = `${DT} ms (100000 boards, js calling wasm fn)`

    T0 = Date.now()
    board = randomizeOneBoardWasmMultiple(100000, 9, 3);
    DT = Date.now() - T0
    console.log('DT', DT)
    document.getElementById('n3').textContent = `${DT} ms (100000 boards, wasm internal loop)`
}

export default async function test() {
    console.log( add(1, 2))

    let board, html

    board  = randomizeOneBoard(4, 2);
    html = renderBoardHtml(board)
    document.getElementById('b1').innerHTML = html

    board = randomizeOneBoard(9, 3);
    html = renderBoardHtml(board)
    document.getElementById('b2').innerHTML = html

    board = randomizeOneBoard(16, 4);
    html = renderBoardHtml(board)
    document.getElementById('b3').innerHTML = html

    let boardcells

    boardcells  = randomizeOneBoardWasm(4, 2);
    console.log('wasm board', boardcells)
    html = renderBoardHtml2(boardcells, 4, 2)
    document.getElementById('b4').innerHTML = html

    boardcells  = randomizeOneBoardWasm(9, 3);
    console.log('wasm board', boardcells)
    html = renderBoardHtml2(boardcells, 9, 3)
    document.getElementById('b5').innerHTML = html

    boardcells  = randomizeOneBoardWasm(16, 4);
    console.log('wasm board', boardcells)
    html = renderBoardHtml2(boardcells, 16, 4)
    document.getElementById('b6').innerHTML = html


    setTimeout(measure1, 1000)
}
