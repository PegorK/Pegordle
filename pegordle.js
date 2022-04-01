let _answer = "PEGOR";
let _keys = "QWERTYUIOPASDFGHJKLZXCVBNM";
let _firstTry = "OH BABY! 1st Try!";
let _secondTry = "Damn! Nicely Done!";
let _thirdAndOn = "Good Job!"
let _
let _cTG = "CTG"; // todays guesses
let _cSC = "CSC"; // success
let _cLP = "CLP"; // last played
let _cPL = "CPL"; // games played
let _cWN = "CWN"; // wins
let _cST = "CST"; // win streak
let _cMS = "CMS"; // max streak
let INCEPTION = new Date("03/27/2022"); //DATE OF CREATION! PRAISE BE!
var _row = 0;
var _col = 0;
var _success = false;
var _guess = [];
var _checked = [];
var _todaysGuesses = [];
var _daysSince = 0;
var _keyboardClass = "keyboardElement"
var _lock = false;

initPage();

function initPage() {
    if (window.outerWidth<500) {
        _keyboardClass = "keyboardElementTiny";
    }

    var TODAY = new Date();
    TODAY.setHours(0,0,0,0);
    var Difference = TODAY.getTime() - INCEPTION.getTime();
    _daysSince = Math.floor(Difference / (1000 * 3600 * 24));

    $("#popUpInfo").hide();
    $("#popUpStats").hide();

    checkIfReality();
    generateGrid();
    generateKeyboard();
    checkCookies();
    updateTimer();
}

// sanity check
function checkIfReality() {
    if(1 != 1) {
        window.close(); 
        // question existence
    }
}

function updateTimer() {

    var timeNow = new Date();
    var stimeSeconds = timeNow.getSeconds() + (60 * timeNow.getMinutes()) + (60 * 60 * timeNow.getHours());
    var secTilMidnight = 86400 - stimeSeconds;
    secTilMidnight = Number(secTilMidnight);
    var h = Math.floor(secTilMidnight / 3600);
    var m = Math.floor(secTilMidnight % 3600 / 60);
    var s = Math.floor(secTilMidnight % 3600 % 60);

    $("#nextPegordle").html((h<10 ? "0":"")+ h + ":"+ (m<10 ? "0":"") + m + ":" + (s<10 ? "0":"") + s);

    setTimeout(updateTimer, 1000);
}

function generateGrid() {
    var htmlGen = "";
    for (var y=0; y<=5; y++) {
        htmlGen+="<div id=\"row_" + y +"\" class=\"rowElement\">" ;
        for (var x=0; x<=4; x++){
            htmlGen+="<div id=\"col_"+ y +"_" + x +"\" class=\"colElement\">&nbsp</div>" ;
        }
        htmlGen+="</div>";
    }
    $("#mainTable").html(htmlGen);
}

function generateKeyboard() {
    var htmlGen = "<div id=\"firstRow\" class=\"keyboardRow\">";
    for (var x=0; x<_keys.length; x++) {
        if (_keys[x] == "A") {
            htmlGen+="</div>"
            htmlGen+="<div id=\"secondRow\" class=\"keyboardRow\">";
        }
        if (_keys[x] == "Z") {
            htmlGen+="</div>"
            htmlGen+="<div id=\"thirdRow\" class=\"keyboardRow\">";
            htmlGen+="<div id=\"letter_Enter\" class=\"" + _keyboardClass + "\" onclick=\"keyPress('ENTER')\">ENTER</div>";
        }
        htmlGen+="<div id=\"letter_" + _keys[x] +"\" class=\"" + _keyboardClass + "\" onclick=\"keyPress('"+ _keys[x] +"')\">" + _keys[x] + "</div>";
        if (_keys[x] == "M") {
            htmlGen+="<div id=\"letter_Erase\" class=\"" + _keyboardClass + " iconDelete\" onclick=\"keyPress('ERASE')\">&nbsp</div>";
        }
    }
    htmlGen+="</div>"
    $("#keyboardArea").html(htmlGen);
}

