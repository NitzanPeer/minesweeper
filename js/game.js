const debugMode = false


const SMILEY_NORM = '😃'
const SMILEY_LOSE = '🤯'
const SMILEY_WIN = '😎'
const MINE = '💣'
// const MINE = '<img src="img/mine1.jpg">'
const FLAG =  '🚩'
const DARKMODE_SELECTORS = ['table', '.diff1', '.diff2', '.diff3', '.lives', '.smiley']

var gBoard
var gGame
var gLevel
// timer:
var gIntervalId = null
var gTimer = 0


gLevel = {
    SIZE: 4,
    MINES: 2,
    LIVES: 3
}

function onInit() {

    gGame = {
        isOn: true,
        isFirstClick: true,
        isDarkMode: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }

    restartTimer()
    smileyHandle('normal')

    gBoard = buildBoard(gLevel.SIZE)
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
                isMarked: false
            }
        }
    }

    console.log('board', board)
    return board
}

// Updates the num of mines around every cell
function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var minesNegsCount = countNegs(i, j, board)
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
            // cellClass += (currCell.isMine)? 'mine' : ''
            strHTML += `<td class="${cellClass}"
                            onclick="onCellClicked(this,${i},${j})"
                            oncontextmenu="onCellMarked(this,${i},${j}); return false;"></td>`

            // if(currCell.isShown) {
            //     if(currCell.isMine) {
            //         strHTML += MINE
            //     } else if (currCell.minesAroundCount) {
            //         strHTML += currCell.minesAroundCount
            //     } else {
            //         strHTML += ''
            //     }
            //     strHTML += '</td>'
            // } else {
            //     strHTML += ''
            // }
        }
        strHTML += '</tr>'
    }
    document.querySelector('.board').innerHTML = strHTML
    // console.log('board', board)
}

function boardPlacement(firstClickPos){
    console.log('BOARDPLACEMENT FIRSTCLICK', firstClickPos)
    if(debugMode){
        // Hard coded mines:
        gBoard[1][1].isMine = true
        gBoard[2][2].isMine = true
        document.querySelector(`.cell-1-1`).classList.add('mine')
        document.querySelector(`.cell-2-2`).classList.add('mine')
    }else{
        allPossiblePos = createPosArr(gBoard)
        // in order to not place a mine on the user's first click:
        console.log('allPossiblePos', allPossiblePos)
        console.log('firstClickPos', firstClickPos)
        removeFirstClickPos(allPossiblePos, firstClickPos)
        // allPossiblePos.splice(0, 1, firstClickPos)
        placeMinesRand(gBoard, gLevel.MINES, allPossiblePos)
    }

    setMinesNegsCount(gBoard)
}

function getClassName(location) {
    const cellClass = 'cell-' + location.i + '-' + location.j
    return cellClass
}

function onCellClicked(elCell, i, j) {
    var cellPos = {i, j}
    var clickedCell = gBoard[i][j]

    if (!gGame.isOn || isCellMarked(elCell) || clickedCell.isShown) {
        console.log("Game off or cell flagged or cell is shown!")
        return
    }

    if(gGame.isFirstClick){
        gGame.isOn = true
        console.log('CELLCLICKED FIRST')
        onFirstClicked(cellPos)
    }

    showCell(cellPos, clickedCell, true)

    if (isCellHasMine(elCell)) {
        console.log('STEPPED ON A MINE!')
        onLoseLife()
        return
    }

    if (!clickedCell.minesAroundCount) {
        expandShown(gBoard, elCell, i, j)
    }
    console.log('gGame.shownCount', gGame.shownCount)

    if (checkVictory()) onVictory()
}


// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value, playerClicked) {
    const cellSelector = '.' + getClassName(location) // .cell-i-j
    const elCell = document.querySelector(cellSelector)
    if (value === MINE && playerClicked) {
        elCell.style.backgroundColor= 'red'
    }
    elCell.innerHTML = value

  }

function showCell(cellPos, cell, playerClicked) {
    // console.log('AFTER ENTER cell', cell)
    if (cell.isMine) {
        renderCell(cellPos, MINE, playerClicked)
        return
    } else if (cell.minesAroundCount){
        renderCell(cellPos, cell.minesAroundCount)
    }
    //model
    cell.isShown = true
    //DOM
    var elCell = document.querySelector(`.cell-${cellPos.i}-${cellPos.j}`)
    elCell.classList.add('shown')
    // console.log('elCell - showCell', elCell)
    gGame.shownCount++
}

