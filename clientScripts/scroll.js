function makeScrollArrow(upOrDown, callback)
{
    var arrowWid = Object.create(Widget);
    arrowWid.setShape(new createjs.Container());
    //arrowWid.background = makeRect(30, 30, "#F2F2F2", 2);
    arrowWid.background = makeRect(20, 10, "#ffffff", 0);
    arrowWid.background.render(arrowWid.shape, {x: 0, y: 3});
    if (upOrDown === "up") {
        arrowWid.sign = makeEquiTriangle(8, "black");
        arrowWid.sign.render(arrowWid.shape, {x: 5, y: 8});
        arrowWid.shape.on("click", function() {
            callback.call()
        });
    }
    else if (upOrDown === "left"){
	arrowWid.sign = makeEquiTriangle(8, "black", 90);
        arrowWid.sign.render(arrowWid.shape, {x: 5, y: 8});
        arrowWid.shape.on("click", function() {
            callback.call()
        });
    }
    else if (upOrDown === "right"){
	arrowWid.sign = makeEquiTriangle(8, "black", 270);
        arrowWid.sign.render(arrowWid.shape, {x: 5, y: 8});
        arrowWid.shape.on("click", function() {
            callback.call()
        });
    }
    else {
        arrowWid.sign = makeEquiTriangle(8, "black", 180);
        arrowWid.sign.render(arrowWid.shape, {x: 5, y: 3});
        arrowWid.shape.on("click", function() {
            callback.call();
        });
    }
    return arrowWid;
}