function checkCookies() {
    //got here so must have played today, increase the play count
    var lastPlayedCookie = getCookie(_cLP);
    var playCount = getCookie(_cPL);
    var wins = getCookie(_cWN);
    var streak = getCookie(_cST);
    var maxStreak = getCookie(_cMS);
    var today = new Date();
    today.setHours(0,0,0,0) //don't care about the hours.
    
    if (maxStreak == "") {
        maxStreak = 0;
    }

    if (streak == "") {
        streak = 0;
    }

    if (wins == "") {
        wins = 0;
    }

    if (playCount == '') {
        playCount = 1;
        setCookie(_cPL, playCount, false);
        $("#popUpInfo").show();
    }

    if (lastPlayedCookie == '') {
        setCookie(_cLP, today, false);
    } else {
        var lastPlayed = new Date(lastPlayedCookie)
        lastPlayed.setHours(0,0,0,0) //don't care about the hours.
        if (today.getTime() != lastPlayed.getTime()) {
            playCount = parseInt(playCount) + 1;
            console.log(playCount)
            setCookie(_cPL, playCount, false);
            setCookie(_cLP, today, false);
        }
    }

    var winPercent = 0;
    if (wins != 0) {
        winPercent = Math.floor((parseInt(wins)/parseInt(playCount))*100);
    } 

    // update stats
    $("#playedCount").html(playCount);
    $("#winPercent").html(winPercent);
    $("#currentStreak").html(streak);
    $("#maxStreak").html(maxStreak);


    // update if returning to game
    if( getCookie(_cTG) == '') {
        return;
    } else {
        _todaysGuesses = getCookie(_cTG).split(",");
    }

    for(var x=0; x<_todaysGuesses.length; x++) {
        _row = x;
        _checked = [];
        for(var y=0; y<5; y++){
            keyPress(_todaysGuesses[x][y]);
            checkLetters(y, false);
        }
        _guess = [];
        _checked = [];
        _row += 1;
        _col = 0;
    }

    _success = getCookie(_cSC);
    if (_success == "true") {
        _success = true;
        displaySuccess(true);
    } else if (_row == 6) {
        _success = false;
        displayFailure();
    } else {
        _success = false;
    }
}

function keyPress(letter) {
    if ($("#popUpInfo").is(":visible") || $("#popUpStats").is(":visible")){
        return;
    }

    if (_success || _lock) {
        return;
    }

    if (letter == 'ENTER') {
        if (_col==5 && _row!=7){
            checkAnswer();
        }
    } else if (letter == 'ERASE') {
        $("#col_"+_row+"_"+(_col-1)).html("&nbsp")
        $("#col_"+_row+"_"+(_col-1)).removeClass("addLetter");
        if(_col!=0){
            _guess.pop();
            _col--;
        }
    } else {
        if (_col!=5) {
            $("#col_"+_row+"_"+_col).html(letter);
            $("#col_"+_row+"_"+_col).addClass("addLetter");
            _guess.push(letter);
            _col++;
        }
    }
}

function checkAnswer() {
    _lock = true;

    if (_guess.join("") == _answer) {
        _success = true;
    }
    if (jQuery.inArray(_guess.join(""), _allowedWords) == -1) {
        $("#row_"+_row).addClass("badWord");
        showMessage("Not in word list!")
        setTimeout(clearBadWord, 200);

        _lock = false;

        return;
    }

    //check letters with delay to add effect.
    checkLetters(0, true);
    _todaysGuesses.push(_guess.join(""));
    setCookie(_cTG, _todaysGuesses, true);
    setCookie(_cSC, _success, true);
}

function clearBadWord() {
    $("#row_"+_row).removeClass("badWord");
}

// recursive function, cause why not.
function checkLetters(count, doAnimation) {
    if (_guess[count] == _answer[count]) {
        $("#col_"+_row+"_"+count).addClass("correctLetter");
        if ( $("#letter_" + _guess[count]).hasClass("existsKeyboardLetter")) { 
            $("#letter_" + _guess[count]).removeClass("existsKeyboardLetter")
        }
        $("#letter_" + _guess[count]).addClass("correctKeyboardLetter");
    } else if ( jQuery.inArray(_guess[count], _answer) != -1 ) {
        if ((_answer.split(_guess[count]).length-1) > (_checked.join("").split(_guess[count]).length-1)) {
            $("#col_"+_row+"_"+count).addClass("existsLetter");
        } else {
            $("#col_"+_row+"_"+count).addClass("incorrectLetter");
        }

        if ( $("#letter_" + _guess[count]).hasClass("correctKeyboardLetter") == false) {
            $("#letter_" + _guess[count]).addClass("existsKeyboardLetter");
        }
    } else {
        $("#col_"+_row+"_"+count).addClass("incorrectLetter");
        $("#letter_" + _guess[count]).addClass("incorrectKeyboardLetter");
    }
    
    _checked.push(_guess[count]);
    
    if (count!=4 && doAnimation) {
        setTimeout(function(){checkLetters(++count, true)}, 300);
    } else {
        if (_success && doAnimation) {
            _row++;
            displaySuccess(false);
        } else if (_row!=5 && doAnimation) {
            _row++;
            _col=0;
            _guess = [];
            _checked = [];
        } else if (_row == 5) {
            displayFailure();
        }
        
        _lock = false;
    }
}

