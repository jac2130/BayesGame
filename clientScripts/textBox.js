// requires jquery, createjs, jslib.js, shapeLib.js;

function makeTextBox(height, bkgdColor, textColor)
{
    if (typeof bkgdColor === 'undefined')
    {
        bkgdColor = "#DDDDDD";
    }
    if (typeof textColor === 'undefined')
    {
        textColor = "#222222";
    }
    var textBox = WidgetHL();
    var width = height/10*17;
    var textSize = height/5*4;
    var barWidth = height/10;
    var barBuf = height/10;
    var yBuf = height/20;
    var xBuf = height/10;

    textBox.background = makeRect(width, height, bkgdColor);
    textBox.background.renderW(textBox, Point(0, 0));
    textBox.text = makeTextWidget2("", textSize, textColor, "Arial", true);

    textBox.text.renderW(textBox, Point(xBuf, yBuf));
    textBox.inputBar = makeRect(barWidth, textSize, "#555555");
    //textBox.adjustBarPos();
    textBox.prevTime = getTime();
    textBox.hasEnterCallback = false;

    textBox.adjustBarPos = function()
    {
        if (this.inputBarRendered) {
            this.inputBar.erase();
        }
        var inputBarPos = this.text.shape.getMeasuredWidth() + barBuf;
        this.inputBar.renderW(this, Point(inputBarPos, yBuf));
        this.inputBarRendered = true;
    }

    textBox.getNumChars = function()
    {
        return this.text.getText().length;
    }

    textBox.removeInputBar = function()
    {
        if (this.inputBarRendered)
        {
            this.inputBar.erase();
            this.inputBarRendered = false;
        }
    }

    textBox.flickerTimer = function()
    {
        if (this.isActive)
        {
            var currTime = getTime();
            if ((this.inputBarRendered) && (currTime > this.prevTime + 700)) {
                this.removeInputBar();
                this.prevTime = currTime;
            } else if ((!this.inputBarRendered) && (currTime > this.prevTime + 700)) {
                this.adjustBarPos();
                this.prevTime = currTime;
            }
        }
    }

    textBox.handleInputChar = function(inpChar)
    {
        if (textBox.isActive)
        {
            if ((!isNaN(parseInt(inpChar))) && (this.getNumChars() < 3)) {
                this.text.changeText(this.text.getText() + inpChar);
            }
            this.adjustBarPos();
        }
    }

    textBox.registerEnterCallback = function(enterCallback)
    {
        this.enterCallback = enterCallback;
        this.hasEnterCallback = true;
    }

    textBox.clear = function()
    {
        this.text.changeText("");
        this.adjustBarPos();
    }

    textBox.handleEnter = function()
    {
        if (textBox.isActive && this.hasEnterCallback)
        {
            this.enterCallback.enteredText = this.text.getText();
            this.enterCallback.call();
            this.clear();
        }
    }

    textBox.handleBackspace = function()
    {
        if (textBox.isActive)
        {
            var newText = this.text.getText().slice(0, -1);
            this.text.changeText(newText);
            this.adjustBarPos();
        }
    }

    textBox.handleDeactivate = function()
    {
        if (textBox.isActive)
        {
            textBox.isActive = false;
            if (textBox.text.getText() !== "")
            {
                textBox.numVal = parseInt(textBox.text.getText());
                if (textBox.numVal > 100) {
                    textBox.numVal = 100;
                }
                textBox.text.changeText("" + textBox.numVal);
            }
            textBox.removeInputBar();
        }
    }

    textBox.getNumVal = function()
    {
        if (textBox.text.getText() === "")
        {
            textBox.numVal = 0;
        }
        else
        {
            textBox.numVal = parseInt(textBox.text.getText());
            if (textBox.numVal > 100) {
                textBox.numVal = 100;
            }
        }
        //alert(textBox.numVal);
        return textBox.numVal;
    }

    textBox.shape.on("click", function()
    {
        if (!this.widget.isActive)
        {
            this.widget.prevTime = getTime();
            this.widget.adjustBarPos();
            this.widget.isActive = true;
        }
    });

    textBox.clickOut = function()
    {
        textBox.handleDeactivate();
    }

    keyboardHandlerList.push(textBox);
    clickOutList.push(textBox);

    textBox.isActive = false;
    return textBox
}
