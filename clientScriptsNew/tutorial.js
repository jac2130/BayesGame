var TextBar = Object.create(Widget);

function makeTutorialBar()
{
    var tutorial = Object.create(Tutorial);
    return makeTextBar(tutorial);
}

function makeTextBar(displayList)
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

    var callbackForward = {
        "textBar": textBar,
        "call": function() {
            this.textBar.moveForward();
        }
    };
    var callbackBack = {
        "textBar": textBar,
        "call": function() {
            this.textBar.moveBack();
        }
    };

    makeClickable(textBar.nextButton, callbackForward);
    makeClickable(textBar.backButton, callbackBack);

    textBar.background.render(textBar.shape, {x:0, y:0});
    textBar.text.render(textBar.shape, {x:textBar.xMargin, 
                                        y:textBar.yMargin});
    textBar.nextButton.render(textBar.shape, {x: 500, y: 10});
	textBar.backButton.render(textBar.shape, {x: -30, y: 10});

    textBar.displayList(displayList);

    return textBar;
}

TextBar.displayText = function(toDisplay)
{
    var lines = getLines(toDisplay, this.lineWidth);
    var finalText = lines.join("\n\n");
    this.text.shape.text = finalText;
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

var Tutorial = [
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
];
