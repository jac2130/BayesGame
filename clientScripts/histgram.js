// requires shapeLib

function createHist()
{
    //createBkgdBox(stage);
    var hist = new Histgram([95, 25], [50, 100, 300], 600, 450, 10);
    return hist;
}

var QueryHist = Object.create(Widget);

function makeQueryHist(valObj, graphWidth, graphHeight, barColor, conditions)
{
    if (typeof conditions === 'undefined') {
        conditions = {};
    }
    var valLabels = Object.keys(valObj).sort();
    var valArr = [];
    valLabels.map(function(key){valArr.push(valObj[key])});
    //alert(JSON.stringify(valArr));
    var gapWidth = graphHeight/50;
    var borderWidth = 1;
    var queryHist = Object.create(QueryHist);
    queryHist.setShape(new createjs.Container());
    queryHist.background = makeRect(graphWidth, graphHeight, '#EBEEF4', borderWidth);
    queryHist.background.render(queryHist.shape, {x:0, y:0});

    var barAreaWidth  = graphWidth - 30;
    var barAreaHeight = graphHeight - 5*gapWidth;
    queryHist.barArea = Object.create(Widget);
    queryHist.barArea.setShape(new createjs.Container());
    queryHist.barArea.background = makeRect(barAreaWidth, barAreaHeight, "rgba(0, 0, 0, 0)");
    queryHist.barArea.render(queryHist.shape, {x: 30, y: gapWidth});
    queryHist.barArea.background.render(queryHist.barArea.shape, {x: 0, y: 0});

    var numItems = valArr.length;
    var itemWidth = (barAreaHeight - (numItems-1)*gapWidth)/numItems;
    var maxWidthRatio = 0.45;
    //var maxBarHeight = maxHeightRatio*barAreaHeight*hist.shape.scaleY;
    var maxBarWidth = maxWidthRatio*barAreaWidth;

    var maxVal = valArr[0];
    for (var i = valArr.length - 1; i >= 0; i--) {
        if (valArr[i] > maxVal) {
            maxVal = valArr[i];
        }
    };
    var barValWidthRatio = maxBarWidth/maxVal;

    queryHist.valBars = [];
    queryHist.conditions=conditions; 

    for (var i=0; i < valArr.length; i++) {
        var valBar = makeQueryBar(itemWidth, valArr[i]*barValWidthRatio,
				barColor, valArr[i], valLabels[i], queryHist);
        queryHist.valBars.push(valBar);
    };

    for (var i=0; i < queryHist.valBars.length; i++) {
        var rectStartY = (gapWidth+itemWidth)*i;
        queryHist.valBars[i].render(queryHist.barArea.shape, {x:0 , y: rectStartY});
        //this.valBars[i].render(hist.shape, {x: 0, y: 0});
    };
    var condString='P(' +conditions['bayesVar'] + ' | ';
    condKeys = Object.keys(conditions[conditions['bayesVar']]).sort()
    condKeys.map(function(key)
    {
        condString += key + "=" + conditions[conditions['bayesVar']][key] + ",";
    });
    condString = condString.slice(0, condString.length-1)+')';
    condText = makeTextWidget(condString, 26, "Arial", "#666");
    condText.renderW(queryHist, Point(graphWidth - condText.width - 20, 20))
    return queryHist;
}

var QueryBar = WidgetHL();

