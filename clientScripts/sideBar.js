var VIEW_WIDTH=1400;
var VIEW_HEIGHT=800;

/*GraphJson is an empty Global object that will be populated by data from the bayesVars. This object will be send back via JSON encoding and used to create the graph in python*/

var GraphJson={"user":user.id} 

function makeHistBar(hist)
{
    var height=45;
    var width=hist.width+hist.borderWidth*2;
    var barButton = Object.create(Button);
    barButton.setShape(new createjs.Container());
    barButton.background = makeRect(width, height, /*"#3B4DD0"*/ "#3b5998", 0, 1, 3);
    barButton.background.render(barButton.shape, {x:0, y:0});
        
    return barButton;
}


function sideBarShow(blackFade, bayesVar)
 
{
    var varText = bayesVar.varText;
    tutorial.trigger("circleDblClicked", varText);
                              
    var sideBar = bayesVar.sideBar;
		//sideBar goes into the blackFade object, through the 
		//function makeActiveView; 		
    bayesVar.varBarItem2.isActive=false;
    bayesVar.varBarItem2.varBarButton.changeColor(bayesVar.color);  
    bayesVar.varBarItem2.varBarButton.renderW(bayesVar.varBarItem2, {x:30, y:20});
    bayesVar.varBarItem2.text.changeColor("#ffffff");
    bayesVar.varBarItem2.renderW(blackFade, {x:5, y:bayesVar.varBarItem2.place})
    var variables = bayesVar.sideBar.Vars;
    for (var i=0; i< variables.length; i++)
    {
	if (variables[i]!==bayesVar) 
	{
	    var v =variables[i];
	    if (v.hasActiveView) 
	    {
		v.activeView.getParentW().erase()
		v.hasActiveView=false;
	    };
	    v.varBarItem2.isActive=true;
	    v.varBarItem2.text.changeColor("rgba(0, 0, 0, 0.01)");
	    v.varBarItem2.varBarButton.changeColor("rgba(0, 0, 0, 0.01)");
	    v.varBarItem2.varBarButton.renderW(v.varBarItem2, {x:30, y:20});
	    v.varBarItem2.renderW(blackFade, {x:5, y:v.varBarItem2.place})
	}
    }
 
}


function makeActiveView(view, bayesVar) 
{
    if (bayesVar.hasActiveView) 
    {
	bayesVar.activeView.getParentW().erase();
	bayesVar.hasActiveView = false;
    };

    
    view.shape.scaleX = 0.5;
    view.shape.scaleY = 0.5;
    var blackFade=makeBlackFade(view)
    blackFade.currentOne=bayesVar;
    bayesVar.activeView=view;
    bayesVar.hasActiveView=true;
    blackFade.render(stage, Point(0, 0));
    sideBarShow(blackFade, bayesVar)

}

function makeQueryViewButton(bayesVar)
{
    var queryViewButton=makeMenuButton("QUERY", 100, 35)
    //var dataViewText=makeTextWidget("DATA", 30, "Arial", "#666");
    var callback ={
	bayesVar:bayesVar,
	call: function()
	{	    
	    var queryView=makeQueryView(VIEW_WIDTH, VIEW_HEIGHT, this.bayesVar);
	    makeActiveView(queryView, this.bayesVar)
	}
    }
    makeClickable2(queryViewButton, callback);
    return queryViewButton;
}


function makeDataViewButton(bayesVar)
{
    var dataViewButton=makeMenuButton("DATA", 100, 35)
    //var dataViewText=makeTextWidget("DATA", 30, "Arial", "#666");
    var callback ={
	bayesVar:bayesVar,
	call: function()
	{	    
	    var dataView=makeDataView(VIEW_WIDTH, VIEW_HEIGHT, this.bayesVar);
	    makeActiveView(dataView, this.bayesVar)
	}
    }
    makeClickable2(dataViewButton, callback);
    return dataViewButton;
}


function makeBetViewButton(bayesVar)
{
    var betViewButton=makeMenuButton("BETS", 100, 35)
    //var betViewButton=makeTextWidget("BETS", 30, "Arial", "#666");
    var callback ={
	bayesVar:bayesVar,
	call: function()
	{	    
	    var betView=makeBettingView(VIEW_WIDTH, VIEW_HEIGHT, this.bayesVar);
	    makeActiveView(betView, this.bayesVar)
	}
    }
    makeClickable2(betViewButton, callback);
    return betViewButton;
}

