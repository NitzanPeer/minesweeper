// DOCUMENTATION:
// The game is set up as a 3 mini games game.
// If you step on a mine - you lose a life and another game starts.
// If you lose 3 times - game over.
// The smiley resets the current mini game, not the entire match,
// and is only active in the proccess of one.


const debugMode = false

const HINT = '💡'
const SMILEY_NORM = '😃'
const SMILEY_LOSE = '🤯'
const SMILEY_WIN = '😎'
const MINE = '💣'
const FLAG =  '🚩'
const DARKMODE_SELECTORS = ['body']

var gBoard
var gGame
var gLevel

var gIntervalIdTimer = null
var gTimer = 0

var gMinePositions = []
var gPastBoardStates = []
var gPastGameStates = []

gLevel = {
    SIZE: 4,
    MINES: 2,
    LIVES: 3,
    SAFECLICKS: 3
}

function onInit() {

    gGame = {
        isOn: false,
        isFirstClick: true,
        isDarkMode: false,
        isHintMode: false,
        isSafeClick: false,
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
            var cellClass = getClassName({ i: i, j: j }) + ' ' // 'cell-0-0 '
            strHTML += `<td class="${cellClass}"
                            onclick="onCellClicked(this,${i},${j})"
                            oncontextmenu="onCellMarked(this,${i},${j}); return false;"></td>`
        }
        strHTML += '</tr>'
    }
    document.querySelector('.board').innerHTML = strHTML
}

function boardPlacement(firstClickPos){
    if(debugMode){
        // Hard coded mines:
        gBoard[1][1].isMine = true
        gBoard[2][2].isMine = true
        document.querySelector(`.cell-1-1`).classList.add('mine')
        document.querySelector(`.cell-2-2`).classList.add('mine')
    }else{
        allPossiblePos = createAllPosArr(gBoard)
        // in order not to place a mine on the user's first click:
        removeFirstClickPos(allPossiblePos, firstClickPos)
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

    if(!gGame.isOn) gGame.isOn = true

    if (!gGame.isOn || isCellMarked(elCell) || clickedCell.isShown) {
        console.log("Game off or cell flagged or cell is shown!")
        return
    }

    if (gGame.isHintMode) {
        toggleCellAndNegs(i, j, gBoard, true)
        setTimeout(toggleCellAndNegs, 1000, i, j, gBoard, false)
        gGame.isHintMode = false
        return
    }

    if(gGame.isFirstClick){
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

    if (checkVictory()) onVictory()

    gPastGameStates.push({gGame, gBoard})
    console.log('gPastGameStates', gPastGameStates)
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
    if (cell.isMine) {
        renderCell(cellPos, MINE, playerClicked)
        return
    } else if (cell.minesAroundCount){
        renderCell(cellPos, cell.minesAroundCount, playerClicked)
    }

    if(gGame.isHintMode || gGame.isSafeClick) return

    //model
    cell.isShown = true
    //DOM
    document.querySelector(`.cell-${cellPos.i}-${cellPos.j}`).classList.add('shown')
    gGame.shownCount++
}

function placeMinesRand(board, numOfMines, allPossiblePos) {
    shuffle(allPossiblePos)
    counter = 0

    while (counter < numOfMines) {
        var randPos = allPossiblePos.pop()
        //model
        board[randPos.i][randPos.j].isMine = true
        //DOM
        var elCell = document.querySelector(`.cell-${randPos.i}-${randPos.j}`)
        elCell.classList.add('mine')
        counter++
        gMinePositions.push({i: randPos.i, j: randPos.j})
    }
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

    if (!gGame.isOn || gBoard[i][j].isShown) return

    elCell.classList.toggle('marked')

    if (isCellMarked(elCell)) {
        gBoard[i][j].isMarked = true
        renderCell({i,j}, FLAG)
        if (checkVictory()) onVictory()
    } else {
        renderCell({i,j}, '')
    }
}

// Might need elCell param for the recursion
function expandShown(board, elCell, cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {

            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= board[i].length) continue
            if (board[i][j].isMine) continue
            if (board[i][j].isShown) continue

            showCell({i,j}, board[i][j])
        }
    }
}

function onFirstClicked(cellPos) {
    gGame.isFirstClick = false
    boardPlacement(cellPos)
    startTimer()
}

