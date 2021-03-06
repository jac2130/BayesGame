
function LabeledPoint(x, y)
{
    var point = new createjs.Shape();
    point.graphics.beginFill("#000000").drawCircle(x, y, 5);
    point.graphics.endFill();
    point.regX = point.x = x;
    point.regY = point.y = y;
    stage.addChild(point);

    //var textX = x + 5;
    //var textY = y + 5;
    var roundedX = Math.round(x*100)/100;
    var roundedY = Math.round(y*100)/100;
    var pointTextText = "(" + roundedX + ", " + roundedY + ")";
    var pointFont = "12px Times New Roman";
    var pointText = new createjs.Text(pointTextText, pointFont, "black");
    pointText.x = x + 5;
    pointText.y = y + 5;
    stage.addChild(pointText);
    this.point = point;
    this.text = pointText;
}

LabeledPoint.prototype.moveTo = function(newX, newY)
{
    this.point.x = newX;
    this.point.y = newY;
    this.text.x = newX + 5;
    this.text.y = newY + 5;
    var roundedX = Math.round(newX*100)/100;
    var roundedY = Math.round(newY*100)/100;
    this.text.text = "(" + roundedX + ", " + roundedY + ")";
}

function devectorize(vector)
{
    var vecLenSq = Math.pow(vector[0], 2) + Math.pow(vector[1], 2);
    var vecLen = Math.pow(vecLenSq, 0.5);
    var thetaRad;
    if (vector[0] === 0) {
        if (vector[1] > 0) {
            thetaRad = Math.PI/2;
        } else {
            thetaRad = -Math.PI/2;
        }
    } else {
        thetaRad = Math.atan(vector[1]/vector[0]);
        if (vector[0] < 0) {
            thetaRad += Math.PI;
        }
    }
    var thetaDeg = thetaRad/Math.PI*180;
    return [vecLen, thetaDeg];
}

function vectorize(length, theta)
{
    thetaRad = theta/180*Math.PI;
    var x = length*Math.cos(thetaRad);
    var y = length*Math.sin(thetaRad);
    return [x, y];
}

function addVectors(vec1, vec2)
{
    return [vec1[0] + vec2[0], vec1[1] - vec2[1]];
}

function radToDeg(angleRad)
{
    return angleRad/Math.PI*180;
}

function degToRad(angleDeg)
{
    return angleDeg/180*Math.PI;
}

function calcDist(vec1, vec2)
{
    var deltaX2 = Math.pow(vec1[0] - vec2[0], 2);
    var deltaY2 = Math.pow(vec1[1] - vec2[1], 2);
    var dist = Math.pow(deltaX2 + deltaY2, 0.5);
    return dist;
}

function calcTheta(fromVec, toVec)
{
    var deltaX = toVec[0] - fromVec[0];
    var deltaY = -toVec[1] + fromVec[1];
    var res = devectorize([deltaX, deltaY]);
    var mag = res[0];
    var theta = res[1];
    return theta;
}