function placeMinesRand(board, numOfMines, allPossiblePos) {
    // var minePositions = []
    shuffle(allPossiblePos)
    console.log('allPossiblePos', allPossiblePos)
    counter = 0

    while (counter < numOfMines) {
        var randPos = allPossiblePos.pop()
        console.log('randPos', randPos)
        //model
        board[randPos.i][randPos.j].isMine = true
        //DOM
        var elCell = document.querySelector(`.cell-${randPos.i}-${randPos.j}`)
        elCell.classList.add('mine')
        counter++
        // minePositions.push({i: randPos.i, j: randPos.j})
    }
    console.log('breakpoint')
    // return minePositions
}

function showMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (gBoard[i][j].isMine){
                showCell({i, j}, gBoard[i][j])
            }
        }
    }
}

function chooseDiffi(size, mines) {
    gLevel.SIZE = size
    gLevel.MINES = mines
    onInit()
}

function onCellMarked(elCell, i, j) {
    console.log('elCell', elCell)

    if (gBoard[i][j].isShown) return

    elCell.classList.toggle('marked')

    if (isCellMarked(elCell)) {
        gBoard[i][j].isMarked = true
        renderCell({i,j}, FLAG)
        if (checkVictory()) onVictory()
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

function onFirstClicked(cellPos) {
    gGame.isFirstClick = false
    boardPlacement(cellPos)
    startTimer()
}

function checkGameOver() {
    return gLevel.LIVES === 0
}
function checkVictory() {
    console.log('checkShown()', checkShown())
    console.log('checkMarked()', checkMarked())
    return (checkShown() && checkMarked())
}

function checkShown() {
    return gGame.shownCount === (gLevel.SIZE**2 - gLevel.MINES)
}

function checkMarked() {
    var markedMines = 0
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if(gBoard[i][j].isMine && gBoard[i][j].isMarked) markedMines++
        }
    }
    console.log('markedMines', markedMines)
    return !(markedMines-gLevel.MINES)
}

function onLoseLife() {
    gGame.isOn = false
    gLevel.LIVES--
    document.querySelector('.lives').innerHTML = `Lives Left: ${gLevel.LIVES}`
    showMines()
    clearInterval(gIntervalId)

    if (checkGameOver())
    {
        onGameOver()
    }
    else {
        openModal('You lost a life! \n click to try again')
    }
}

function onGameOver() {
    document.querySelector('.game-ends').innerHTML = 'YOU LOST NESHAMA!'
    document.querySelector('.game-ends').style.display = 'block'
    smileyHandle('game-over')
}

function onVictory() {
    gGame.isOn = false
    clearInterval(gIntervalId)
    document.querySelector('.game-ends').innerHTML = 'YOU WIN CAPARA!'
    document.querySelector('.game-ends').style.display = 'block'
    smileyHandle('victory')
}

function closeModal() {
    document.querySelector('.life-lost-modal').style.display = 'none'
    onInit()
}

function openModal(msg) {
    var elModal = document.querySelector('.life-lost-modal')
    elModal.style.display = 'block'
    elModal.innerHTML = msg
}

function onSmileyClick() {
    if(!gGame.isOn) return
    // gLevel.LIVES = 3
    // closeModals()
    onInit()
}

function smileyHandle(occurance) {
    if (occurance === 'normal') {
        document.querySelector('.smiley').innerHTML = SMILEY_NORM
    }else if (occurance === 'game-over') {
        document.querySelector('.smiley').innerHTML = SMILEY_LOSE
    } else if (occurance === 'victory') {
        document.querySelector('.smiley').innerHTML = SMILEY_WIN
    }
}

function removeFirstClickPos(allPossiblePos, firstClickPos) {
    for (var i = 0; i < allPossiblePos.length; i++) {
        if(allPossiblePos[i].i === firstClickPos.i && allPossiblePos[i].j === firstClickPos.j) {
            var FirstClickPos = allPossiblePos.splice(i, 1)
            console.log('FirstClickPos', FirstClickPos)
        }
    }
}

function toggleDarkMode() {
    var icon

    if(gGame.isDarkMode) {
        gGame.isDarkMode = false
        icon = '🌒'
    } else {
        gGame.isDarkMode = true
        icon = '🌖'
    }
    document.querySelector('.dark-mode-btn').innerHTML = icon

    for (var i = 0; i < DARKMODE_SELECTORS.length; i++) {
        console.log('elementos', document.querySelector(DARKMODE_SELECTORS[0]))
        document.querySelector(DARKMODE_SELECTORS[i]).classList.toggle('dark-mode')
    }
}