function checkGameOver() {
    return !gLevel.LIVES
}
function checkVictory() {
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

    return !(markedMines-gLevel.MINES)
}

function onLoseLife() {
    gGame.isOn = false
    gLevel.LIVES--
    document.querySelector('.lives').innerHTML = `${gLevel.LIVES} ❤`
    showMines()
    clearInterval(gIntervalIdTimer)

    if (checkGameOver()){
        playLo()
        onGameOver()
    }else{
        playOysh()
        openModal('click to try again')
    }
}

function onGameOver() {
    openGameEndsModal('.game-ends-modal', 'YOU LOST NESHAMA!', "red")
    smileyHandle('game-over')
}

function onVictory() {
    playKol()
    gGame.isOn = false
    clearInterval(gIntervalIdTimer)
    openGameEndsModal('.game-ends-modal', 'YOU WIN CAPARA!', "green")
    smileyHandle('victory')
}


function openGameEndsModal(className, msg, color) {
    var el = document.querySelector(className)
    el.innerHTML = msg
    el.style.display = 'block'
    el.style.backgroundColor = color
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

    onInit()
}

function smileyHandle(occurance) {
    var occurances = {
        'normal': SMILEY_NORM,
        'game-over': SMILEY_LOSE,
        'victory': SMILEY_WIN,
    }

    document.querySelector('.smiley').innerHTML = occurances[occurance]
}

function removeFirstClickPos(allPossiblePos, firstClickPos) {
    for (var i = 0; i < allPossiblePos.length; i++) {
        if(allPossiblePos[i].i === firstClickPos.i && allPossiblePos[i].j === firstClickPos.j) {
            allPossiblePos.splice(i, 1)
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
        document.querySelector(DARKMODE_SELECTORS[i]).classList.toggle('dark-mode')
    }
}

function activateHintMode(elBtn) {
    if(!gGame.isOn || gGame.isHintMode) return

    gGame.isHintMode = true
    elBtn.disabled = true
}

function toggleCellAndNegs(cellI, cellJ, board, isShow) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {

            if (j < 0 || j >= board[i].length) continue
            if (board[i][j].isShown) continue

            if(isShow) {
                showCell({i, j}, board[i][j], false)
            } else {
                hideCell({i, j}, false)
            }
        }
    }
}

function hideCell(cellPos, playerClicked) {
    renderCell(cellPos, '', playerClicked)
}

function activateSafeClick(elBtn) {
    if(!gGame.isOn || gGame.isSafeClick) return

    gLevel.SAFECLICKS--
    if(!gLevel.SAFECLICKS) elBtn.disabled = true

    gGame.isSafeClick = true

    var safePosArr = createSafePosArr(gBoard)
    shuffle(safePosArr)
    var safePos = safePosArr.pop()
    console.log('safePos', safePos)
    document.querySelector(`.cell-${safePos.i}-${safePos.j}`).classList.add('safeMarked')
    setTimeout(cellBacktoOriginalColor, 1000, safePos)

    gGame.isSafeClick = false

    elBtn.innerHTML = `✅ Safe Clicks - ${gLevel.SAFECLICKS} ✅`
}

function cellBacktoOriginalColor(pos) {
    document.querySelector(`.cell-${pos.i}-${pos.j}`).classList.remove('safeMarked')
}


// not fully working yet
function removeMines(elBtn) {
    if (!gGame.isOn) return

    elBtn.disabled = true

    var numOfMinesToRemove = 3
    var len = (numOfMinesToRemove > gLevel.MINES)? gLevel.MINES : numOfMinesToRemove
    shuffle(gMinePositions)
    console.log('gMinePositions', gMinePositions)
    console.log('len', len)

    for (let i = 0; i < len; i++) {
        console.log('i', i)
        var posToRemove = gMinePositions.pop()
        // model
        gBoard[posToRemove.i][posToRemove.j].isMine = false
        // dom
        document.querySelector(`.cell-${posToRemove.i}-${posToRemove.j}`).classList.remove('mine')
    }
    setMinesNegsCount(gBoard)
}

// not fully working yet
function undoLastMove() {
    if(gGame.isFirstClick) return

    var lastState = gPastGameStates.pop()
    console.log('lastState', lastState)

    gBoard = lastState.gBoard
    gGame = lastState.gGame
    renderBoard(gBoard)
}


// Mine Exterminator and undoLastMove bugged