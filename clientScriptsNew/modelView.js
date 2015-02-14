var modelViewDisplayed = false;
var currModelViewBlackFade = null;

function makeModelViewBlackFade() 
{
    var blackFade = WidgetHL();
    blackFade.background = makeRect(stageWidth+20, stageHeight-20, "rgba(0, 0, 0, 0.75)");
    blackFade.background.renderW(blackFade, {x:0, y:0}); //rendering should happen after makeBlackFade is called 
    blackFade.background.blackFade = blackFade;
    modelViewDisplayed = true;

    blackFade.background.shape.on("dblclick", function (evt)
	{
	    this.widget.blackFade.erase()
        alert("okay");
        modelViewDisplayed = false;
	});
    currModelViewBlackFade = blackFade;
    return blackFade;
}

function makeModelButton()
{
    var modelButton = WidgetHL();
    modelButton.background = makeRect(80, 20, "rgba(0,0,0,0)");
    modelButton.background.renderW(modelButton, Point(0, 0));
    modelButton.text = makeTextWidget2("MODEL", 20, "#FFFFFF");
    modelButton.text.renderW(modelButton, Point(0, 0));
    return modelButton;
}

function displayModelView(bayesVar, sideBar)
{
    if (modelViewDisplayed) {
        currModelViewBlackFade.erase();
        modelViewDisplayed = false;
    }
    var blackFade = makeModelViewBlackFade();
    blackFade.render(stage, Point(0, 0));
    bayesVar.probSetter.renderW(blackFade, Point(200, 100));
    var modelButton = makeModelButton();
    modelButton.renderW(blackFade, Point(200, 80));

    blackFade.activeVar = bayesVar.varName;
    blackFade.sideBar = sideBar;

    var bayesVarsNames = Object.keys(sideBar.bayesVars);
    for (var i=0; i<bayesVarsNames.length; i++)
    {
        var varName = bayesVarsNames[i];
        var sideBarBayesVarEntry = sideBar.bayesVars[varName];
        var sideBarPos = sideBarBayesVarEntry['sideBarPos'];
        var refCirclePosX = 5 + CIRCLE_IN_VARBARITEM_X;
        var refCirclePosY = sideBarPos + CIRCLE_IN_VARBARITEM_Y;
        var bayesVar = sideBarBayesVarEntry['bayesVar'];
        var varBarItem = WidgetHL();
        varBarItem.bayesVar = bayesVar;
        varBarItem.sideBar = sideBar;


        if (varName === blackFade.activeVar)
        {
            var varBarItem = WidgetHL();
            varBarItem.varBarButton = makeCircle(25, bayesVar.color);
            varBarItem.text = makeTextWidget(bayesVar.varText, 16, "Arial", "#FFFFFF");
            varBarItem.text.renderW(varBarItem, Point(0, 0));
            varBarItem.varBarButton.renderW(varBarItem, Point(CIRCLE_IN_VARBARITEM_X, CIRCLE_IN_VARBARITEM_Y));
        } else {
            varBarItem.varBarButton = makeCircle(25, "rgba(0,0,0,0.01)");
            //varBarItem.text = makeTextWidget(bayesVar.varText, 16, "Arial",  "rgba(0,0,0,0.01)");
            //varBarItem.text.renderW(varBarItem, Point(0, 0));
            varBarItem.varBarButton.renderW(varBarItem, Point(CIRCLE_IN_VARBARITEM_X, CIRCLE_IN_VARBARITEM_Y));
            varBarItem.shape.on("rollover", function(evt) {
                var bayesVar = this.widget.bayesVar;
                this.widget.varBarButton.changeColor(bayesVar.color);
                this.widget.text = makeTextWidget(bayesVar.varText, 16, "Arial",  "#FFFFFF");
                this.widget.text.renderW(this.widget, Point(0, 0));
            });
            varBarItem.shape.on("rollout", function(evt) {
                var bayesVar = this.widget.bayesVar;
                this.widget.varBarButton.changeColor("rgba(0,0,0,0.01)");
                this.widget.text.erase();
            });
            varBarItem.shape.on("click", function(evt) {
                displayModelView(this.widget.bayesVar, this.widget.sideBar);
            });
        }
        varBarItem.renderW(blackFade, Point(5, sideBarPos));
    }
}

