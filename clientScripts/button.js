var Button = Object.create(Widget);
var mousePressed = false;

function makeButton(text, width, height)
{
    var button = Object.create(Button);
    button.setShape(new createjs.Container());
    button.background = makeRect(width, height, "white", 1, "#666", 100);
    button.text = makeTextWidget(text,  height/1.2, "Arial", "#666");
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

// for this function, callback is an object with the method "call()"
function makeClickable(widget, callback)
{
    widget.shape.on("mouseover", function(evt) {
        if (mousePressed) {
            this.widget.background.changeColor("#f0f0f0");
        } else {
            this.widget.background.changeColor("#666");
            this.widget.text.changeColor("#ffffff");
        }
    });
    widget.shape.on("mouseout", function(evt) {
        this.widget.background.changeColor("#ffffff");
	this.widget.text.changeColor("#666");
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
            widget.background.changeColor("#666");
	    this.widget.text.changeColor("#ffffff");
        } else {
            widget.background.changeColor("#ffffff");
	    this.widget.text.changeColor("#666");
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
