// requires bayesVar.js

var VIEW_WIDTH = 1400;
var VIEW_HEIGHT = 800;
var CIRCLE_IN_VARBARITEM_X = 50;
var CIRCLE_IN_VARBARITEM_Y = 45;

/*GraphJson is an empty Global object that will be populated by data from the bayesVars. This object will be send back via JSON encoding and used to create the graph in python*/

//var GraphJson = {"user": user.id} 

function makeHistBar(hist)
{
    var height = 45;
    var width = hist.width+hist.borderWidth*2;
    var barButton = Object.create(Button);
    barButton.setShape(new createjs.Container());
    barButton.background = makeRect(width, height, /*"#3B4DD0"*/ "#3b5998", 0, 1, 3);
    barButton.background.render(barButton.shape, {x:0, y:0});
    
    return barButton;
}

function sideBarShow(blackFade, bayesVar)
{
    var varText = bayesVar.varText;
    var sideBar = bayesVar.sideBar;
		//sideBar goes into the blackFade object, through the 
		//function makeActiveView; 		
    bayesVar.varBarItem2.isActive = false;
    bayesVar.varBarItem2.varBarButton.changeColor(bayesVar.color);  
    bayesVar.varBarItem2.varBarButton.renderW(bayesVar.varBarItem2, {x:30, y:20});
    bayesVar.varBarItem2.text.changeColor("#ffffff");
    bayesVar.varBarItem2.renderW(blackFade, {x:5, y:bayesVar.varBarItem2.place})
    var variables = bayesVar.sideBar.Vars;
    for (var i=0; i< variables.length; i++)
    {
        if (variables[i]!==bayesVar) 
        {
            var v = variables[i];
            if (v.hasActiveView) 
            {
                v.activeView.getParentW().erase()
                v.hasActiveView = false;
            };
            v.varBarItem2.isActive=true;
            v.varBarItem2.text.changeColor("rgba(0, 0, 0, 0.01)");
            v.varBarItem2.varBarButton.changeColor("rgba(0, 0, 0, 0.01)");
            v.varBarItem2.varBarButton.renderW(v.varBarItem2, {x:30, y:20});
            v.varBarItem2.renderW(blackFade, {x:5, y:v.varBarItem2.place})
        }
    }
 
}

function makeQueryViewButton(bayesVar)
{
    var queryViewButton=makeMenuButton("QUERY", 100, 35)
    //var dataViewText=makeTextWidget("DATA", 30, "Arial", "#666");
    var callback =
    {
        bayesVar: bayesVar,
        call: function()
        {	    
            var queryView=makeQueryView(VIEW_WIDTH, VIEW_HEIGHT, this.bayesVar);
            makeActiveView(queryView, this.bayesVar)
        }
    };
    makeClickable2(queryViewButton, callback);
    return queryViewButton;
}

function makeDataViewButton(bayesVar)
{
    var dataViewButton = makeMenuButton("DATA", 100, 35);
    //var dataViewText=makeTextWidget("DATA", 30, "Arial", "#666");
    var callback = {
        bayesVar: bayesVar,
        call: function()
        {	    
            var dataView = makeDataView(VIEW_WIDTH, VIEW_HEIGHT, this.bayesVar);
            makeActiveView(dataView, this.bayesVar)
        }
    }
    makeClickable2(dataViewButton, callback);
    return dataViewButton;
}

function makeBetViewButton(bayesVar)
{
    var betViewButton = makeMenuButton("BETS", 100, 35);
    //var betViewButton=makeTextWidget("BETS", 30, "Arial", "#666");
    var callback = {
        bayesVar:bayesVar,
        call: function()
        {	    
            var betView=makeBettingView(VIEW_WIDTH, VIEW_HEIGHT, this.bayesVar);
            makeActiveView(betView, this.bayesVar);
        }
    };
    makeClickable2(betViewButton, callback);
    return betViewButton;
}

function makeModelViewButton(bayesVar)
{
    var modelViewButton = makeMenuButton("MODEL", 100, 35)
    //var modelViewButton=makeTextWidget("MODEL", 30, "Arial", "#666");
    var callback = {
        bayesVar: bayesVar,
        call: function()
        {	    
            var modelView = makeModelView(VIEW_WIDTH, VIEW_HEIGHT, this.bayesVar);
            makeActiveView(modelView, this.bayesVar)
        }
    }
    makeClickable2(modelViewButton, callback);
    return modelViewButton;
}

function makeSideBar(bayesVars)
{
    var sideBar = WidgetHL();

    var nextYPosition = 150;
    var varBarButtonWidth = 10;
    var varBarButtonHeight = 90
    var varSpacing = 20;
    var distBetweenYs = varBarButtonHeight + varSpacing;
    sideBar.bayesVars = {};

    sideBar.addBayesVar = function(bayesVar)
    {
        var varBarItem = WidgetHL();
        varBarItem.bayesVar = bayesVar;
        varBarItem.sideBar = this;
        bayesVar.sideBar = this;

        var bayesVarEntry = {};
        bayesVarEntry['sideBarPos'] = nextYPosition;
        bayesVarEntry['varBarItem'] = varBarItem;
        bayesVarEntry['bayesVar'] = bayesVar;
        this.bayesVars[bayesVar.varName] = bayesVarEntry;

        varBarItem.varBarButton = makeCircle(25,
					     varBarItem.bayesVar.color, 2, "#ffffff");
        varBarItem.varBarButton.renderW(varBarItem, {x:CIRCLE_IN_VARBARITEM_X, y:CIRCLE_IN_VARBARITEM_Y});
        varBarItem.text = makeTextWidget(bayesVar.varText, 16, "Arial", 
                                         "#666");
        varBarItem.text.renderW(varBarItem, {x:0, y:0});

        varBarItem.renderW(this, {x:5, y:nextYPosition});
        nextYPosition += distBetweenYs;

        varBarItem.shape.on("rollover", function(evt)
		{
			if (!global_circleMoving)
			{
				var varCircle = addBayesCircle(this.widget.bayesVar);
                varCircle.sideBar = this.widget.sideBar;
                varCircle.shape.on("dblclick", function (evt)
                {
                    displayModelView(this.widget.bayesVar, this.widget.sideBar);
                    //makeActiveView(this.widget.bayesVar.activeView, this.widget.bayesVar);
                });

				var varText = this.widget.bayesVar.varText;
                var sideBarPos = this.widget.sideBar.bayesVars[varText]['sideBarPos'];
                // var sideBar = this.widget.sideBar;
				varCircle.render(stage, Point(5 + CIRCLE_IN_VARBARITEM_X, sideBarPos + CIRCLE_IN_VARBARITEM_Y));
				//varCircle.render(stage, Point(100, 100));
		    }
        });
        bayesVar.varBarItem = varBarItem;
    }

    //var toSent = JSON.stringify(GraphJson);
    //here, the GraphJson should be sent back and the first model should be build.

    for (var i=0; i<bayesVars.length; i++)
    {
        sideBar.addBayesVar(bayesVars[i]);
    }

    //alert(JSON.stringify(user));
    //the facebook user object must be created (facebook login must happen) before the sideBar is created.
    return sideBar;
}