function makeQueryBar(barHeight, barWidth, barColor, value, label, hist)
{
    var queryBar = Object.create(QueryBar);
    queryBar.setShape(new createjs.Container());
    queryBar.bar = makeRect(barWidth, barHeight, barColor);
    queryBar.bar.render(queryBar.shape, {x: 20, y:barHeight}, "blCorner");
    queryBar.bar.width = barWidth;
    

    queryBar.height = barHeight;
    queryBar.fontSize=5*Math.log(barHeight);
    queryBar.width = barWidth;

    queryBar.bar.queryBar = queryBar;
    queryBar.value = value;
    queryBar.label = label;
    queryBar.hist  = hist;
    queryBar.barValWidthRatio = barWidth/value;

    queryBar.bar.maxWidth = 100*queryBar.barValWidthRatio;

    queryBar.namelabelText = makeTextWidget(label, queryBar.fontSize);
    queryBar.namelabelText.render(queryBar.shape, {x: 0, y: barHeight/2}, "center");
    queryBar.namelabelText.queryBar = queryBar;

    queryBar.valLabelText  = makeTextWidget("" + Math.round(value*100), queryBar.fontSize);
    queryBar.valLabelText.render(queryBar.shape, {x: barWidth+35, y: barHeight/2}, "center");

    return queryBar;
}


var Histogram = Object.create(Widget);

function makeHist(valArr, valLabels, graphWidth, graphHeight,
                  gapWidth, barColor, conditions)
{
    if (typeof conditions === 'undefined')
    {
        conditions = [];
    }
    var gapWidth = graphHeight/50;
    var borderWidth = 1;
    var hist = Object.create(Histogram);
    hist.setShape(new createjs.Container());
    hist.background = makeRect(graphWidth, graphHeight, '#EBEEF4'/*"#f0f0f0"*/, borderWidth);
    hist.background.render(hist.shape, {x:0, y:0});

    var barAreaWidth  = graphWidth - 30;
    var barAreaHeight = graphHeight - 5*gapWidth;
    hist.barArea = WidgetHL();
    hist.barArea.background = makeRect(barAreaWidth, barAreaHeight, "rgba(0, 0, 0, 0)");
    hist.barArea.render(hist.shape, {x: 30, y: gapWidth});
    hist.barArea.background.renderW(hist.barArea, {x: 0, y: 0});

    var numItems = Math.min(valArr.length, valLabels.length);
    var itemWidth = (barAreaHeight - (numItems-1)*gapWidth)/numItems;

    // var maxBarHeight = maxHeightRatio*barAreaHeight*hist.shape.scaleY;
    // var maxBarWidth = maxWidthRatio*barAreaWidth*hist.shape.scaleX;
    // var maxBarWidth = maxWidthRatio*barAreaWidth*hist.shape.scaleX;

    // var maxVal = valArr[0];
    // for (var i = valArr.length - 1; i >= 0; i--)
    // {
    //     if (valArr[i] > maxVal)
    //     {
    //         maxVal = valArr[i];
    //     }
    // };
    // var barValWidthRatio = maxBarWidth/maxVal;

    hist.valBars = [];
    hist.conditions = conditions; 
    hist.valDict = {}; //this is one of two items (the other being the conditions)
        //that needs to be send back to the server in order to construct and alter 
        //the bayes Net in python (from which queries can be made).

    var maxBarLength = barAreaWidth*0.85;

    for (var i=0; i<numItems; i++)
    {
        var valBar = makeValBar(itemWidth, valArr[i]/100*maxBarLength,
                                barColor, valArr[i], valLabels[i], hist);
        hist.valDict[valLabels[i]] = valArr[i];
        hist.valBars.push(valBar);
    };

    for (var i=0; i < hist.valBars.length; i++) {
        var rectStartY = (gapWidth+itemWidth)*i;
        hist.valBars[i].render(hist.barArea.shape, {x:0 , y: rectStartY});
        //this.valBars[i].render(hist.shape, {x: 0, y: 0});
    };
    hist.isMini = false;
    hist.smallHists = [];
    return hist;
}

Histogram.autoAdjust = function(valBarRef, amtToAdjust)
{
    verifyType(amtToAdjust, "number", "amtToAdjust");
    var refIndex = this.valBars.indexOf(valBarRef);
    //console.log("refIndex: ", refIndex);
    var valBarIndices = range(this.valBars.length);
    valBarIndices = valBarIndices.deleteFirstElem(refIndex);
    //console.log("valBars: ", this.valBars);
    //console.log("valBarIndices: ", valBarIndices);
    for (var i=valBarIndices.length-1; i >= 0; i--) {
        var nextIndex = valBarIndices[i];
        //console.log("nextIndex: ", nextIndex);
        var amtToAdjust = this.valBars[nextIndex].adjustValBar(amtToAdjust);
    };
}