var Widget = {
    // don't use directly, instantiate with constructor function
    // that sets the data members:
    // data members:
    //      shape
    //      height
    //      width

    // subWidgets is a list of widgets that gets rendered whenever
    // this widget gets rendered
    // each object in this list has two members: widget and position

    // parentContainer is the parent container of the shape
    // position is the position on the parent to render the rect
    // refPos is an optional arg for refPos of shape itself
    render: function(parentContainer, position, refPos, index)
    {
        if (notDef(parentContainer) || notDef(parentContainer.addChild)) {
            errLog("attempting to render a widget on an invalid object");
        }
        if (typeof index === 'undefined') {
            parentContainer.addChild(this.shape);
        } else {
            parentContainer.addChildAt(this.shape, index);
        }
        this.move(position, refPos);
    },

    erase: function ()
    {
        var parentShape = this.getParent();
        parentShape.removeChild(this.shape);
    },

    move: function(position, refPos)
    {
        var defaultRefPos;
        if (typeof this.defaultRefPos === 'undefined' && typeof this.refPos === 'undefined') {
            defaultRefPos = {x:0, y:0};
        } else if (typeof this.defaultRefPos === 'undefined') {
            defaultRefPos = this.refPos;
        } else {
            defaultRefPos = this.defaultRefPos;
        }
        refPos = this._interpretPos(refPos, defaultRefPos);
        this.refPos = refPos;
        this.shape.regX = refPos.x;
        this.shape.regY = refPos.y;
        if (typeof position.x !== 'undefined') {
            this.shape.x = position.x;
        }
        if (typeof position.y !== 'undefined') {
            this.shape.y = position.y;
        }
    },

    moveIncr: function(posIncr) {
        this.shape.x += posIncr.x;
        this.shape.y += posIncr.y;
    },

    _interpretPos: function(refPos, defaultPos)
    {
        predefPos = {
            'center': {x: this.width/2, y: this.height/2},
            'ulCorner': {x: 0, y: 0},
            'blCorner': {x: 0, y: this.height},
            'urCorner': {x: this.width, y: 0},
            'brCorner': {x: this.width, y: this.height}
        }
        if (typeof refPos === 'undefined') {
            refPos = defaultPos;
        }
        if (typeof predefPos[refPos] !== 'undefined') {
            verifyIn("width", this, "the widget");
            return predefPos[refPos];
        } else {
            return refPos;
        }
    },

    setShape: function(aShape)
    {
        this.shape = aShape;
        aShape.widget = this;
    },

    renderW: function(parentWidget, position, refPos, index)
    {
        this.render(parentWidget.shape, position, refPos, index);
    },

    getPos: function ()
    {
        return Point(this.shape.x, this.shape.y);
    },

    getParent: function ()
    {
        if (typeof this.shape.parent === 'undefined') {
            return null;
        } else {
            return this.shape.parent;
        }
    },

    getParentW: function ()
    {
        if (typeof this.shape.parent === 'undefined') {
            return null;
        } else if (typeof this.shape.parent.widget === 'undefined') {
            return null;
        } else {
            return this.shape.parent.widget;
        }
    },
}

function WidgetHL () {
    var newWidget = Object.create(Widget);
    newWidget.setShape(new createjs.Container());
    return newWidget;
}

function WidgetLL () {
    var newWidget = Object.create(Widget);
    newWidget.setShape(new createjs.Shape());
    return newWidget;
}

var CircleWidget = Object.create(Widget);

CircleWidget.changeColor = function(newColor)
{
    this.shape.graphics.clear();
    drawCircleGraphic(this.shape, this.radius, newColor, 
                      this.borderWidth, this.borderColor);
}

function makeCircle(radius, color, borderWidth, borderColor)
{
    var circle = Object.create(CircleWidget);
    circle.setShape(new createjs.Shape());
    drawCircleGraphic(circle.shape, radius, color, 
                      borderWidth, borderColor);
    circle.shape.x = 0;
    circle.shape.y = 0;
    circle.radius = radius;
    circle.color = color;
    circle.width = radius * 2;
    circle.height = radius * 2;
    circle.defaultRefPos = "center";

    if (typeof borderWidth === 'undefined') {
        circle.borderWidth = 0;
    }
    if (typeof borderColor === 'undefined') {
        circle.borderColor = "black";
    }
    return circle;
}

var RectWidget = Object.create(Widget);

RectWidget.changeColor = function(newColor)
{
    this.shape.graphics.clear();
    drawRectGraphic(this.shape, this.width, this.height, newColor, 
                    this.borderWidth, this.borderColor, this.borderRadius);
}

RectWidget.changeHeight = function(newHeight)
{
    this.shape.scaleY = newHeight/this.origHeight;
    this.height = newHeight;
}

RectWidget.changeWidth = function(newWidth)
{
    this.shape.scaleX = newWidth/this.origWidth;
    this.width = newWidth;
}

