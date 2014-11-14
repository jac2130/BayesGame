var circleMoving = false;

function calcArrowLen(fromCircle, toCircle)
{
    var deltaY = -toCircle.shape.y - -fromCircle.shape.y;
    var deltaX = toCircle.shape.x - fromCircle.shape.x;
    var devec = devectorize([deltaX, deltaY]);
    veclen = devec[0];
    var arrowLen = veclen - fromCircle.radius - toCircle.radius;
}

function connectCircles2(fromCircle, toCircle)
{
    var arrowLen = getArrowLenFromCircles(fromCircle, toCircle);
    var arrowTheta = calcThetaFromCircles(fromCircle, toCircle);
    var arrowPos = trianglePosRelCircle2(fromCircle, arrowTheta);
    var arrowAngle = 90 - arrowTheta;

    var arrow = makeArrow2(arrowLen, arrowAngle);
    arrow.render(stage, arrowPos);

    fromCircle.toNodes.push([toCircle, arrow]);
    toCircle.fromNodes.push([fromCircle, arrow]);
    arrow.fromNode = fromCircle;
    arrow.toNode = toCircle;

    //var fromnames=[]
    //if (fromVars.length > 0) {
      //  for (var i=0;i<fromVars.length; i++){
        //    fromnames.push(fromVars[i].varText)
       // }
        //toCircle.bayesVar.probSetter = makeSwitcher(1400, 800,
          //      toCircle.bayesVar.color, fromnames);

        //toCircle.bayesVar.isMultiVar = true;
  //  } else {
    //    toCircle.bayesVar.probSetter = makeHist([20, 30, 10], poss,
      //              1400, 800, 20, toCircle.bayesVar.color);
       // toCircle.bayesVar.isMultiVar = false;
    //}

    fromVars = arrow.toNode.bayesVar.getFromVars();
    //alert(fromVars)
    fromNames=[]
    for (var i=0;i< fromVars.length; i++){
        fromNames.push(fromVars[i].varText)
    }
    
    var currHist;
    if (arrow.toNode.bayesVar.isMultiVar) {
        currHist = arrow.toNode.bayesVar.probSetter.getCurrHist();
    } else {
        currHist = arrow.toNode.bayesVar.probSetter;
    }

    var smallHists = currHist.smallHists;
    var possibilities = arrow.toNode.bayesVar.possibilities;
    var valArr = [];
    for (var i=0; i<possibilities.length; i++)
    {
        valArr.push(100/possibilities.length);
    }
    
    arrow.toNode.bayesVar.probSetter = makeSwitcher(arrow.toNode.bayesVar, 1400, 800, 
            arrow.toNode.bayesVar.color, fromNames, valArr);
    //activating the view. This makes this view the active one. This should be 
    //eventually replaced with an if statement saying that if the current 
    //active view is the model view this should replace it. 
    var modelView=makeModelView(1700, 800, arrow.toNode.bayesVar);//the parameters 1700, 800 don't currently matter
    
    //makeActiveView(modelView, arrow.toNode.bayesVar);
    toCircle.bayesVar.modelView=modelView;
    toCircle.bayesVar.activeView=toCircle.bayesVar.modelView;

    //alert(fromNames[0])
    var currHist = arrow.toNode.bayesVar.probSetter.getCurrHist();
    currHist.smallHists = smallHists;
    for (var i=0; i < currHist.smallHists.length; i++) {
        currHist.smallHists[i].bigHist = currHist;
    };

    arrow.toNode.bayesVar.isMultiVar = true;
    
    arrow.shape.on("dblclick", function(evt) {
        disconnectCircles(this.widget.fromNode, this.widget.toNode, tutorial);
    });
    currHist = arrow.toNode.bayesVar.probSetter.getCurrHist();
    return arrow;
}

function isConnected(circle1, circle2)
{
    for (var i=0; i < circle1.fromNodes.length; i++) {
        if (circle1.fromNodes[i][0] === circle2) {
            return true;
        }
    };
    for (var i=0; i < circle1.toNodes.length; i++) {
        if (circle1.toNodes[i][0] === circle2) {
            return true;
        }
    };
    return false;
}

var BayesCircle = Object.create(CircleWidget);

BayesCircle.getProbHist = function()
{
    var probHist;
    if (this.bayesVar.isMultiVar) {
        probHist = this.bayesVar.probSetter.getCurrHist();
    } else {
        probHist = this.bayesVar.probSetter;
    }
}