function makeFrameWidget(fullFrameWidgetWidth, fullFrameWidgetHeight,
                         frame, frameLen)
{
    var scrollBarWidget = WidgetHL();
    var arrowWidgetHeight = 10;
    var widgetBorder = 0;
    var scrollBarHeight = fullFrameWidgetHeight - 2*arrowWidgetHeight - 1;

    //var scrollBarRectHeight = scrollBarHeight - 2*widgetBorder;

    var scrollBarWidth = 10;
    //labelPoint(stage, 100+scrollBarWidth+1, 100);
    var scrollerHeight = 20;
    var sensitivity = 1;

    var frameWindowWidth = fullFrameWidgetWidth - scrollBarWidth - 2*widgetBorder;
    var fullFrameWidget = WidgetHL();
    var minSBPos = arrowWidgetHeight;
    //labelPoint(stage, 100, 100+minSBPos);
    var maxSBPos = fullFrameWidgetHeight - arrowWidgetHeight - scrollerHeight - 1;
    fullFrameWidget.minSBPos = minSBPos;
    fullFrameWidget.maxSBPos = maxSBPos;
    fullFrameWidget.fullFrameWidgetHeight = fullFrameWidgetHeight;
    fullFrameWidget.fullFrameWidgetWidth = fullFrameWidgetHeight;
    fullFrameWidget.scrollBarWidget = scrollBarWidget;

    var arrowDownPos = maxSBPos + scrollerHeight;

    scrollBarWidget.fullFrameWidget = fullFrameWidget;

    scrollBarWidget.scrollBarBack = makeRect(scrollBarWidth, scrollBarHeight, "#f0f0f0", widgetBorder, "#666");
    scrollBarWidget.scroller = makeRect(scrollBarWidth, scrollerHeight, "#B0B0B0", widgetBorder, "#666");
    var callbackUp = {
        fullFrameWidget: fullFrameWidget,
        call: function () {
            this.fullFrameWidget.moveSBIncr(-10);
        }
    }
    var callbackDown = {
        fullFrameWidget: fullFrameWidget,
        call: function () {
            this.fullFrameWidget.moveSBIncr(10);
        }
    }
    scrollBarWidget.arrowUp = makeScrollArrow("up", callbackUp);
    scrollBarWidget.arrowDown = makeScrollArrow("down", callbackDown);
    scrollBarWidget.arrowUp.renderW(scrollBarWidget, Point(0,0));
    scrollBarWidget.arrowDown.renderW(scrollBarWidget, Point(0,arrowDownPos));
    scrollBarWidget.scrollBarBack.renderW(scrollBarWidget, Point(0, minSBPos));
    scrollBarWidget.scroller.renderW(scrollBarWidget, Point(0, minSBPos));
    scrollBarWidget.renderW(fullFrameWidget, Point(0, 0));

    var windowLen = fullFrameWidgetHeight;

    var frameWidget = WidgetHL();
    frameWidget.renderW(fullFrameWidget, Point(scrollBarWidth + 1, 0));
    //frameWidget.move(Point(20,20));

    fullFrameWidget.frameWidget = frameWidget;
    fullFrameWidget.setFrameLen = function(newFrameLen) {
        if (newFrameLen < this.windowLen) {
            newFrameLen = this.windowLen;
        }
        this.maxWindowScrollLen = newFrameLen - this.windowLen;
        this.maxWindowScrollLen += frameLenIncr;
        if (this.maxWindowScrollLen < 0) {
            this.maxWindowScrollLen = 0;
        }
    }

    fullFrameWidget.incrFrameLen = function (frameLenIncr) {
        this.maxWindowScrollLen += frameLenIncr;
        if (this.maxWindowScrollLen < 0) {
            this.maxWindowScrollLen = 0;
        }
    }

    //frame.render(stage, Point(100, 100));
    var clear = createjs.Graphics.getRGB(0, 0, 0, 0);
    var frameWindow = makeRect(frameWindowWidth, windowLen, clear);
    frameWindow.shape.x = 0;
    frameWindow.shape.y = 50;
    frameWidget.frameWindow = frameWindow;
    frameWidget.frame = frame;

    //var frameWindow2 = makeRect(100, 100, "rgba(0,0,0,0)");
    frame.shape.mask = frameWindow.shape;
    //frameWindow2.renderW(frameWidget, Point(0, 50));
    //stage.addChild(frameWindow2.shape);
    frameWindow.renderW(frameWidget, Point(0, 0));
    frame.renderW(frameWidget, Point(0, 0));

    // frame.shape.setBounds(0, 0, frameWindowWidth, frameLen);
    // alert(frame.shape.getBounds());

    if (frameLen < windowLen) {
        frameLen = windowLen;
    }
    var maxWindowScrollLen = frameLen - windowLen;
    var maxBarScrollLen = maxSBPos - minSBPos;

    fullFrameWidget.windowLen = windowLen;
    fullFrameWidget.maxWindowScrollLen = maxWindowScrollLen;
    fullFrameWidget.maxBarScrollLen = maxBarScrollLen;

    sbShape = scrollBarWidget.scroller.shape;
    scrollBarWidget.scroller.fullFrameWidget = fullFrameWidget;

    fullFrameWidget.moveWindowPosIncr = function(yIncr) {
        var newWindowY = this.currWindowPos + yIncr;
        this.moveWindowPos(newWindowY);
    }

    fullFrameWidget.moveWindowPos = function(newWindowY)
    {
        if (newWindowY < 0) {
            newWindowY = 0;
        } else if (newWindowY > maxWindowScrollLen) {
            newWindowY = maxWindowScrollLen;
        }
        this.currWindowPos = newWindowY;
        this.frameWidget.frame.move(Point(0,-newWindowY));
    }

    sbShape.on("mousedown", function(evt) {
        var globalPt = this.parent.localToGlobal(this.x, this.y);
        this.widget.offset = {x:globalPt.x-evt.stageX, y:globalPt.y-evt.stageY};
    });

    sbShape.on("pressmove", function(evt) {
        var newX = this.widget.offset.x;
        var newY = evt.stageY + this.widget.offset.y;
        var localPt = this.parent.globalToLocal(newX, newY);
        var newYPos = localPt.y;

        this.widget.fullFrameWidget.moveSB(newYPos);
    });


    fullFrameWidget.moveSBIncr = function(yPosIncr) {
        this.moveSB(this.sbPos + yPosIncr);
    }

    fullFrameWidget.moveSB = function(newYPos) {
        if (newYPos < minSBPos) {
            newYPos = minSBPos;
        } else if (newYPos > maxSBPos) {
            newYPos = maxSBPos;
        }
        this.scrollBarWidget.scroller.shape.y = newYPos;
        this.sbPos = newYPos;

        var windowYPos = (newYPos - minSBPos)/(maxSBPos - minSBPos)*this.maxWindowScrollLen;
        this.moveWindowPos(windowYPos)
    }

    // fullFrameWidget.sbPos = minSBPos;
    fullFrameWidget.sbPos = maxSBPos;
    //fullFrameWidget.currWindowPos = 0;
    //fullFrameWidget.currWindowPos = 0;
    fullFrameWidget.moveSB(fullFrameWidget.sbPos);
    return fullFrameWidget;
}


