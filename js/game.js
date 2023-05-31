// Further:
//
// 1. first click is never a mine
// (gGame.isOn: true + settin up the mines only after first click)
// 2. 3 lives
// lives counter etc
// 3. add the smiley btn: normal-😃 lose(no lives left)-🤯 win-😎


const SMILEY_NORM = '😃'
const SMILEY_LOSE = '🤯'
const SMILEY_WIN = '😎'
const MINE = '💣'
const FLAG =  '🚩'

var gBoard
var gGame
var gLevel

gLevel = {
    SIZE: 4,
    MINES: 2,
    LIVES: 3
}

function onInit() {

    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }

    gBoard = buildBoard(gLevel.SIZE)
    allPossiblePos = createPosArr(gBoard)
    // placeMinesRand(gBoard, gLevel.MINES, allPossiblePos)
    setMinesNegsCount(gBoard)
    renderBoard(gBoard)
    // showMines()
    // timer()
}

function buildBoard(size) {
    var board = []
    for (var i = 0; i < size; i++) {
        board.push([])
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCount: 4,
                isShown: false,
                isMine: false,
                isMarked: true
            }
        }
    }
    // Hard coded mines:
    board[1][1].isMine = true
    board[2][2].isMine = true

    console.log('board', board)
    return board
}

// Updates the num of mines around in every cell
function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var minesNegsCount = countNegs(i, j, board)
            // console.log('minesNegsCount', minesNegsCount)
            board[i][j].minesAroundCount = minesNegsCount
        }
    }
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j]
            var cellClass = getClassName({ i: i, j: j }) + ' ' // 'cell-0-0 '
            // console.log('cellClass', cellClass)
            cellClass += (currCell.isMine)? 'mine' : ''
            strHTML += `<td class="${cellClass}"
                            onclick="onCellClicked(this,${i},${j})"
                            oncontextmenu="onCellMarked(this,${i},${j}); return false;">`

            if(currCell.isShown) {
                if(currCell.isMine) {
                    strHTML += MINE
                } else if (currCell.minesAroundCount) {
                    strHTML += currCell.minesAroundCount
                } else {
                    strHTML += ''
                }
                strHTML += '</td>'
            } else {
                strHTML += ''
            }
        }
        strHTML += '</tr>'
    }
    document.querySelector('.board').innerHTML = strHTML
    // console.log('board', board)
}

function getClassName(location) {
    const cellClass = 'cell-' + location.i + '-' + location.j
    return cellClass
}

function onCellClicked(elCell, i, j) {
    // console.log('elCell-onCellClicked', elCell)
    var cellPos = {i, j}
    // console.log('ONCELLCLICKED cellPos', cellPos)
    var clickedCell = gBoard[i][j]
    // console.log('ONCELLCLICKED clickedCell', clickedCell)

    if (!gGame.isOn || elCell.classList.contains('marked')) {
        console.log("Game off or cell flagged!")
        return
    }

    if (elCell.classList.contains('mine')) {
        console.log('STEPPED ON A MINE!')
        // GameOver()
        return
    }
    // console.log('BEFORE ENTER clickedCell', clickedCell)
    showCell(cellPos, clickedCell)
    clickedCell.isShown = true

    if (!clickedCell.minesAroundCount) {
        expandShown(gBoard, elCell, i, j)
    }
}


// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
    const cellSelector = '.' + getClassName(location) // .cell-i-j
    const elCell = document.querySelector(cellSelector)
    elCell.innerHTML = value
  }

function showCell(cellPos, clickedCell) {
    // console.log('AFTER ENTER clickedCell', clickedCell)
    if (clickedCell === MINE) {
        renderCell(cellPos, MINE)
    } else if (clickedCell.minesAroundCount){
        renderCell(cellPos, clickedCell.minesAroundCount)
    }
    //model
    clickedCell.isShown = true
    //DOM
    var elCell = document.querySelector(`.cell-${cellPos.i}-${cellPos.j}`)
    elCell.classList.add('shown')
    // console.log('elCell - showCell', elCell)
    gGame.shownCount++
}

function placeMinesRand(board, numOfMines, allPossiblePos) {
    // var minePositions = []
    shuffle(allPossiblePos)
    counter = 0

    while (counter < numOfMines) {
        var randPos = allPossiblePos.pop()
        board[randPos.i][randPos.j].isMine = true
        counter++
        // minePositions.push({i: randPos.i, j: randPos.j})
    }
    // return minePositions
}

function showMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (gBoard[i][j].isMine) showCell({i, j}, MINE)
        }
    }
}

function chooseDiffi(size, mines) {
    gLevel.SIZE = size
    gLevel.MINES = mines
    onInit()
}

function onCellMarked(elCell, i, j) {
    // console.log('elCell', elCell)

    if (gBoard[i][j].isShown) return

    elCell.classList.toggle('marked')
    if (elCell.classList.contains('marked')) {
        renderCell({i,j}, FLAG)
    } else {
        renderCell({i,j}, '')
    }
}

// do we need elCell param?
function expandShown(board, elCell, cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= board[i].length) continue
            if (board[i][j].isMine) continue
            if (board[i][j].isShown) continue
            showCell({i,j}, board[i][j])
            console.log('i+j', i,j)
            console.log('gGame.shownCount', gGame.shownCount)
        }
    }
}

function shownCount() {
    console.log('gGame.shownCount', gGame.shownCount)
}


// bugs:
// shownCount bugged