function makeBayesCircle(radius, color)
{
    var circle = makeCircle(radius, color);
    circle.defaultRefPos = "center";
    circle.highlighted = false;
    circle.justAdded = false;
    circle.fromNodes = [];
    circle.toNodes = [];

    circle.hlCircle = function()
    {
        if (!this.highlighted)
        {
            verifyIn("parent", this.shape, "Bayes Circle Shape");
            drawCircleGraphic(this.shape, this.radius, this.color, 
                                   2, "yellow")
            this.highlighted = true;
	    
            /*
            var hlCircle = new createjs.Shape();
            hlCircle.graphics.beginFill("yellow");
            hlCircle.graphics.drawCircle(this.shape.x, 
                    this.shape.y, this.radius + 2);
            hlCircle.graphics.endFill();
            hlCircle.graphics.beginStroke("black");
            hlCircle.graphics.drawCircle(this.shape.x, 
                    this.shape.y, this.radius);
            hlCircle.graphics.endStroke();
            hlCircle.regX = hlCircle.x = this.shape.x;
            hlCircle.regY = hlCircle.y = this.shape.y;
            this.shape.parent.addChild(hlCircle);
            //this.shape.parent.swapChildren(hlCircle, this.shape);
            this.shape.parent.setChildIndex(hlCircle, 
                    this.shape.parent.children.length - 1);
            this.shape.parent.setChildIndex(hlCircle, 1);

            this.highlighted = true;
            this.circleHL = hlCircle;
            */
        }
    }

    circle.unhlCircle = function()
    {
        if (this.highlighted) {
            //this.shape.parent.removeChild(this.circleHL);
            drawCircleGraphic(this.shape, this.radius, this.color, 0)
            this.highlighted = false;
	    
        }
	
    }

    circle.shape.on("mousedown", function(evt) {
	if (this.widget.expanded)
	    {
	    this.widget.option.erase();
	    this.widget.expanded = false;
	    }
        var globalPt = this.parent.localToGlobal(this.x, this.y);
        this.widget.offset = {x:globalPt.x-evt.stageX, y:globalPt.y-evt.stageY};
    });

    circle.shape.on("pressup", function(evt) {
        circleMoving = false;
        this.widget.hlCircle();
    });

    circle.shape.on("pressmove", function(evt) {
        if (circleMoving) {
            this.widget.unhlCircle();
	    if (this.widget.expanded)
	    {
	    this.widget.option.erase();
	    this.widget.expanded = false;
	    }
        }
        var newX = evt.stageX + this.widget.offset.x;
        var newY = evt.stageY + this.widget.offset.y;
        moveNode2(this.widget, [newX, newY]);
        circleMoving = true;
    });

    circle.shape.on("click", function(evt) {
	
        if (this.widget.justAdded) {
            this.widget.justAdded = false;
            return;
        }
        if (circleActive) {
            if (activeCircle !== this.widget && !isConnected(activeCircle, this.widget)) {
                //connectCircles(activeCircle, this.widget);
                connectCircles2(activeCircle, this.widget);
            }
            circleActive = false;
            activeCircle.unhlCircle();
        } else {
            circleActive = true;
            activeCircle = this.widget;
        }
    });

    circle.shape.on("rollover", function(evt) {
        this.widget.hlCircle();
    });

    circle.shape.on("rollout", function(evt) {
        if (!circleActive || activeCircle !== this.widget) {
            this.widget.unhlCircle();
        }
    });

    circle.clickOut = function()
    {
        this.unhlCircle();
    }
    clickOutList.push(circle);

    return circle;
}

function disconnectCircles(fromCircle, toCircle)
{
    if (!isConnected(fromCircle, toCircle)) { return; }
    for (var i=0; i < toCircle.fromNodes.length; i++) {
        if (toCircle.fromNodes[i][0] === fromCircle) {
            stage.removeChild(toCircle.fromNodes[i][1].shape);
            toCircle.fromNodes = toCircle.fromNodes.deleteElemByIndex(i);
            break;
        }
    };
    for (var i=0; i < fromCircle.toNodes.length; i++) {
        if (fromCircle.toNodes[i][0] === toCircle) {
            fromCircle.toNodes = fromCircle.toNodes.deleteElemByIndex(i);
            break;
        }
    };

    var fromVars = toCircle.bayesVar.getFromVars();
    var poss = toCircle.bayesVar.possibilities;
    var fromnames=[]
    if (fromVars.length > 0) {
        for (var i=0;i<fromVars.length; i++){
            fromnames.push(fromVars[i].varText)
        }
        toCircle.bayesVar.probSetter = makeSwitcher(toCircle.bayesVar, 1400, 800,
                toCircle.bayesVar.color, fromnames);

        toCircle.bayesVar.isMultiVar = true;
    } else {
        toCircle.bayesVar.probSetter = makeHist([20, 30, 50], poss,
                    1400, 800, 20, toCircle.bayesVar.color);
        toCircle.bayesVar.isMultiVar = false;
    }
    //the active view must be changed as well again.
    var modelView=makeModelView(VIEW_WIDTH, VIEW_HEIGHT, toCircle.bayesVar);
    //makeActiveView(modelView, toCircle.bayesVar)
    toCircle.bayesVar.modelView=modelView;
    toCircle.bayesVar.activeView=toCircle.bayesVar.modelView;
}