function makeModelViewButton(bayesVar)
{
    var modelViewButton=makeMenuButton("MODEL", 100, 35)
    //var modelViewButton=makeTextWidget("MODEL", 30, "Arial", "#666");
    var callback ={
	bayesVar:bayesVar,
	call: function()
	{	    
	    var modelView=makeModelView(VIEW_WIDTH, VIEW_HEIGHT, this.bayesVar);
	    makeActiveView(modelView, this.bayesVar)
	}
    }
    makeClickable2(modelViewButton, callback);
    return modelViewButton;
}


function bayesVarFactory ()
{
    var colors = ["#3B4DD0"  /*"#3b5998"*/,  "yellow", "red", "green", "purple", "brown",
                  "DarkRed", "GoldenRod"];
    var BayesVar = {};
    var numVars = 0;
    var makeBayesVar = function(varName, varText, possibilities )
    {
        var newBayesVar = Object.create(BayesVar);
        newBayesVar.color = colors[numVars];
        newBayesVar.varName = varName;
        newBayesVar.varText = varText;
        newBayesVar.possibilities = possibilities;
	newBayesVar.activeCircles=[]
        newBayesVar.varCircles = [];
	newBayesVar.hasActiveView=false;
        newBayesVar.isMultiVar = false;
        newBayesVar.probSetter = makeHist([20, 30, 50], possibilities,
                                  1400, 800, 20, newBayesVar.color);
	//adding the innitial variable object to the graph object.
	var modelDict={}
	for (var k in newBayesVar.probSetter.valDict){modelDict[k]=newBayesVar.probSetter.valDict[k]/100}

	GraphJson[newBayesVar.varName.toLowerCase().replace(" ", "_")]=[[newBayesVar.probSetter.conditions, modelDict]];
	//the reason why there are so many brackets is because later several conditions can fill the outer list. 
	newBayesVar.dataView = makeDataView(1400, 800, newBayesVar);
	newBayesVar.modelView= makeModelView(1400, 800, newBayesVar);
	newBayesVar.betView= makeBettingView(1400, 800, newBayesVar);
	newBayesVar.activeView=newBayesVar.modelView;

        numVars += 1;

        newBayesVar.addCircle = function ()
        {
            var newVarCircle = makeBayesCircle(20, this.color);
            newVarCircle.bayesVar = this;

            newVarCircle.makeMiniHist = function(vals) 
            { 
                this.miniHistShown = false;
                this.miniHist = makeHist(vals, 
					 this.bayesVar.possibilities,
					 700, 400, 20, this.bayesVar.color);
		this.miniHist.width=700;
		this.miniHist.borderWidth=1;
		this.miniHist.barButton=makeHistBar(this.miniHist);
		this.miniHist.barButton.render(this.miniHist.shape, {x:0, y:-45})

                this.miniHist.killButton = makeTextWidget("x", 60, "Arial", '#f7f7f7'/*"#f0f0f0"*/);
        /*Now I'm creating the kill switch that allows erasing the little histogram */
                this.miniHist.killButton.miniHist=this.miniHist;
                this.miniHist.killButton.bayesCircle=this;
                this.miniHist.killButton.call = function() 
		{
                    if (this.bayesCircle.miniHistShown)
                    {
			this.bayesCircle.miniHistShown=false;
                        stage.removeChild(this.miniHist.shape)
                    }
                }
                this.miniHist.killButton.render(this.miniHist.shape, {x:10, y:0});
   
                this.miniHist.shape.on("mouseover", function(evt)
				       {
					   this.widget.killButton.changeColor("#666");
				       })
                        /*Actual interaction with the button*/
		this.miniHist.killButton.shape.on("mouseover", function(evt)
						{
						    this.widget.changeColor("red");
						    this.widget.changeFont("120px " + "Arial");
						});
		this.miniHist.killButton.shape.on("mouseout", function(evt)
						{
						    this.widget.changeColor("#666");
						    this.widget.changeFont("60px " + "Arial");
						});
		this.miniHist.killButton.shape.on("mousedown", function(evt)
						{
						    this.widget.changeColor("red");
						    this.widget.changeFont("120px " + "Arial");
						    mousePressed = true;
									   });
		this.miniHist.killButton.shape.on("pressup", function(evt)
						{
						    this.widget.changeColor("red");
						    this.widget.changeFont("240px " + "Arial");
						    this.widget.call();
						});
	    
                this.miniHist.shape.on("mouseout", function(evt)
				       {
					   this.widget.killButton.changeColor('#f7f7f7'/*"#f0f0f0"*/);
				       });
                this.miniHist.shape.scaleX = 0.2;
                this.miniHist.shape.scaleY = 0.2;
                this.miniHist.offset = {x:-30, y:35};
                this.miniHist.isMini = true;
                this.miniHist.bigHist = this.bayesVar.probSetter;
                
                this.miniHist.bigHist.smallHists.push(this.miniHist);
                return this.miniHist;
            }

            newVarCircle.showMiniHist = function()
            {
                this.miniHistShown = true;
                var histX = this.shape.x+this.miniHist.offset.x;
                var histY = this.shape.y+this.miniHist.offset.y;
                this.miniHist.render(stage, Point(histX, histY));
            }

            newVarCircle.makeMiniHist([20, 30, 50]);
	    
            var circleShape = newVarCircle.shape;

	    circleShape.on("pressup", function(evt) {
		this.widget.ready=true;
		var globalPt = this.parent.localToGlobal(this.x, this.y);
		if (!this.widget.miniHistShown){
		//alert(this.widget.miniHistShown);
		    var option = Object.create(Widget);
		    this.widget.option=option;
		    option.setShape(new createjs.Container());
		    option.circle=this.widget;
		    option.triangle=makeTriangle(12, 6, 0.5, "black", 90, 
					     1, "black");
		
		    option.triangle.renderW(option, {x:38, y:-7});
	    	    var message=makeTextWidget(this.widget.bayesVar.varName, 12, "Arial", "#ffffff");
	    	
	    	    option.modelTag=makeRect(message.width+20,24, "black");
		    option.modelTag.renderW(option, {x:38, y:-14})
		    message.renderW(option, {x:43, y:-9});
		    option.shape.on("rollover", function(evt){
			this.widget.render(stage, {x:globalPt.x-10, y:globalPt.y});
		    });
		    option.shape.on("rollout", function(evt){
			this.widget.rollover=false;
			this.widget.erase();
			if (this.widget.circle.expanded){
			    this.widget.erase();
			    this.widget.circle.expanded = false;
			}
		    });
		    option.shape.on("click", function(evt){
			this.widget.circle.showMiniHist();		    
		    });
	    	    this.widget.expanded = true;

		
		
	    //this.shape.parent.addChild(triangle/*, Point(this.shape.x+80,this.shape.y)*/);
		
		//this.triangle.render(stage, {x:globalPt.x+28, y:globalPt.y-7})
		    option.render(stage, {x:globalPt.x-10, y:globalPt.y})
		}
	    });

	    circleShape.on("rollover", function(evt) {
		if (this.widget.ready && !this.widget.miniHistShown){
		    var option = Object.create(Widget);
		    this.widget.option=option;
		    option.setShape(new createjs.Container());
		    option.triangle=makeTriangle(12, 6, 0.5, "black", 90, 
					     1, "black");
		    var message=makeTextWidget(this.widget.bayesVar.varName, 12, "Arial", "#ffffff");
	    	
	    	    option.modelTag=makeRect(message.width+20,24, "black");
		    option.modelTag.renderW(option, {x:38, y:-14})
		    message.renderW(option, {x:43, y:-9});
		    
		    option.triangle.renderW(option, {x:38, y:-7});
	    	   
	    	    option.circle=this.widget;
		    //option.rollover=false;
	    	    this.widget.expanded = true;

		
		    var globalPt = this.parent.localToGlobal(this.x, this.y);
	    //this.shape.parent.addChild(triangle/*, Point(this.shape.x+80,this.shape.y)*/);
		
		//this.triangle.render(stage, {x:globalPt.x+28, y:globalPt.y-7})
		    option.render(stage, {x:globalPt.x-10, y:globalPt.y})

		    option.shape.on("rollover", function(evt){
			this.widget.render(stage, {x:globalPt.x-10, y:globalPt.y})
		    });
		    option.shape.on("rollout", function(evt){
			this.widget.rollover=false;
			this.widget.erase();
			if (this.widget.circle.expanded){
			    this.widget.erase();
			    this.widget.circle.expanded = false;
			}
		    });
		    option.shape.on("click", function(evt){
			this.widget.circle.showMiniHist();		    
		    });
		}
	    });; //this is what I'm working on!
	    circleShape.on("rollout", function(evt){
		
		if (this.widget.expanded){
		    this.widget.option.erase();
		    this.widget.expanded = false;
		}
		
	    });
	    

            circleShape.on("mousedown", function (evt) {
		if (this.widget.expanded)
		{
		    this.widget.option.erase();
		    this.widget.expanded = false;
		}
                var globalPt = this.parent.localToGlobal(this.x, this.y);
		
		//each new coordinate (globalPt) should be recorded to MongoDB.
                this.parent.removeChild(this);
                this.widget.render(stage, {x:globalPt.x, y:globalPt.y});
                stage.addChild(this);
		 
				
		this.widget.bayesVar.activeCircles.push(this.widget)
                this.widget.justAdded = true;
		console.log("adding happens here")
                 
            }, null, true);

	    /*circleShape.on("click", function (evt) {
		if (this.triangle !== undefined)
		{this.triangle.erase();}
		if (this.modelTag !== undefined)
		{this.modelTag.erase();}
	    });*/

            circleShape.on("dblclick", function (evt)
            {
		 
                
		makeActiveView(this.widget.bayesVar.activeView, this.widget.bayesVar);
		
		
            });
	    
	    

/*.on("dblclick", function (evt)
            {
                		    
		makeActiveView(this.widget.bayesVar.activeView, this.widget.bayesVar);
		  
            });*/

                   
            this.varCircles.push(newVarCircle)
            return newVarCircle;
        }

        newBayesVar.removeCircle = function (varCircle)
        {
            newBayesVar.varCircles.deleteFirstElem(varCircle);
        }

        
        newBayesVar.getFromVars = function ()
        {
            var fromVars = Set();
            for (var i=0;i<this.varCircles.length;i++)
            {
                for (var j=0;j<this.varCircles[i].fromNodes.length;j++)
                {
                    var fromVar = this.varCircles[i].fromNodes[j][0].bayesVar;
                    fromVars.add(fromVar);
                }
            }
            return fromVars.itemList;
        }

        newBayesVar.getMenuChoices = function ()
        {
            var menuChoices = Set();
            var fromVars = this.getFromVars();
            for (var i=0;i<fromVars.length;i++)
            {
                menuChoices.add(fromVars[i].varName);
                for (var j=0;j<fromVars[i].possibilities.length;j++)
                {
                    menuChoices.add(fromVars[i].possibilities[j]);
                }
            }
            return menuChoices;
        }
        return newBayesVar;
    }
    return makeBayesVar;
}