Histogram.getVals = function ()
{
    var vals = [];
    for (var i=0; i < this.valBars.length; i++) {
        vals.push(this.valBars[i].value);
    };
    return vals;
}

var ValBar = WidgetHL();

ValBar.adjustValBar = function(amtToAdjust)
{
    verifyType(amtToAdjust, "number", "amtToAdjust");
    //console.log("amtToAdjust: ", amtToAdjust);
    var retVal;
    var toAdjust;
    if (amtToAdjust >= 0) {
        if (amtToAdjust > 100 - this.value) {
            toAdjust = 100 - this.value;
            retVal = amtToAdjust - (100 - this.value);
        } else {
            toAdjust = amtToAdjust;
            retVal = 0;
        }
    } else {
        if (Math.abs(amtToAdjust) > this.value) {
            toAdjust = -Math.abs(this.value);
            retVal = -(Math.abs(amtToAdjust) - Math.abs(this.value));
        } else {
            toAdjust = amtToAdjust;
            retVal = 0;
        }
    }
    this.bar.changeVal(toAdjust);
    return retVal;
}

function makeValBar(barHeight, barWidth, barColor, value, label, hist)
{
    var valBar = Object.create(ValBar);
    valBar.setShape(new createjs.Container());
    valBar.bar = makeRect(barWidth, barHeight, barColor);
    valBar.bar.render(valBar.shape, {x:20, y:0}, "ulCorner");
    valBar.bar.currWidth = barWidth;
    valBar.bar.origWidth = barWidth;

    valBar.height = barHeight;
    valBar.fontSize = 5*Math.log(barHeight);
    valBar.width = barWidth;

    valBar.bar.valBar = valBar;
    valBar.value = value;
    valBar.label = label;
    valBar.hist  = hist;
    valBar.barValWidthRatio = barWidth/value;

    valBar.bar.maxWidth = 100*valBar.barValWidthRatio;

    valBar.namelabelTextSquare = makeRect(valBar.fontSize, valBar.fontSize, "rgba(0,0,0,0)");
    valBar.namelabelTextSquare.renderW(valBar, {x:0, y:barHeight/2}, "center");
    valBar.namelabelTextSquare.valBar = valBar;

    valBar.namelabelText = makeTextWidget(label, valBar.fontSize);
    valBar.namelabelText.render(valBar.shape, {x:0, y:barHeight/2}, "center");
    valBar.namelabelText.valBar = valBar;

    valBar.valLabelText  = makeTextWidget("" + Math.round(value), valBar.fontSize);
    valBar.valLabelText.render(valBar.shape, {x: barWidth+35, y: barHeight/2}, "center");

    valBar.bar.changeVal = function(valChange)
    {
        if (typeof getLinks === 'undefined') {
            getLinks = true;
        }
        this.valBar.value += valChange;
        this.valBar.hist.valDict[this.valBar.label] += valChange;
        //send back to the server via Ajax!
        if (this.valBar.value < 0) {
            this.valBar.value = 0;
            this.valBar.hist.valDict[this.valBar.label] = 0;
        }
        if (this.valBar.value > 100) {
            this.valBar.value = 100;
            this.valBar.hist.valDict[this.valBar.label] = 100;
        }
        //var heightChangeFactor = this.valBar.barValHeightRatio*this.valBar.hist.shape.scaleY; 
        var newWidth = this.valBar.value*this.valBar.barValWidthRatio;
        this.setWidth(newWidth);
    }

    valBar.bar.getCorresBig = function()
    {
        if (!this.valBar.hist.isMini) {
            logErr("hist is not mini: cannot get corresponding big hist");
        } else {
            var valBarNum = this.valBar.hist.valBars.indexOf(this.valBar);
            return this.valBar.hist.bigHist.valBars[valBarNum].bar;
        }
    }

    valBar.bar.getCorresSmall = function()
    {
        if (this.valBar.hist.isMini) {
            logErr("hist is mini: cannot get corresponding small hists");
        } else {
            var valBarNum = this.valBar.hist.valBars.indexOf(this.valBar);
            var corresSmall = [];
            var smallHists = this.valBar.hist.smallHists;
            for (var i=0; i < smallHists.length; i++) {
                corresSmall.push(smallHists[i].valBars[valBarNum].bar);
            };
            return corresSmall;
        }
    }

    valBar.bar.changeWidth = function(widthChange)
    {
        var newWidth = this.currWidth + widthChange
        var newVal = newWidth/this.valBar.barValWidthRatio;
        if (newVal < 0) {
            newWidth = 0;
        }
        if (newVal > 100) {
            newWidth = this.maxWidth;
        }
        this.setWidth(newWidth);
    }

    valBar.bar.setWidth = function(newWidth, getLinks)
    {
        if (typeof getLinks === 'undefined') {
            getLinks = true;
        }
        verifyType(newWidth, "number", "newWidth");
        this.currWidth = newWidth;
        this.valBar.width = newWidth;
        this.shape.scaleX = this.currWidth/this.origWidth;
        this.valBar.valLabelText.move({x: +this.currWidth+35});

        var newVal = newWidth/this.valBar.barValWidthRatio;
        this.valBar.value = newVal;

        this.valBar.hist.valDict[this.valBar.label] = newVal;
        //this updated valDict should be sent back to the server:
        //ajax call here.
        this.valBar.valLabelText.changeText("" + Math.round(this.valBar.value));
        if (getLinks)
        {
            if (this.valBar.hist.isMini) {
                var bigBar = this.getCorresBig();
                //console.log("bigBar: ", bigBar);
                bigBar.setWidth(newWidth, getLinks);
            } else {
                var smallBars = this.getCorresSmall();
                //console.log("smallBars: ", smallBars);
                for (var i=0; i < smallBars.length; i++) {
                    smallBars[i].setWidth(newWidth, false);
                };
            }
        }
    }

    valBar.bar.shape.on("mousedown", function(evt) {
        //alert("mousedown");
        this.widget.pressX = evt.stageX;
    });

    valBar.bar.shape.on("pressmove", function(evt) {
        this.widget.pressMove(evt.stageX);
    });

    valBar.bar.pressMove = function(evtStageX)
    {
        if (this.valBar.hist.shape.scaleX === 0) {
            alert("divide by zero error!");
        }
        var widthChange = -(this.pressX - evtStageX)/this.valBar.hist.shape.scaleX/0.5;

        //if (isDef(this.valBar.hist.modelView))
        //{
        //    console.log(this.valBar.hist.modelView.shape.scaleX);
        //    widthChange /= this.valBar.hist.modelView.shape.scaleX;
        //}
        this.pressX = evtStageX;
        var oldVal = this.valBar.value;
        this.changeWidth(widthChange);
        var newVal = this.valBar.value;
        var amtToAdjust = -(newVal - oldVal);
        this.valBar.hist.autoAdjust(this.valBar, amtToAdjust);
    }

    valBar.namelabelText.shape.on("mousedown", function(evt) {
        this.widget.valBar.bar.pressX = evt.stageX;
    });

    valBar.namelabelText.shape.on("pressmove", function(evt) {
        /*
        var heightChange = this.widget.pressY - evt.stageY;
        this.widget.pressY = evt.stageY;
        this.widget.valBar.bar.changeHeight(heightChange);
        */
        this.widget.valBar.bar.pressMove(evt.stageX);
    });

    return valBar;
}