var Arrow2 = Object.create(Widget);

function makeArrow2(arrowLen, arrowAngle)
{
    var arrow = Object.create(Arrow2);
    arrow.setShape(new createjs.Container());
    var triangleHeight = 20;
    var rectLen = arrowLen - triangleHeight;
    arrow.arrowRect = makeArrowRect(rectLen, arrowAngle);
    arrow.arrowRect.render(arrow.shape, {x:0, y:0}, 
            {x:arrow.arrowRect.width/2, y:arrow.arrowRect.height});

    //var triangleRelPos = arrow.getTrianglePos(rectLen);
    arrow.triangle = makeArrowTriangle(triangleHeight);
    arrow.triangle.render(arrow.shape, {x:0, y:-rectLen});

    arrow.shape.rotation += arrowAngle;
    return arrow;
}

Arrow2.getWidth = function()
{
    if (arrow.arrowRect.width > arrow.triangle.width) {
        return arrow.arrowRect.width;
    } else {
        return arrow.triangle.width;
    }
}

Arrow2.getHeight = function()
{
    return arrow.arrowRect.height > arrow.triangle.height;
}

Arrow2.getTrianglePos = function(rectLen)
{   
    //var rectVec = vectorize2(rectLen, rectAngle);
    var trianglePos = rectVec;
    var point = new LabeledPoint(trianglePos.x, trianglePos.y);
    return trianglePos;
}

Arrow2.adjustArrow = function(fromCircle, toCircle)
{
    var arrowLen = getArrowLenFromCircles(fromCircle, toCircle);
    var arrowTheta = calcThetaFromCircles(fromCircle, toCircle);
    var arrowPos = trianglePosRelCircle2(fromCircle, arrowTheta);
    var arrowAngle = 90 - arrowTheta;
    this.setLen(arrowLen);
    this.setAngle(arrowAngle);
    this.move(arrowPos);
}

// todo
Arrow2.setAngle = function(newAngle)
{
    this.shape.rotation = newAngle;
}

// todo
Arrow2.getAngle = function()
{
    return this.shape.rotation;
}

// todo
Arrow2.setLen = function(newLen)
{
    var newRectLen = newLen - this.triangle.height;
    this.arrowRect.setLen(newRectLen);
    var trianglePos = {x:0, y:-newRectLen};
    this.triangle.move(trianglePos);
}

function makeArrowRect(rectLen)
{
    var arrowRectWidth = 2;
    var rect = makeRect(arrowRectWidth, rectLen, '#3b5998'/*"#3B4DD0"*/);
    rect.defaultRefPos = {x:arrowRectWidth/2, y:rectLen};
    //rect.shape.rotation += 90 - arrowAngle;

    rect.setLen = function(newLen)
    {
        this.changeHeight(newLen);
    }

    return rect;
}

function makeArrowTriangle(triangleHeight)
{
    //var isosTriangle = makeIsosTriangle(triangleHeight, 30, "#3B4DD0", arrowAngle-90);
    var isosTriangle = makeEquiTriangle(triangleHeight, '#3b5998'/*"#3B4DD0"*/);
    return isosTriangle;
}

function moveNode2(node, nodePos)
{
    node.shape.x = nodePos[0];
    node.shape.y = nodePos[1];
    node.miniHist.shape.x = nodePos[0] + node.miniHist.offset.x;
    node.miniHist.shape.y = nodePos[1] + node.miniHist.offset.y;
    for (var i=0;i<node.fromNodes.length;i++) {
        var fromNode = node.fromNodes[i][0];
        var arrow = node.fromNodes[i][1];
        arrow.adjustArrow(fromNode, node);
    }
    for (var i=0;i<node.toNodes.length;i++) {
        var toNode = node.toNodes[i][0];
        var arrow = node.toNodes[i][1];
        arrow.adjustArrow(node, toNode);
    }
}

function trianglePosRelCircle2(fromCircle, angleTheta)
{
    var deltaX = fromCircle.radius * Math.cos(degToRad(angleTheta));
    var deltaY = fromCircle.radius * Math.sin(degToRad(angleTheta));
    var newX = fromCircle.shape.x + deltaX;
    var newY = fromCircle.shape.y - deltaY;
    return {x:newX, y:newY};
}

function calcThetaFromCircles(fromCircle, toCircle)
{
    var fromVec = [fromCircle.shape.x, fromCircle.shape.y];
    var toVec = [toCircle.shape.x, toCircle.shape.y];
    var theta = calcTheta(fromVec, toVec);
    return theta;
}

function getArrowLenFromCircles(circle1, circle2)
{
    var vecLen = calcDist([circle1.shape.x, circle1.shape.y], 
                          [circle2.shape.x, circle2.shape.y]);
    return vecLen - circle1.radius - circle2.radius;
}