var makeBayesVar = bayesVarFactory();

function createSideBar2()
{
    var sideBar = WidgetHL();
    sideBar.barRect = makeRect(108, 800, /*"#3B4DD0"*/ '#3b5998');
    
    sideBar.isLocal=false;
    sideBar.barRect.show=function() {
	this.render(stage, {x:150, y:0});
    };
    if (!sideBar.isLocal){sideBar.barRect.show();}

    var nextYPosition = 70;
    var varBarButtonWidth = 10;
    var varBarButtonHeight=90
    var varSpacing = 20;
    var distBetweenYs = varBarButtonHeight + varSpacing;
    sideBar.Vars=[];

    sideBar.addBayesVar = function(bayesVar)
    {
        var varBarItem = WidgetHL();
        var varBarItem2 = WidgetHL(); 
        varBarItem.bayesVar = bayesVar;
        bayesVar.varBarItem = varBarItem;
        varBarItem2.bayesVar = bayesVar;
        bayesVar.varBarItem2 = varBarItem2;
        this.Vars.push(bayesVar)// this is NOT the culprit ...In the beginning everything is fine. 
        bayesVar.sideBar=this;

        varBarItem.expanded = false;
        varBarItem2.expanded = false;

        varBarItem.varBarButton = makeCircle(25,
					     varBarItem.bayesVar.color, 2, "#ffffff");
        varBarItem2.varBarButton = makeCircle(25,
					      varBarItem.bayesVar.color, 2, "#ffffff");

        varBarItem.varBarButton.renderW(varBarItem, {x:30, y:20});
        varBarItem2.varBarButton.renderW(varBarItem2, {x:30, y:20});

        varBarItem.text = makeTextWidget(bayesVar.varText, 16, "Arial", 
                                         "#666");

        varBarItem2.text = makeTextWidget(bayesVar.varText, 16, "Arial", 
                                          "#ffffff");

        varBarItem.text.renderW(varBarItem, {x:0, y:0});
        varBarItem2.text.renderW(varBarItem2, {x:0, y:0});
        varBarItem.place=nextYPosition;
        varBarItem2.place=nextYPosition;
        varBarItem2.isActive=true;

        varBarItem.render(this.shape, {x:5, y:nextYPosition});
        nextYPosition += distBetweenYs;

	varBarItem2.shape.on("mouseover", function (evt)
			     {
				 if (this.widget.isActive)
				 {
				     this.widget.text.changeColor("#ffffff");
				     this.widget.varBarButton.changeColor(this.widget.bayesVar.color);
	    			     this.widget.varBarButton.renderW(this.widget, {x:30, y:20});}

			     });
	    
	varBarItem2.shape.on("mouseout", function(evt)
			     {
				 if (this.widget.isActive)
				 {
				     this.widget.text.changeColor("rgba(0, 0, 0, 0.01)");
				     this.widget.varBarButton.changeColor("rgba(0, 0, 0, 0.01)");
				     this.widget.varBarButton.renderW(this.widget, {x:30, y:20});
				 }
			     });
        varBarItem2.shape.on("mousedown", function(evt)
			     {
				 if (this.widget.isActive)
				 {
				     this.widget.text.changeColor("red");
				     this.widget.varBarButton.changeColor("red");
				     this.widget.varBarButton.renderW(this.widget, {x:30, y:20});
				     mousePressed = true;
				 }
			     });

	varBarItem2.shape.on("pressup", function(evt)
			     {
				 if (this.widget.isActive)
				 {	
	    			     if (this.widget.bayesVar.activeCircles.length>0)
				     {
	    				 //here be need to activate the current
					 //view, for this particular bayesVar.
					 makeActiveView(this.widget.bayesVar.activeView, this.widget.bayesVar);
		    	    				
	    			     }
	    			     else
				     {
	    				 
					 var varBarOption = Object.create(Widget);
					 this.widget.varBarOption=varBarOption;
					 varBarOption.setShape(new createjs.Container());
					 varBarOption.bkgdRect = makeRect(300, 120, "#fffff0", 3, "#666");
					 varBarOption.bkgdRect.renderW(varBarOption,
									   {x:-10, y:0});
	    				 var message=makeTextWidget("I am sorry, \nyou must first drag the\n"+this.widget.bayesVar.varText + " variable\nout onto the screen\nbefore performing this action!", 20, "Arial", "#666");
	    				 message.renderW(varBarOption, {x:10, y:10});
	    				 varBarOption.render(topLayer.shape, {x:315, y:50});
	    				 this.widget.expanded = true;
	    				 this.widget.text.changeColor(this.widget.bayesVar.color);
					 this.widget.varBarButton.changeColor(this.widget.bayesVar.color);
	    			     }

	    			     this.widget.varBarButton.renderW(this.widget, {x:30, y:20});
	    			     mousePressed = false;
				 }
			     });

	varBarItem2.shape.on("rollout", function(evt)
			     {
				 if (this.widget.expanded)
				 {
				     this.widget.varBarOption.erase();
				     this.widget.expanded = false;
				 }
			     });

	varBarItem.shape.on("rollover", function(evt)
			    {
				if (!circleMoving)
				{
				    var varCircle = this.widget.bayesVar.addCircle();
				    this.widget.varCircle = varCircle;
				    var varText = this.widget.bayesVar.varText;
				    varCircle.renderW(this.widget, Point(55, 45));

				    this.widget.expanded = true;

				    tutorial.trigger("sideBarIconHover", varText);
				    varCircle.shape.on("mousedown", function (evt) 
						       {
							   sideBar.variablesDragged += 1
							   var varText = this.widget.bayesVar.varText;
							   tutorial.trigger("circleDrag", varText);
						       }, null, true);

				    varCircle.shape.on("click", function (evt) 
						       {
							   var varText = this.widget.bayesVar.varText;
							   tutorial.trigger("circleClicked", varText);
						       });

				}
			    });
	console.log("checkpoint3");

	varBarItem.shape.on("rollout", function(evt)
			    {
				if (this.widget.expanded)
				{
				    this.widget.expanded = false;
				    this.widget.bayesVar.removeCircle(this.widget.varCircle);
				}
			    });
    }
    contesVar = makeBayesVar("Contestant Door", "Contestant Door",
                             ["A", "B", "C"]);
    montyVar = makeBayesVar("Monty Door", "Monty Door",
                             ["A", "B", "C"]);
    prizeVar = makeBayesVar("Prize Door", "Prize Door",
                             ["A", "B", "C"]);

    var toSent=JSON.stringify(GraphJson);
    //here, the GraphJson should be sent back and the first model should be build.
    
    /*$.ajax({
	type: "post",
	url: '/ajax/newcomment',
	async: true,
	data: toSent,
		    contentType: "application/json",
		    success: function(user){alert(user.name)} 
    
		});*/

    sideBar.addBayesVar(contesVar);
    sideBar.addBayesVar(montyVar);
    sideBar.addBayesVar(prizeVar);

    sideBar.render(stage, {x:0, y:0});
    //alert(JSON.stringify(user));
    //the facebook user object must be created (facebook login must happen) before the sideBar is created.
    return sideBar.Vars
}