function makeRect(width, height, color, borderWidth, borderColor, borderRadius)
{
    var newRect = Object.create(RectWidget);
    if (typeof borderWidth === 'undefined') {
        borderWidth = 0;
    }
    if (typeof borderColor === 'undefined') {
        borderColor = "black";
    }
    if (typeof borderRadius === 'undefined') {
        borderRadius = 0;
    }

    newRect.setShape(makeRectShape(width, height, color,
            borderWidth, borderColor, borderRadius));

    newRect.borderWidth = borderWidth;
    newRect.borderColor = borderColor;
    newRect.borderRadius = borderRadius;
    newRect.width = width;
    newRect.origWidth = width;
    newRect.height = height;
    newRect.origHeight = height;
    newRect.color = color;
    return newRect;
}

function makeRectShape(width, height, color, 
                       borderWidth, borderColor, borderRadius)
{
    var rectShape = new createjs.Shape();
    drawRectGraphic(rectShape, width, height, color, 
            borderWidth, borderColor, borderRadius);
    return rectShape;
}

function drawCircleGraphic(circleShape, radius, color, 
                           borderWidth, borderColor)
{
    circleShape.graphics.clear();
    circleShape.graphics.beginFill(color);
    if (borderWidth > 0) {
        circleShape.graphics.beginStroke(borderColor);
        circleShape.graphics.setStrokeStyle(borderWidth);
    }
    circleShape.graphics.drawCircle(radius, radius, radius);
    circleShape.graphics.endFill();
    if (borderWidth > 0) {
        circleShape.graphics.endStroke();
    }
    circleShape.regX = radius;
    circleShape.regY = radius;
}

function drawRectGraphic (rectShape, width, height, color, 
                          borderWidth, borderColor, borderRadius)
{
    rectShape.graphics.beginFill(color);

    if (borderWidth > 0) {
        rectShape.graphics.beginStroke(borderColor);
        rectShape.graphics.setStrokeStyle(borderWidth);
    }

    if (borderRadius > 0) {
        rectShape.graphics.drawRoundRect(0, 0, width, height, borderRadius);
    } else {
        rectShape.graphics.drawRect(0, 0, width, height);
    }
    rectShape.graphics.endFill();

    if (borderWidth > 0) {
        rectShape.graphics.endStroke();
    }

    rectShape.regX = rectShape.x = 0;
    rectShape.regY = rectShape.y = 0;
}

var TextWidget = Object.create(Widget);

function makeTextWidget(text, fontSize, fontFamily, color, bold)
{
    if (typeof fontFamily === "undefined") {
        fontFamily = "Arial";
    }
    if (typeof color === "undefined") {
        color = "black";
    }
    var font = fontSize + "px " + fontFamily;
    if (bold === true)
    {
        font = "bold " + font;
    }
    var textWidget = Object.create(TextWidget);
    textWidget.setShape(new createjs.Text(text, font, color));
    textWidget.height = textWidget.shape.getMeasuredHeight();
    textWidget.width  = textWidget.shape.getMeasuredWidth();
    textWidget.rectX = textWidget.x = 0;
    textWidget.rectY = textWidget.y = 0;
    return textWidget
}

function makeTextWidget2(text, fontSize, color, fontFamily, bold)
{
    return makeTextWidget(text, fontSize, fontFamily, color, bold)
}

TextWidget.changeText = function(newText)
{
    this.shape.text = newText;
}

TextWidget.getText = function()
{
    return this.shape.text;
}

TextWidget.getColor = function(newColor)
{
    return this.shape.color;
}

TextWidget.changeColor=function(newColor)
{
    this.shape.color=newColor;
}

TextWidget.changeFont=function(newFont)
{
    this.shape.font=newFont;
}

