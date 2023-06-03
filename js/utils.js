function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function isCellMarked(elCell){
    return isElHasClass(elCell, 'marked')
}

function isCellHasMine(elCell){
    return isElHasClass(elCell, 'mine')
}

function isElHasClass(el, className){
    return el.classList.contains(className)
}

function renderTimer() {
    var gElTimer = document.querySelector('.timer')
    var stopWatch = (gTimer / 1000).toFixed(0)
    gElTimer.innerText = stopWatch
}

function startTimer() {
    gIntervalIdTimer = setInterval(() => {
    gTimer += 1000
    renderTimer()
    }, 1000)
}

function restartTimer() {
    gTimer = 0
    renderTimer()
    clearInterval(gIntervalIdTimer)
}

function countNegs(cellI, cellJ, board) {
    var negsCount = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= board[i].length) continue
            if (board[i][j].isMine) negsCount++
        }
    }
    return negsCount
}

function playKol() {
    const sound = new Audio('sounds/kol_hakavod.mp3')
    sound.play()
}

function playOysh() {
    const sound = new Audio('sounds/oysh.mp3')
    sound.play()
}

function playLo() {
    const sound = new Audio('sounds/lo_nora.mp3')
    sound.play()
}

function createAllPosArr(board) {
    allPossiblePos = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            allPossiblePos.push({i, j})
        }
    }
    return allPossiblePos
}

safePosArr = []
function createSafePosArr(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if(gBoard[i][j].isShown) continue
            if(gBoard[i][j].isMine) continue
            safePosArr.push({i, j})
        }
    }
    return safePosArr
}

function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}