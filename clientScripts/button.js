var Button = Object.create(Widget);
var mousePressed = false;

function makeButton(text, width, height, color)
{
    if (typeof(color)==="undefined"){
	color = "#666"
    }
    var button = Object.create(Button);
    button.setShape(new createjs.Container());
    button.background = makeRect(width, height, "white", 1, "white", 100);
    button.text = makeTextWidget(text,  height/1.2, "Arial", color);
    var textWidth  = button.text.shape.getMeasuredWidth();
    var textHeight = button.text.shape.getMeasuredHeight();
    var textX = height/4;
    var textY = Math.log(height/4)// - 2.2*textHeight/5;
    button.background.render(button.shape, {x:0, y:0});
    button.text.render(button.shape, {x:textX, y:textY});
    return button;
}

function makeMenuButton(text, width, height)
{
    var button = Object.create(Button);
    button.setShape(new createjs.Container());
    button.background = makeRect(width, height, "rgba(0, 0, 0, 0.01)", 1, "rgba(0, 0, 0, 0.01)");
    button.text = makeTextWidget(text,  height/1.2, "Arial", "#666");
    var textWidth  = button.text.shape.getMeasuredWidth();
    var textHeight = button.text.shape.getMeasuredHeight();
    var textX = 0.5
    var textY = height/2 - 2.2*textHeight/5;
    button.background.render(button.shape, {x:0, y:0});
    button.text.render(button.shape, {x:textX, y:textY});
    return button;
}


EMPTY_CALLBACK = {
    call: function() {}
}

function makePlusButton(window, size, callback)
{
    if (typeof size === 'undefined') 
    {
        size = 25;
    }
    if (typeof callback === 'undefined') 
    {
        var callback = {
            "window": window,
            "call": function() {
		//tutorial.trigger("caseAdded");
		//warn(JSON.stringify(this.cases))
		this.window.erase();
            }
	};
    }  
    var plusButton = Object.create(Widget);
    plusButton.setShape(new createjs.Container());
    //arrowWid.background = makeRect(30, 30, "#F2F2F2", 2);
    plusButton.background = makeRect(size, size, "white", 1, '#009900', 100);
    plusButton.background.render(plusButton.shape, {x: 0, y: 0});
    
    plusButton.text = makePositiveSign(size*0.5,size*0.5, "#009900", size/10);
    plusButton.text.renderW(plusButton, {x: size*0.25, y: size*0.25});

    
    makePlusClickable(plusButton, callback);
    return plusButton;
}

function makeMinusButton(window, size, callback)
{
    if (typeof size === 'undefined') 
    {
        size = 25;
    }
    if (typeof callback === 'undefined') 
    {
        var callback = {
            "window": window,
            "call": function() {
		//tutorial.trigger("caseAdded");
		//warn(JSON.stringify(this.cases))
		this.window.erase();
            }
	};
    }  
    var minusButton = Object.create(Widget);
    minusButton.setShape(new createjs.Container());
    //arrowWid.background = makeRect(30, 30, "#F2F2F2", 2);
    minusButton.background = makeRect(size, size, "white", 1, '#FF0000', 100);
    minusButton.background.render(minusButton.shape, {x: 0, y: 0});
    
    minusButton.text = makeNegativeSign(size*0.5,size*0.5, "#FF0000", size/10);
    minusButton.text.renderW(minusButton, {x: size*0.25, y: size*0.25});

    makeMinusClickable(minusButton, callback);
    return minusButton;
}

function makePositiveButton(window, size, callback)
{
    if (typeof size === 'undefined') 
    {
        size = 35;
    }
    if (typeof callback === 'undefined') 
    {
        var callback = {
            "window": window,
            "call": function() {
		//tutorial.trigger("caseAdded");
		//warn(JSON.stringify(this.cases))
		this.window.erase();
            }
	};
    }
    var plusButton = makeButton("+", size, size);
    
    makePlusClickable(plusButton, callback);
    return plusButton;
}

function makeNegativeButton(window, size)
{
    if (typeof size === 'undefined') 
    {
        size = 35;
    }
    var minusButton = makeButton("", size, size);
    var callback = {
        "window": window,
        "call": function() {
            //tutorial.trigger("caseAdded");
	    //warn(JSON.stringify(this.cases))
            this.window.erase();
        }
    };
    makeMinusClickable(minusButton, callback);
    return minusButton;
}