// across is the position of the height line on baseline
// across is percent/100 can be negative!
function makeTriangle(baseLen, height, across, color, rotAngle, 
                      borderWidth, borderColor)
{
    if (typeof rotAngle === 'undefined') {
        rotAngle = 0;
    }
    if (typeof borderWidth === 'undefined') {
        borderWidth = 0;
    }
    if (typeof borderColor === 'undefined') {
        borderColor = "black";
    }
    var point1 = {x: 0, y: height};
    var point2 = {x: across*baseLen, y: 0};
    var point3 = {x: baseLen, y: height}
    var triangle = Object.create(Widget);
    triangle.shape = new createjs.Shape();
    var g = triangle.shape.graphics.beginFill(color);
    if (borderWidth) {
        g.beginStroke(borderColor).setStrokeStyle(borderWidth);
    }
    g.moveTo(point1.x, point1.y).lineTo(point2.x, point2.y);
    g.lineTo(point3.x, point3.y).closePath();
    if (borderWidth) {
        g.endStroke(borderColor);
    }
    g.endFill();
    triangle.shape.regX = triangle.shape.x = baseLen*across;
    triangle.shape.regY = triangle.shape.y = height;
    triangle.shape.rotation = -rotAngle;
    triangle.defaultRefPos = {x: baseLen*across, y: height};

    triangle.width = baseLen;
    triangle.height = height;
    triangle.changeColor=function(newColor)
    {
	this.shape.color=newColor;
    }

    return triangle;
}

function makeDeleteCross(width, height, color, thickness)
{
    if (typeof thickness=='undefined') {
	thickness=2;
    }
    if (typeof color === 'undefined') {
        color = "red";
    }
    if (typeof height === 'undefined') {
        height = width;
    }
    
    var point1 = {x: 0, y: height};
    var point2 = {x: width, y: 0};
    var point3 = {x: 0, y: 0}
    var point4 = {x: width, y: height}
    var cross = Object.create(Widget);
    cross.shape = new createjs.Shape();
    cross.color=color;
    cross.drawDeleteCross=function(width, height, color, thickness)
    {
    var g = cross.shape.graphics.beginStroke(color);
    g.setStrokeStyle(thickness)
    g.moveTo(point1.x, point1.y).lineTo(point2.x, point2.y);
    g.moveTo(point3.x, point3.y).lineTo(point4.x, point4.y);
    g.endStroke();
    }
    cross.drawDeleteCross(width, height, color, thickness);
    cross.shape.regX = cross.shape.x = width;
    cross.shape.regY = cross.shape.y = height;
    
    cross.defaultRefPos = {x: 0, y: 0};
    cross.thickness=thickness;
    cross.width = width;
    cross.height = height;
    cross.changeColor=function(newColor)
    {
	this.shape.graphics.clear();
	this.drawDeleteCross(this.width, this.height, newColor, this.thickness);
	//this=makeDeleteCross(this.width, this.height, newColor, this.thickness);
    }

    return cross;
}



function makeEquiTriangle(sideLen, color, rotAngle, 
                          borderWidth, borderColor)
{
    var eqTri = makeTriangle(sideLen, sideLen*0.866, 0.5, color, rotAngle,
                             borderWidth, borderColor);
    return eqTri;
}

function makeIsosTriangle(height, mainAngle, color, rotAngle, 
                          borderWidth, borderColor)
{
    mainAngle = degToRad(mainAngle);
    baseLen = Math.tan(mainAngle/2)*height*2;
    var isosTri = makeTriangle(baseLen, height, 0.5, color, rotAngle,
                               borderWidth, borderColor);
    return isosTri;
}

function degToRad (deg) {
    return deg/180*Math.PI;
}

function radToDeg (rad) {
    return rad/Math.PI*180;
}

function vectorize2(mag, theta)
{
    var thetaRad = degToRad(theta);
    var h = mag*Math.cos(thetaRad);
    var v = mag*Math.sin(thetaRad);
    return {x:h, y: -v};
}

function devectorizeXY(components)
{
    var v = -components.y;
    var h = components.x;
    return devectorizeHV({h:h, v:v});
}