function displayInfo() {
    $("#popUpStats").hide();
    $("#popUpInfo").show();
}

function displayStats(showShare) {
    $("#popUpInfo").hide();
    $("#popUpStats").show();
    if (showShare) {
        $("#shareButton").show()
    } else {
        $("#shareButton").hide()
    }
}


function closeInfo(stats) {
    if(stats) {
        setTimeout(function(){$("#popUpStats").fadeOut(400);}, 50);
    } else {
        setTimeout(function(){$("#popUpInfo").fadeOut(400);}, 50);
    }
}

function displaySuccess(fromCookie) {
    if(_row <= 1) {
        showMessage(_firstTry);
    } else if (_row <= 2) {
        showMessage(_secondTry);
    } else {
        showMessage(_thirdAndOn);
    }

    if (fromCookie == false) {
        var wins = getCookie(_cWN);
        var streak = getCookie(_cST);
        var maxStreak = getCookie(_cMS);
        var playCount = getCookie(_cPL);

        if(wins == "") {
            wins = 1;
            console.log("Must be first win!")
        } else {
            wins = parseInt(wins) + 1;
        }

        if(streak == "") {
            streak = 1;
            console.log("Must be first win!")
        } else {
            streak = parseInt(streak) + 1;
        }

        if(maxStreak == "") {
            maxStreak = 1;
            console.log("Must be first win!")
        } else if (maxStreak < streak) {
            maxStreak = streak;
        }

        setCookie(_cWN, wins, false);
        setCookie(_cST, streak, false);
        setCookie(_cMS, maxStreak, false);

        var winPercent = 0;
        if (wins != 0) {
            winPercent = Math.floor((parseInt(wins)/parseInt(playCount))*100);
        } 

        $("#playedCount").html(playCount);
        $("#winPercent").html(winPercent);
        $("#currentStreak").html(streak);
        $("#maxStreak").html(maxStreak);

        setTimeout(function(){displayStats(true);},800);
    } else {
        setTimeout(function(){displayStats(true);},200);
    }
}

function displayFailure() {
    setCookie(_cST, 0, false);
    showMessage(":| IT'S SPELLED P-E-G-O-R", 2000);
    setTimeout(function(){displayStats(true);}, 3000);
}

// cookie functions from w3 :)
function setCookie(cname, cvalue, expires) {
    var farAssDate = new Date("01/15/2060");
    var midnight = new Date();
    var expirationDate = "";
    midnight.setHours(23,59,59,0);
    if (expires) {
        expirationDate = "expires="+ midnight.toUTCString();
    } else {
        expirationDate = "expires="+ farAssDate.toUTCString();
    }
    document.cookie = cname + "=" + cvalue + ";" + expirationDate + ";path=/";
}


function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
        c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
        }
    }
    return "";
}

function showMessage(msg, timeout=500) {
    $("#popUpMsg").html(msg);
    $("#popUpMsg").show();
    setTimeout(function(){$("#popUpMsg").fadeOut(400);}, timeout);
}


function generateClipboard() {
    var shareText = "#Pegordle #"+ _daysSince + "  " + (_success ? _row:"X") + "/6 \r\n";
    for (var y=0; y<_row; y++) {
        for (var x=0; x<=4; x++){
            if ($("#col_"+y+"_"+x).hasClass("correctLetter")) {
                shareText += "🟩";
            } else if ($("#col_"+y+"_"+x).hasClass("incorrectLetter")) {
                shareText += "⬛";
            } else if ($("#col_"+y+"_"+x).hasClass("existsLetter")) {
                shareText += "🟨";
            }
        }
        shareText +="\r\n"
    }
    shareText += "https://Pegordle.com";
    copyToClipboard(shareText);
}


// thanks stackoverflow! https://stackoverflow.com/questions/46041831/copy-to-clipboard-with-break-line
function copyToClipboard(stringWithNewLines){
    if (navigator.canShare) {
        navigator.share({text:stringWithNewLines});
    } else {
        const mySmartTextarea = document.createElement('textarea');
        mySmartTextarea.innerHTML = stringWithNewLines;
        const parentElement = document.body.appendChild(mySmartTextarea);
        mySmartTextarea.select();
        document.execCommand('copy');
        document.body.removeChild(mySmartTextarea);
        showMessage("Copied to Clipboard!")
    }
}
