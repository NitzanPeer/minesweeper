// Step1 – the seed app:
// 1. Create a 4x4 gBoard Matrix containing Objects.
// 2. Set 2 of them to be mines
// 3. Present the mines using renderBoard() function.

// Step2 – counting neighbors:
// 1. Create setMinesNegsCount() and store the numbers
// 2. Update the renderBoard() function to also display
// the neighbor count and the mines
// 3. Add a console.log – to help you with debugging

// Step3 – click to reveal:
// 1. When clicking a cell, call the onCellClicked() function.
// 2. Clicking a safe cell reveals the minesAroundCount of this cell

// Step4 – randomize mines' location:
// 1. Add some randomicity for mines location
// 2. After you have this functionality working– its best to comment
// the code and switch back to static location to
// help you focus during the development phase

// Step5 –
// 1. Add a footer with your name
// 2. Upload to git



const MINE = '💣'
const FLAG =  '🚩'

var gBoard
var gGame
var gLevel

gLevel = {
    SIZE: 4,
    MINES: 2
}


function onInit() {

    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    // game on only after first click + settin up the mines

    gBoard = buildBoard(gLevel.SIZE)
    allPossiblePos = createPosArr(gBoard)
    // placeMinesRand(gBoard, gLevel.MINES, allPossiblePos)
    setMinesNegsCount(gBoard)
    renderBoard(gBoard)
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
            cellClass += (currCell.isMine)? 'mine' : ''
            strHTML += `<td class="${cellClass}"
                            onclick="onCellClicked(this,${i},${j})"
                            oncontextmenu="onCellMarked(this,${i},${j}); return false;">`
            //Reveal test:
            // board[1][1].isShown = false

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
    console.log('elCell', elCell)
    var cellPos = {i, j}
    console.log('cellPos', cellPos)
    var clickedCell = gBoard[i][j]
    // console.log('clickedCell', clickedCell)

    if (!gGame.isOn || elCell.classList.contains('marked')) {
        console.log("Game off or cell flagged!")
        return
    }

    if (elCell.classList.contains('mine')) {
        console.log('STEPPED ON A MINE!')
        // GameOver()
        return
    }

    if (clickedCell.minesAroundCount) {
        showCell(cellPos, clickedCell)
        gGame.shownCount++
    }

    // Main algo (if num of mines exist - show, else continue)
//     for (var i = 0; i < array.length; i++) {
//         for (var j = 0; j < array.length; j++) {
//             var currCell = gBoard[i][j]

//             if (currCell.minesAroundCount) continue

//         }
//     }
}


// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
    const cellSelector = '.' + getClassName(location) // .cell-i-j
    const elCell = document.querySelector(cellSelector)
    elCell.innerHTML = value
  }

function showCell(pos, clickedCell) {
    if (clickedCell === MINE) {
        renderCell(pos, MINE)
    } else if (clickedCell){
        gBoard[pos.i][pos.j].isShown = true
        renderCell(pos, clickedCell.minesAroundCount)
    }
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