// for this function, callback is an object with the method "call()"
function makeClickable(widget, callback, color)
{
    if (typeof(color)==="undefined"){
	var color = "#666";
    }
    widget.shape.on("mouseover", function(evt) {
            this.widget.background.changeColor(color);
            this.widget.text.changeColor("#ffffff");
        
    });
    widget.shape.on("mouseout", function(evt) {
        this.widget.background.changeColor("#ffffff");
	this.widget.text.changeColor(color);
    });
    widget.shape.on("mousedown", function(evt) {
        this.widget.background.changeColor("black");
	this.widget.text.changeColor("#ffffff");
        mousePressed = true;
    });
    widget.shape.on("pressup", function(evt) {
        var widget = this.widget;
        mousePressed = false;
        if (mouseOnWidget(widget, evt.stageX, evt.stageY)) {
            callback.call();
            widget.background.changeColor(color);
	    this.widget.text.changeColor("#ffffff");
        } else {
            widget.background.changeColor("#ffffff");
	    this.widget.text.changeColor(color);
        }
    });
}

function makePlusClickable(widget, callback)
{
    widget.shape.on("mouseover", function(evt) {
            this.widget.background.changeColor("#009900");
            this.widget.text.changeColor("#ffffff");
    });
    widget.shape.on("mouseout", function(evt) {
        this.widget.background.changeColor("#ffffff");
	this.widget.text.changeColor("#009900");
    });
    widget.shape.on("mousedown", function(evt) {
        this.widget.background.changeColor("black");
	this.widget.text.changeColor("#ffffff");
        mousePressed = true;
    });
    widget.shape.on("pressup", function(evt) {
        var widget = this.widget;
        mousePressed = false;
        if (mouseOnWidget(widget, evt.stageX, evt.stageY)) {
            callback.call();
            widget.background.changeColor("#009900");
	    this.widget.text.changeColor("#ffffff");
        } else {
            widget.background.changeColor("#ffffff");
	    this.widget.text.changeColor("#009900");
        }
    });
}

function makeMinusClickable(widget, callback)
{
    widget.shape.on("mouseover", function(evt) {
            this.widget.background.changeColor("#FF0000");
            this.widget.text.changeColor("#ffffff");
    });
    widget.shape.on("mouseout", function(evt) {
        this.widget.background.changeColor("#ffffff");
	this.widget.text.changeColor("#FF0000");
    });
    widget.shape.on("mousedown", function(evt) {
        this.widget.background.changeColor("black");
	this.widget.text.changeColor("#ffffff");
        mousePressed = true;
    });
    widget.shape.on("pressup", function(evt) {
        var widget = this.widget;
        mousePressed = false;
        if (mouseOnWidget(widget, evt.stageX, evt.stageY)) {
            callback.call();
            widget.background.changeColor("#FF0000");
	    this.widget.text.changeColor("#ffffff");
        } else {
            widget.background.changeColor("#ffffff");
	    this.widget.text.changeColor("#FF0000");
        }
    });
}

function makeClickable2(widget, callback)
{
    widget.shape.on("mouseover", function(evt) {
            this.widget.text.changeColor("#ffffff");
    });
    widget.shape.on("mouseout", function(evt) {
        this.widget.text.changeColor("#666");
    });
    widget.shape.on("mousedown", function(evt) {
        this.widget.text.changeColor("black");
        mousePressed = true;
    });
    widget.shape.on("pressup", function(evt) {
        var widget = this.widget;
        mousePressed = false;
        if (mouseOnWidget(widget, evt.stageX, evt.stageY)) {
            callback.call();
            widget.text.changeColor("red");
        } 
	else {
            widget.text.changeColor("#ffffff");
        }
    });
}

function makeClickable3(widget, callback, overColor, clickColor)
{
    // widget.buttonProps
    widget.origBkgdColor = widget.background.color;
    widget.overColor = overColor;
    widget.clickColor = clickColor;
    //widget.origTextColor = widget.text.getColor();
    widget.shape.on("mouseover", function(evt) {
        if (mousePressed && paramExists(widget.clickColor)) {
            this.widget.background.changeColor(widget.clickColor);
        } else if (paramExists(widget.overColor)) {
            this.widget.background.changeColor(widget.overColor);
        } else {
            this.widget.background.changeColor(widget.origBkgdColor);
        }
    });

    widget.shape.on("mouseout", function(evt) {
        this.widget.background.changeColor(widget.origBkgdColor);
    });

    widget.shape.on("mousedown", function(evt) {
        if (paramExists(widget.clickColor)) {
            this.widget.background.changeColor(widget.clickColor);
        }
        mousePressed = true;
    });

    widget.shape.on("pressup", function(evt) {
        var widget = this.widget;
        mousePressed = false;
        if (mouseOnWidget(widget, evt.stageX, evt.stageY)) {
            callback.call();
        }
        widget.background.changeColor(widget.origBkgdColor);
    });
}
