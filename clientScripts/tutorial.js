var TextBar = Object.create(Widget);

function makeTextBar()
{
    var textBar = Object.create(TextBar);
    textBar.currentPlace = 0;
    textBar.setShape(new createjs.Container());
    textBar.text = makeTextWidget("", 12, "Tahoma, Geneva, sans-serif", '#666');
    textBar.width = 520;
    textBar.xMargin = 50;
    textBar.yMargin = 8;
    textBar.height = 70;
    textBar.bkgdColor = "#FFFFFF";
    textBar.lineWidth = 70;
    textBar.background = makeRect(textBar.width, textBar.height, 
                                  textBar.bkgdColor);
    textBar.nextButton = makeButton(">", 50, 50);
    textBar.backButton = makeButton("<", 50, 50);
    var callback = {
        "textBar": textBar,
        "call": function() {
            this.textBar.moveForward();
        }
    };
    var callforth = {
        "textBar": textBar,
        "call": function() {
            this.textBar.moveBack();
        }
    };

    

    makeClickable(textBar.nextButton, callback);
    makeClickable(textBar.backButton, callforth);

    textBar.background.render(textBar.shape, {x:0, y:0});
    textBar.text.render(textBar.shape, {x:textBar.xMargin, 
                                        y:textBar.yMargin});
    textBar.nextButton.render(textBar.shape, {x: 500, y: 10});
	textBar.backButton.render(textBar.shape, {x: -30, y: 10});
    return textBar;
}

TextBar.displayText = function(toDisplay)
{
    /*
    var lines = [];
    var currTextPos = 0;
    var nextTextPos = this.lineWidth;
    while (currTextPos < toDisplay.length) 
    {
        nextTextPos = currTextPos + this.lineWidth;
        lines.push(toDisplay.substring(currTextPos, nextTextPos));
        currTextPos = nextTextPos;
    }
    */
    var lines = getLines(toDisplay, this.lineWidth);
    var finalText = lines.join("\n\n");
    //alert(finalText);
    this.text.shape.text = finalText;
    //this.text.shape.text = toDisplay;
}

function getLines(fullStr, lineWidth)
{
    verifyType(fullStr, "string", "fullStr");
    var splitStr = fullStr.split(" ");
    var lines = [];
    var wordsRemaining = splitStr;
    while (wordsRemaining.length > 0)
    {
        var lineRet = getLine(wordsRemaining, lineWidth);
        lines.push(lineRet['line']);
        var remainder = lineRet['remainder'];
        wordsRemaining = wordsRemaining.slice(lineRet['nextIndex']);
        if (remainder) {
            wordsRemaining.splice(0, 0, remainder);
        }
    }
    return lines;
}

function getLine(wordsRemaining, lineWidth)
{
    var retObj = {};
    if (wordsRemaining[0].length > lineWidth)
    {
        retObj.line = splitStr[startPos].substring(0, lineWidth-1);
        retObj.line += "-";
        retObj.nextIndex = 1;
        retObj.remainder = splitStr[startPos].substring(lineWidth-1);
        return retObj;
    } else {
        var index = 1;
        var retline = wordsRemaining[0];
        while (index < wordsRemaining.length) {
            var prospective = retline + " " + wordsRemaining[index];
            if (prospective.length > lineWidth) {
                break;
            } else {
                retline = prospective;
                index += 1;
            }
        }
        retObj.line = retline;
        retObj.remainder = "";
        retObj.nextIndex = index;
        return retObj;
    }
}

TextBar.displayList = function(alist)
{
    this.currDisplayList = alist;
    this.currentPlace = 0;
    this.displayText(this.currDisplayList[this.currentPlace]);
}

TextBar.moveForward = function()
{
    if (this.currentPlace < this.currDisplayList.length-1)
    {
        this.currentPlace += 1;
        this.displayText(this.currDisplayList[this.currentPlace]);
    }
}

TextBar.moveBack = function()
{
    if (this.currentPlace >0)
    {
        this.currentPlace -= 1;
        this.displayText(this.currDisplayList[this.currentPlace]);
    }
  
}

TextBar.flush = function()
{
    this.displayText("");
}