function devectorizeHV(components)
{
    var v = components.v;
    var h = components.h;
    var vecLenSq = Math.pow(h, 2) + Math.pow(v, 2);
    var vecLen = Math.pow(vecLenSq, 0.5);
    var thetaRad;
    if (h === 0) {
        if (v > 0) {
            thetaRad = Math.PI/2;
        } else {
            thetaRad = -Math.PI/2;
        }
    } else {
        thetaRad = Math.atan(v/h);
        if (h < 0) {
            thetaRad += Math.PI;
        }
    }
    var thetaDeg = thetaRad/Math.PI*180;
    return {mag: vecLen, theta: thetaDeg};
}

function localHitTest(containerObj, stageX, stageY)
{
    var pt = containerObj.globalToLocal(stageX, stageY);
    return containerObj.hitTest(pt.x, pt.y);
}


function containerHitTest(containerObj, stageX, stageY)
{
    if (localHitTest(containerObj, stageX, stageY)) {
        return true;
    }
    if (typeof containerObj.children != 'undefined') {
        for (var i=0; i < containerObj.children.length; i++) {
            if (containerHitTest(containerObj.children[i], stageX, stageY)) {
                return true;
            }
        }
    }
    return false;
}

function mouseOnWidget(widget, stageX, stageY)
{
    return containerHitTest(widget.shape, stageX, stageY);
}

function setClickOut(stage, clickOutList, clickOutList2)
{
    stage.on("mousedown", function(evt) {
        for (var i=0; i < clickOutList.length; i++) {
            if (!containerHitTest(clickOutList[i].shape, evt.stageX, evt.stageY)) {
                clickOutList[i].clickOut();
            }
        };
    });
}

function setBackground (stage, color)
{
    var rect = makeRect(fullStage.canvas.width, fullStage.canvas.height, color);
    stage.addChildAt(rect.shape, 0);
}

function setKeyboardHandlers(keyboardHandlerList)
{
    $(document).keydown(function(e)
    {
        if (e.keyCode === 8) {
            e.preventDefault();
            for (var i=0; i<keyboardHandlerList.length; i++)
            {
                keyboardHandlerList[i].handleBackspace();
            }

        }
    });

    document.getElementsByTagName('body')[0].onkeypress = function (event)
    {
        var inpChar = getChar(event || window.event);
        for (var i=0; i<keyboardHandlerList.length; i++)
        {
            keyboardHandlerList[i].handleInputChar(inpChar);
        }
    }
}

var stage;
var clickOutList = [];
var keyboardHandlerList = [];

$(function() {
    var canvasId = document.getElementsByTagName("canvas")[0].id
    stage = new createjs.Stage(canvasId);
    stage.enableMouseOver(10);
    stage.canvas.width  = window.innerWidth-20;
    stageWidth  = window.innerWidth-20;
    stage.canvas.height = window.innerHeight-20;
    stageHeight = window.innerHeight-20;
    setClickOut(stage, clickOutList);
    setKeyboardHandlers(keyboardHandlerList);
    stage.on("stagemousemove", function() {
        console.log("stagemousemove");
    });
});

function layerStage(numLayers)
{
    var layers = [];
    for (var i=0; i < numLayers; i++) {
        var layer = Object.create(Widget);
        layer.setShape(new createjs.Container());
        layers.push(layer);
        stage.addChild(layers[i].shape);
    };
    fullStage = stage;
    /*
    for (var i=layers.length-1; i>=0; i--) {
        stage.addChild(layers[i].shape);
    };
    */
    return layers;
}

var PointObj= {}
PointObj.init = function (x, y)
{
    this.x = x;
    this.y = y;
}

PointObj.addToPos = function(apoint)
{
    return Point(this.x + apoint.x,
                 this.y + apoint.y);
}

PointObj.shiftX = function(x)
{
    return Point(this.x + x,
                 this.y);
}

PointObj.shiftY = function(y)
{
    return Point(this.x,
                 this.y + y);
}

function Point(x,y) {
    var point = Object.create(PointObj);
    point.init(x,y);
    return point;
}

function paramExists(param)
{
    if (typeof param === "undefined") {
        return false;
    } else {
        return true;
    }
}
