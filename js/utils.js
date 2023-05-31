function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}



function renderTimer() {
    var gElTimer = document.querySelector('.timer')
    var stopWatch = (gTimer / 1000).toFixed(3)
    gElTimer.innerText = stopWatch
}

function startTimer() {
    gIntervalIdBall = setInterval(() => {
    gTimer += 10
    renderTimer()
    }, 10)
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

function playSound() {
    const sound = new Audio('SOUND_PATH')
    sound.play()
  }

function createPosArr(board) {
    allPossiblePos = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            allPossiblePos.push({i, j})
        }
    }
    return allPossiblePos
}

function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

var time = 0
function timer() {
    setTimeout(function() {
        var timerDiv = document.querySelector('.timer')
        time++;
        timerDiv.innerHTML = time;
        timer();
        }, 1000)
}