var Tutorial = {
    stepsTextSeq: [
        [
            "                      Welcome to Betting is Believing!",
            "This is a game where you build models of a system of variables in order to predict the value of one of these variables, given that you have observed the values of some or all of the others.",
            "Once you think that you understand how the variables causally interact, you can put your understanding to the test, by placing bets on the unobserved variable of interest.",
	    "In this tutorial, we use the 'Monty Hall problem'--as it is known in introductory probability courses--to illustrate how the game works.",
	    "After having gone through the tuturial you will build models of financial systems and bet on the values of variables that are pertinent to finance.",
	    "The brain teaser known as 'the Monty Hall problem' is loosely based on the television game show Let's Make a Deal and it is named after its original television host, Monty Hall.",
            "In the Monty Hall problem, a prize lies behind one of three doors, labeled 'A', 'B' and 'C', and it is the contestant's objective to guess correctly, which one of the three doors conceals the prize.", 
                "First, the contestant chooses one door.", "Next, the host, Monty Hall, opens one of the remaining doors, which does NOT contain the prize.",
            "Before observing Monty's choice, we can safely assume that the prize has an equal probability of being behind each of the three doors.",
            "And thus, prior to observing Monty's choice, the contestant should also choose one of the three doors at random, with equal probability.",
            "However, Monty does not choose at random! Therein lies the solution to the problem as we will see shortly.",
"Monty's choice is constrained by both, 1) the contestant's original choice and 2) the door with the prize, which Monty alone knows.",
                "Monty can NEVER choose to open the door with the prize, nor can he open the door originaly chosen by the contestant.",
            "The game demo will allow us to model the probabilities of the " +
                "variables involved in this scenario.",
            "First, you must deploy all the relevant variables.",
            "To deploy a variable you must hover your cursor over the " +
                "relevant variable name. When the variable circle pops up, " +
                "drag the circle into the main area to deploy it.",
                'First, hover your cursor over the variable "Contestant Door"'],
        ["Good! Now using your cursor, drag the circle into the main " +
            "area (the white space)"],
        ["Good! Now do the same thing with the other two variables"],
        ["Good! Now, because the Monty chooses his door based on the " +
            "positions of the other two doors, you need to draw arrows " +
            "from the other two variables to the Monty Door variable",
         "First click on the Contestant Variable circle. The circle " +
            "should glow yellow after being clicked."],
        ["Good! Now click on the Monty Variable circle. A blue arrow " +
            "should now connect from the Contestant Variable to the " +
            "Monty Variable."],
        ["Now follow the same procedure to connect the Prize Door " +
            "variable to the Monty Door variable."],
        ["Good! Now that the relationships between the variables have now " +
            "been established, we can set the probabilities",
         "To set the probability of the Contestant Door, double click the " +
             "variable's circle"],
        ['Good! Now set the probabilities to all three doors to 33% ' +
            "because the contestant has equal probability of choosing " +
            "any of the three doors."],
        ['Now, click the "Done" button to return to the main screen.'],
        ['The Prize Door also is 33% for all doors so follow the same ' +
            "procedure for the prize door"],
        ['Now, for the last variable. Go ahead and double click on the ' +
            "Monty Door circle"],
        ['As you can probably see, this variable is a little more ' +
            "complicated because it involves more than one variable and " +
            "more than one scenario",
         "In the first case, the Contestant picked the Prize Door. " +
            "In this case, Monty can either of the other two doors " +
            "with equal probability.",
         "Thus on top, in the drop-down-menus, select options " +
            '"Contestant Door = Prize Door"'],
        ['Good, now press-move the histogram bars such that door "A" ' +
            'is 0% while door "B" is 50% and door "C" is 50%'],
        ['Good, now we need a second case. Click on the "Add Case" ' +
            "button"],
        ["In the second case, the Contestant picks a non-prize door. " +
            'Thus, set the menu bar options to "Contestant Door != Prize" ' +
            'Door"'],
        ['Good! In this case, Monty only has one choice left. ' +
            'Now, assuming that door "A" is the Contestant Door and ' +
            'door "B" is the Prize Door, Monty can only choose door "C". ' +
            'Thus, set door "A" and door "B" to 0%, while setting door ' +
            '"C" to 100%'],
        ['Now finally, click the Done button'],
        ['Congratulations! You have officially finished making a bayesian ' +
            "model of the Monty Hall problem"]
    ],

    currentState: 0,
    trigNum: 0,
    init: function(textBar) {
        this.textBar = textBar;
        this.textBar.displayList(this.stepsTextSeq[this.currentState]);
    },
    trigger: function(triggerEvent) {
        if (this.currentState === 0) {
            if (triggerEvent === "sideBarIconHover") {
                if (arguments[1] === "Contestant\nDoor")
                {
                    this.moveForward();
                }
            }
        } else if (this.currentState === 1) {
            if (triggerEvent === "circleDrag") {
                if (arguments[1] === "Contestant\nDoor")
                {
                    this.moveForward();
                }
            }
        } else if (this.currentState === 2) {
            if (triggerEvent === "circleDrag") {
                if (arguments[2] === 3)
                {
                    this.moveForward();
                }
            }
        } else if (this.currentState === 3) {
            if (triggerEvent === "circleClicked") {
                if (arguments[1] === "Contestant\nDoor")
                {
                    this.moveForward();
                }
            }
        } else if (this.currentState === 4) {
            if (triggerEvent === "circleClicked") {
                if (arguments[1] === "Monte\nDoor")
                {
                    this.moveForward();
                }
            }
        } else if (this.currentState === 5) {
            if (triggerEvent === "circleClicked") {
                if (arguments[1] === "Prize\nDoor")
                {
                    this.trigNum += 1;
                }
                if (arguments[1] === "Monte\nDoor" && this.trigNum >= 1)
                {
                    this.moveForward();
                }
            }
        } else if (this.currentState === 6) {
            if (triggerEvent === "circleDblClicked") {
                if (arguments[1] === "Contestant\nDoor")
                {
                    this.moveForward();
                }
            }
        } else if (this.currentState === 7) {
            if (triggerEvent === "histBarMoved") {
                bar0Val = Math.round(arguments[1].valBars[0].value);
                bar1Val = Math.round(arguments[1].valBars[1].value);
                bar2Val = Math.round(arguments[1].valBars[2].value);
                if (bar0Val === 33 && bar1Val === 33 && bar2Val === 33)
                {
                    this.moveForward();
                }
            }
        } else if (this.currentState === 8) {
            if (triggerEvent === "doneClicked") {
                this.moveForward();
            }
        } else if (this.currentState === 9) {
            if (triggerEvent === "circleDblClicked") {
                if (arguments[1] === "Prize\nDoor")
                {
                    this.trigNum = 1;
                }
            } else if (triggerEvent === "histBarMoved" 
                        && this.trigNum === 1) {
                bar0Val = Math.round(arguments[1].valBars[0].value);
                bar1Val = Math.round(arguments[1].valBars[1].value);
                bar2Val = Math.round(arguments[1].valBars[2].value);
                if (bar0Val === 33 && bar1Val === 33 && bar2Val === 33)
                {
                    this.trigNum = 2;
                }
            } else if (triggerEvent === "doneClicked"
                        && this.trigNum === 2) {
                this.moveForward();
            }
        } else if (this.currentState === 10) {
            if (triggerEvent === "circleDblClicked") {
                if (arguments[1] === "Monte\nDoor")
                {
                    this.moveForward();
                }
            }
        } else if (this.currentState === 11) {
            if (triggerEvent === "menuClicked") {
                var var1DDM = arguments[1].cases.caseList[0][0];
                var var2DDM = arguments[1].cases.caseList[0][1]
                var equalsSign = arguments[1].cases.caseList[0][2]
                if (var1DDM.activeChoice === "Contestant Door"
                        && var2DDM.activeChoice === "Prize Door"
                        && equalsSign.activeChoice === "=")
                {
                    this.moveForward();
                }
            }
        } else if (this.currentState === 12) {
            if (triggerEvent === "histBarMoved") {
                bar0Val = Math.round(arguments[1].valBars[0].value);
                bar1Val = Math.round(arguments[1].valBars[1].value);
                bar2Val = Math.round(arguments[1].valBars[2].value);
                if (bar0Val === 0 && bar1Val === 50 && bar2Val === 50)
                {
                    this.moveForward();
                }
            }
        } else if (this.currentState === 13) {
            if (triggerEvent === "caseAdded") {
                this.moveForward();
            }
        } else if (this.currentState === 14) {
            if (triggerEvent === "menuClicked") {
                var var1DDM = arguments[1].cases.caseList[1][0];
                var var2DDM = arguments[1].cases.caseList[1][1]
                var equalsSign = arguments[1].cases.caseList[1][2]
                if (var1DDM.activeChoice === "Contestant Door"
                        && var2DDM.activeChoice === "Prize Door"
                        && equalsSign.activeChoice === "!=")
                {
                    this.moveForward();
                }
            }
        } else if (this.currentState === 15) {
            if (triggerEvent === "histBarMoved") {
                bar0Val = Math.round(arguments[1].valBars[0].value);
                bar1Val = Math.round(arguments[1].valBars[1].value);
                bar2Val = Math.round(arguments[1].valBars[2].value);
                if (bar0Val === 0 && bar1Val === 0 && bar2Val === 100)
                {
                    this.moveForward();
                }
            }
        } else if (this.currentState === 16) {
            if (triggerEvent === "doneClicked") {
                this.moveForward();
            }
        } else if (this.currentState === 17) {
        } else {
            alert("current state invalid");
        }
    },
    moveForward: function() {
        this.currentState += 1;
        this.textBar.displayList(this.stepsTextSeq[this.currentState]);
        this.trigNum = 0;
    }
}