function makeFrameWidgetWide(fullFrameWidgetWidth, fullFrameWidgetHeight,
                         frame, frameLen)
{
    var scrollBarWidget = WidgetHL();
    var arrowWidgetHeight = 10;
    var widgetBorder = 0;
    var scrollBarHeight = fullFrameWidgetHeight - 2*arrowWidgetHeight - 1;

    //var scrollBarRectHeight = scrollBarHeight - 2*widgetBorder;

    var scrollBarWidth = 10;
    //labelPoint(stage, 100+scrollBarWidth+1, 100);
    var scrollerHeight = 20;
    var sensitivity = 1;

    var frameWindowWidth = 220//fullFrameWidgetWidth - scrollBarWidth - 2*widgetBorder;
    var fullFrameWidget = WidgetHL();
    var minSBPos = arrowWidgetHeight;
    //labelPoint(stage, 100, 100+minSBPos);
    var maxSBPos = fullFrameWidgetHeight - arrowWidgetHeight - scrollerHeight - 1;
    fullFrameWidget.minSBPos = minSBPos;
    fullFrameWidget.maxSBPos = maxSBPos;
    fullFrameWidget.fullFrameWidgetHeight = fullFrameWidgetWidth-70;
    fullFrameWidget.fullFrameWidgetWidth = 600;
    fullFrameWidget.scrollBarWidget = scrollBarWidget;

    var arrowDownPos = maxSBPos + scrollerHeight;

    scrollBarWidget.fullFrameWidget = fullFrameWidget;

    scrollBarWidget.scrollBarBack = makeRect(scrollBarHeight, scrollBarWidth, "#f0f0f0", widgetBorder, "#666");
    scrollBarWidget.scroller = makeRect(scrollerHeight, scrollBarWidth, "#B0B0B0", widgetBorder, "#666");
    var callbackUp = {
        fullFrameWidget: fullFrameWidget,
        call: function () {
            this.fullFrameWidget.moveSBIncr(-10);
        }
    }
    var callbackDown = {
        fullFrameWidget: fullFrameWidget,
        call: function () {
            this.fullFrameWidget.moveSBIncr(10);
        }
    }
    scrollBarWidget.arrowUp = makeScrollArrow("left", callbackUp);
    scrollBarWidget.arrowDown = makeScrollArrow("right", callbackDown);
    scrollBarWidget.arrowUp.renderW(scrollBarWidget, Point(0,-3));
    scrollBarWidget.arrowDown.renderW(scrollBarWidget, Point(arrowDownPos, -3));
    scrollBarWidget.scrollBarBack.renderW(scrollBarWidget, Point(minSBPos, 0));
    scrollBarWidget.scroller.renderW(scrollBarWidget, Point(minSBPos, 0));
    scrollBarWidget.renderW(fullFrameWidget, Point(0, 0));

    var windowLen = fullFrameWidgetHeight-50;

    var frameWidget = WidgetHL();
    frameWidget.renderW(fullFrameWidget, Point( 40, scrollBarWidth));
    //frameWidget.move(Point(20,20));

    fullFrameWidget.frameWidget = frameWidget;
    fullFrameWidget.setFrameLen = function(newFrameLen) {
        if (newFrameLen < this.windowLen) {
            newFrameLen = this.windowLen;
        }
        this.maxWindowScrollLen = newFrameLen - this.windowLen;
        this.maxWindowScrollLen += frameLenIncr;
        if (this.maxWindowScrollLen < 0) {
            this.maxWindowScrollLen = 0;
        }
    }

    fullFrameWidget.incrFrameLen = function (frameLenIncr) {
        this.maxWindowScrollLen += frameLenIncr;
        if (this.maxWindowScrollLen < 0) {
            this.maxWindowScrollLen = 0;
        }
    }

    //frame.render(stage, Point(100, 100));
    var clear = createjs.Graphics.getRGB(0, 0, 0, 0);
    var frameWindow = makeRect(windowLen,frameWindowWidth, clear);
    frameWindow.shape.x = 0;
    frameWindow.shape.y = 50;
    frameWidget.frameWindow = frameWindow;
    frameWidget.frame = frame;

    //var frameWindow2 = makeRect(100, 100, "rgba(0,0,0,0)");
    frame.shape.mask = frameWindow.shape;
    //frameWindow2.renderW(frameWidget, Point(0, 50));
    //stage.addChild(frameWindow2.shape);
    frameWindow.renderW(frameWidget, Point(0, 0));
    frame.renderW(frameWidget, Point(0, 0));

    // frame.shape.setBounds(0, 0, frameWindowWidth, frameLen);
    // alert(frame.shape.getBounds());
    //alert(JSON.stringify({'frameLen':frameLen, 'windowLen':windowLen}))
    if (frameLen < windowLen) {
        frameLen = windowLen;
    }
    var maxWindowScrollLen = frameLen - windowLen;
    var maxBarScrollLen = maxSBPos - minSBPos;

    fullFrameWidget.windowLen = windowLen;
    fullFrameWidget.maxWindowScrollLen = maxWindowScrollLen;
    fullFrameWidget.maxBarScrollLen = maxBarScrollLen;

    sbShape = scrollBarWidget.scroller.shape;
    scrollBarWidget.scroller.fullFrameWidget = fullFrameWidget;

    fullFrameWidget.moveWindowPosIncr = function(xIncr) {
        var newWindowX = this.currWindowPos + xIncr;
        this.moveWindowPos(newWindowX);
    }

    fullFrameWidget.moveWindowPos = function(newWindowX)
    {
        if (newWindowX < 0) {
            newWindowX = 0;
        } else if (newWindowX > maxWindowScrollLen) {
            newWindowX = maxWindowScrollLen;
        }
        this.currWindowPos = newWindowX;
        this.frameWidget.frame.move(Point(-newWindowX, 0));
    }

    sbShape.on("mousedown", function(evt) {
        var globalPt = this.parent.localToGlobal(this.x, this.y);
        this.widget.offset = {x:globalPt.x-evt.stageX, y:globalPt.y-evt.stageY};
    });

    sbShape.on("pressmove", function(evt) {
        var newX = evt.stageX + this.widget.offset.x;
        var newY =  this.widget.offset.y;
        var localPt = this.parent.globalToLocal(newX, newY);
        var newXPos = localPt.x;

        this.widget.fullFrameWidget.moveSB(newXPos);
    });


    fullFrameWidget.moveSBIncr = function(xPosIncr) {
        this.moveSB(this.sbPos + xPosIncr);
    }

    fullFrameWidget.moveSB = function(newXPos) {
        if (newXPos < minSBPos) {
            newXPos = minSBPos;
        } else if (newXPos > maxSBPos) {
            newXPos = maxSBPos;
        }
        this.scrollBarWidget.scroller.shape.x = newXPos;
        this.sbPos = newXPos;

        var windowXPos = (newXPos - minSBPos)/(maxSBPos - minSBPos)*this.maxWindowScrollLen;
        this.moveWindowPos(windowXPos)
    }

    // fullFrameWidget.sbPos = minSBPos;
    fullFrameWidget.sbPos = maxSBPos;
    //fullFrameWidget.currWindowPos = 0;
    //fullFrameWidget.currWindowPos = 0;
    fullFrameWidget.moveSB(fullFrameWidget.sbPos);
    return fullFrameWidget;
}
