// going to break the game into periods: 1, 2, 3, 4, 5 etc. and that way all posts and all data will be the same for all players no matter when they start to play. This also solves Alessandra Casella's problem. There has to be a global clock that is gotten by an ajax call. The global clock gives periods: 1, 2, 3, plus how many seconds are left before the next period starts. Each bet and each datapoint is tagged with a period number (the current one). Each players interface pulls out the current bets and datapoints out of the mongodb database.; 



var putWindowDebug = false;
var callWindowDebug = false;
var betWindowDebug = false;

function lookup(firstDict, secondDict, names){
    strins=Object.keys(secondDict);
//cases.push()
    var target={};
    var cases=[];
    var tempList=[];
    names.map(function(n){target[n]=firstDict[n]})
    //alert(JSON.stringify(target))
    strins.map(function(n){tempList.push(n.split(";"))})
    //alert(JSON.stringify(tempList))
    tempList.map(function(m){
	var tempDict={};
	m.map(function(n){

	    var keyVal=n.split(":")
	    tempDict[keyVal[0]]=keyVal[1]
	    
	})
	cases.push(tempDict)
    })
    var returnVal="";
    cases.map(function(ca){
	var checkList=[]
	Object.keys(ca).map(function(k)
			    {
				checkList.push(ca[k]===target[k])
			    });
	if (sum(checkList)===checkList.length)
	{
	    returnVal = secondDict[strins[cases.indexOf(ca)]]
	}		    
    })
    return returnVal
}

function makePrediction(variable, t, width, color)
{
    if (typeof(width) === "undefined")
    {
        width = 40;
    }
    
    var height = width*2.5;
    var predictionCanvas = Object.create(Widget);
        
    predictionCanvas.setShape(new createjs.Container());

    predictionCanvas.background = makeRect(1, height/2, "#666", 1, "#FFFFFF", 3);
    predictionCanvas.tags = {};
    predictionCanvas.background.render(predictionCanvas.shape, {x:width/2, y:0})

    var names = [];
    var conds = {};
    var queryPath = "";
    var returnList = [];

    variables.map(function(variab)
    {
        names.push(variab.varName.replace(" ", "_").toLowerCase());
    });

    

    //return JSON.stringify(conds)
    predictionCanvas.prediction = function(queryLookup, color)
    {
	//var sillydict={}
	//var Keys=Object.keys(somedict)
	//Keys.map(function(k){sillydict[k]=somedict[k];})
	//console.log(typeof(somedict), somedict)
	if (typeof(color)==="undefined"){color="red"}
	if (typeof(queryLookup)==="string") { 
	    if (typeof(JSON.parse(queryLookup))!=="string") {
		var lookupTable=JSON.parse(queryLookup);
		var predVals = [];
                
		var quer = lookup(truth[t], lookupTable, names);
		//alert(JSON.stringify(quer))
		var curKeys = Object.keys(quer).sort();
                var len = curKeys.length;
                var coordX = 6;
                   
                curKeys.map(function(key)
                    {
                        if (typeof(predictionCanvas.tags[key])!=="undefined")
                        {
                            predictionCanvas.tags[key].erase();
                            if (typeof(predictionCanvas.tags[key].rect)!=="undefined")
                            {
                                predictionCanvas.tags[key].rect.erase();
                            }
                        }
                    });

                for (var i=0; i<len; i++)
                {
                    predVals.push(quer[curKeys[i]]);
                    predictionCanvas.tags[curKeys[i]] = makeTextWidget(curKeys[i], 10, "Arial", "#666");
                    predictionCanvas.tags[curKeys[i]].rect=makeRect((width-10)/len, 0.70*height*quer[curKeys[i]], color, 1, "#FFFFFF", 3);
                //(betQueryWindow.height-120)*currentData[key]	
                    predictionCanvas.tags[curKeys[i]].rect.render(predictionCanvas.shape, {x:coordX-(width-10)/(4*len), y:height*(1-0.7*quer[curKeys[i]])-20});
                    predictionCanvas.tags[curKeys[i]].render(predictionCanvas.shape, {x:coordX, y:height-20});
                    coordX += (1.0/len)*width;
                }
                
            } 
        }
            
       
    }

    return predictionCanvas;

}

function getTime()
{
    var d = new Date();
    return d.getTime();
}

function capitalizeEachWord(str) {
    return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function getIntersect(arr1, arr2)
{
    var temp = [];
    for(var i = 0; i < arr1.length; i++)
    {
        for(var k = 0; k < arr2.length; k++)
        {
            if (arr1[i] == arr2[k])
            {
                temp.push( arr1[i]);
                break;
            }
        }
    }
    return temp;
}

var previousUpdateTime = getTime();

function makeBetButton2(betView)
{
    var betButton = makeButton("Offer Buy!", 70, 15);
    var callback = {
        'betView':betView,
        'truth':truth,
        "call": function()
        {
            var betView = this.betView;
            var valToBetOn = share_val;
            var points = "" + this.betView.pointsInp.getNumVal();
            var bayesVar = betView.bayesVar;
            var vars = modelClass.vars;
            var queryPath = "";
            var conditionalVarNames = getIntersect(Object.keys(truth[truth.length-1]), modelClass.vars);
            bettingVar = truth[truth.length-1]['betting_var'];

            conditionalVarNames.map(function(na)
            {
                queryPath += "/" + na + ":" + truth[truth.length-1][na];
            });
	   
            $.ajax({
                type: "GET",
                url: '/js/query' + queryPath,
                async: true,
                
                dataType: "json",
                success: function(data)
                {
                    if (typeof(data) === "object")
                    {
                        var prediction = data[bettingVar];
                        var currentKeys=Object.keys(prediction);
                        currentKeys.sort();
                        threshHold=Math.round(prediction[currentKeys[0]]*100);
                        //alert(threshHold)
                        if (points in range(threshHold + 1))
                        {
                            $.ajax({
                                type: "post",
                                url: '/js/newpost',
                                async: true,
                                data:JSON.stringify({"user_id": user.id, "treatmentNum": treatmentNum, "valToBetOn": valToBetOn, 'price': points, 'period': truth[truth.length-1].period}),
                                            dataType: "json",
                                dataType: "json",
                                contentType: "application/json",
                                success: function(){} 
                            });
                        }
                        else
                        {
                            warn("You must choose a value for your buying offer, \n\nthat is below " + 
                                    JSON.stringify(threshHold) + " points,\n\nor you must change your model!");
                        }
                    }
                    else {
                        warn(JSON.stringify(data));
                    }
                }
            });
            this.betView.pointsInp.clear();
        }
    };
    betView.pointsInp.registerEnterCallback(callback);
    makeClickable(betButton, callback);
    return betButton;
}

function makePutButton(betView)
{
    var putButton = makeButton("Offer Sale!", 70, 15);
    var callback = {
        'betView': betView,
        'truth': truth,
        "call": function()
        {
            var betView = this.betView;
            var valToBetOn = share_val;
            var points = "" + this.betView.pointsInp.getNumVal();
            var bayesVar = betView.bayesVar;
            var vars = modelClass.vars;
            var queryPath = "";
            var conditionalVarNames = getIntersect(Object.keys(truth[truth.length-1]), modelClass.vars);
            var bettingVar=truth[truth.length-1]['betting_var'];

            conditionalVarNames.map(function(na)
            {
                queryPath += "/" + na + ":" + truth[truth.length-1][na];
            });
                //alert(truth[truth.length-1].period);
	   
            $.ajax({
                type: "GET",
                url: '/js/query' + queryPath,
                async: true,
                
                dataType: "json",
                success: function(data)
                {
                    if (typeof(data)==="object")
                    {
                        var prediction = data[bettingVar];
                        var currentKeys = Object.keys(prediction);
                        currentKeys.sort();
                        var threshHold = Math.round(prediction[currentKeys[0]]*100);			
                        var greaterVal = range(101).slice(threshHold, 101);
                        var truthVal = (greaterVal.contains(parseInt(points)));
                        if (truthVal === true) 
                        {
                            $.ajax({
                                type: "post",
                                url: '/js/newput',
                                async: true,
                                data:JSON.stringify({"user_id": user.id, "treatmentNum": treatmentNum, "valToBetOn": valToBetOn, 'price': points, 'period': truth[truth.length-1].period}),
                                            dataType: "json",
                                contentType: "application/json",
                                success: function(){} 
                            });
                        }
                        else
                        {
                            warn("You must choose a value for your selling offer, \n\nthat is above " + JSON.stringify(threshHold) + " points,\n\nor you must change your model!");
                        }
                    }
                    else
                    {
                        warn(JSON.stringify(data));
                    }
                }

            });
	    
            this.betView.pointsInp.clear();
        }
    };
    betView.pointsInp.registerEnterCallback(callback);
    makeClickable(putButton, callback);
    return putButton;
}

function makeContractedButton(inpWindow)
{
    var height=25;
    var contractedButton = Object.create(Widget);
    contractedButton.height = height;
    contractedButton.setShape(new createjs.Container());
    contractedButton.text = makeTextWidget(inpWindow.text, 15, "Arial", "#666");
    var textWidth = contractedButton.text.shape.getMeasuredWidth();
    var contractedButtonWidth = textWidth + 30;

    contractedButton.background = makeRect(contractedButtonWidth, height, "#ffffff", 0, "#FFFFFF", 3);
    contractedButton.background.render(contractedButton.shape, {x:0, y:0});
    contractedButton.text.render(contractedButton.shape, {x:15, y:4});

    contractedButton.frameWindow = inpWindow;

    var callback = {
        "button": contractedButton,
        "call": function() {
            var frameWindow = this.button.frameWindow;
            frameWindow.render(topLayer.shape, {x:frameWindow.xPos, y:frameWindow.yPos});
            this.button.erase();
        }
    };
    contractedButton.callback = callback;
    makeClickable(contractedButton, callback);
    return contractedButton;
}

function makeBarButton(inpWindow, yPos)
{
    var height = 25;
    var width = inpWindow.width //+ inpWindow.borderWidth*2;
    var barButton = Object.create(Button);
    barButton.setShape(new createjs.Container());
    barButton.background = makeRect(width, height, /*"#3B4DD0", "#3b5998"*/ '#FFFFFF', 0, 1, 3);
    barButton.background.render(barButton.shape, {x:0, y:0});
    barButton.text=makeTextWidget(inpWindow.text, 15,"Arial", "#666");
    barButton.text.render(barButton.shape, {x:(width-barButton.text.width)/2, y:(height-barButton.text.height)/2});
    barButton.shape.on("click", function (evt)
    {
        var button = makeContractedButton(inpWindow)
        button.render(topLayer.shape, {x:inpWindow.xPos, y:yPos});
        inpWindow.erase()
    });
    barButton.shape.on("mouseover", function(evt)
    {
        this.widget.background.changeColor("#666");
        this.widget.text.changeColor("#ffffff");
    });
    barButton.shape.on("mouseout", function(evt)
    {
        this.widget.background.changeColor("#ffffff");
        this.widget.text.changeColor("#666");
    });
    barButton.shape.on("mousedown", function(evt)
    {
        this.widget.background.changeColor("black");
        this.widget.text.changeColor("#ffffff");
        mousePressed = true;
    });

    return barButton;
}

function makeDataWindow(data, domain, variables, xPos, modelClass)
{ 
    variables.map(function(variable){variable.enabled=true});
    var names = [];
    var enabled = {};
    var bettingVar = truth[truth.length-1]['betting_var'];
    var borderWidth = 0;

    variables.map(function(variable)
    {
        names.push(variable.varName.toLowerCase().replace(" ", "_"));
    });

    names.map(function(name)
    {
        enabled[name] = true;
    });

    var colors={}
    variables.map(function(variable)
    {
        colors[variable.varName.toLowerCase().replace(" ", "_")] = variable.color;
    });

    var view = Object.create(View);
    view.frameHeight = (data.length + 1)*40;
    view.borderWidth = 0;
    view.xPos = xPos;
    view.height = (domain.length + 1)*50;//stageHeight-80;
    view.yPos = stageHeight - 1.5*view.height;
    view.text="<--  OLD" + "          " + "          " + "          " + "          " + "          " + "          " + "          " + "          " + "          " + "DATA" + "          " + "          " + "          " + "          " + "          " + "          " + "          " +  "          " + "          " + "NEW  -->";
    view.setShape(new createjs.Container());
    view.width = stageWidth-xPos-150;//(domain.length + 1)*50;
    view.barButton = makeBarButton(view, stageHeight-25);

    view.enabled = enabled;
    
    
    view.background = makeRect(view.width /*+ betQueryWindow.width*/, view.height*2, '#FFFFFF'/*'#EBEEF4',"#f0f0f0"*/, borderWidth, "#FFFFFF", 3);
    view.background.render(view.shape, {x:0, y:0});
    view.barButton.render(view.shape, {x:0, y:-22});
    yCoord = 5;
    coords = {};
    domain.map(function(element)
    {
	    makeTextWidget(element, 20, 'Arial', '#666').renderW(view, {x:10, y:yCoord+15});
	    coords[element] = yCoord;
	    yCoord += view.height/(domain.length);
	}) 
    view.data = data;

    view.drawInnerFrame = function()
    {
        view.innerFrame = WidgetHL();
        xCoord = 10;

		//alert(mydict.responseJSON)
	predictions = [];
	index = 0;
	view.data.map(function(dat)
		      {
			  var yOffset = 0;
			  names.map(function(key)
				    {
					value = dat[key];
					col = colors[key];
					if (value !== undefined)
					{
					    makeCircle(8, col).renderW(view.innerFrame, {x: xCoord, y: coords[value] + yOffset})
					}
					yOffset += 5;
				    });
			  dat.xCoord = xCoord;
			  pred=makePrediction(predictionVar, index, 40, colors[predictionVar.replace("_", " ").capitalize()])
			  pred.prediction({});                                                                                                                
			  pred.renderW(view.innerFrame, {x: xCoord-10, y: 115})
			  predictions.push(pred)

			  xCoord += 40;
			  index += 1;
		      });
		
        for (var i = 1; i < view.data.length; i++) 
        {
            var dataLine = new createjs.Shape();
            var graphics = dataLine.graphics.setStrokeStyle(2);
            var yOffset = 0;
            names.map(function(key)
            {
                value0 = view.data[i-1][key];
                value1 = view.data[i][key];
                col = colors[key];
                graphics.beginStroke(col).moveTo(view.data[i-1].xCoord + 8,
                    coords[value0] + 8 + yOffset).lineTo(view.data[i].xCoord + 8, 
                    coords[value1] + 8 + yOffset);
                graphics.endStroke();
                view.innerFrame.shape.addChild(dataLine);
                yOffset += 5;
            });
        }
    }

    sendModelIfUpdated();
    
    prevIsFreePeriod = false;
    view.drawInnerFrame();
    
    view.frame = makeFrameWidgetWide( 
         view.height-80, view.width,
        view.innerFrame, view.frameHeight);

    view.frame.render(view.shape, {x:0, y:0});
    startCountDownText(view);

    return view;
}

alertStatus = 0

function getCurrTimePeriod()
{
    // the variable "truth" is just the data that the server returns
    return truth[truth.length-1].period;
}


function removeSpaces(inpStr)
{
    return inpStr.replace(/\s+/g, '');
}

function makePutWindow(bets, domain, betVariable, xPos)
{
    return makeBetWindow2(bets, domain, betVariable, xPos, true);
}

function makeCallWindow(bets, domain, betVariable, xPos, isPut)
{
    return makeBetWindow2(bets, domain, betVariable, xPos, false);
}

function makeBuyButton(xPos)
{
    var betButton = makeButton("Buy", 70, 15);
    betButton.xPos=xPos;
    var callback = {
        //'betView':betView,
        'truth':truth,
        "call": function()
        {
            //var betView = this.betView;
            var valToBetOn = share_val;
            var points = truth[truth.length-1]['price'];
	    var newShares =(user.points-user.points%points)/points;
            //var bayesVar = betView.bayesVar;
            var vars = modelClass.vars;
            var queryPath = "";
            var conditionalVarNames = getIntersect(Object.keys(truth[truth.length-1]), modelClass.vars);
            bettingVar = truth[truth.length-1]['betting_var'];

            conditionalVarNames.map(function(na)
            {
                queryPath += "/" + na + ":" + truth[truth.length-1][na];
            });
	   
            $.ajax({
                type: "GET",
                url: '/js/query' + queryPath,
                async: true,
                
                dataType: "json",
                success: function(data)
                {
                    if (typeof(data) === "object")
                    {
                        var prediction = data[bettingVar];
                        var currentKeys=Object.keys(prediction);
                        currentKeys.sort();
                        threshHold=Math.round(prediction[currentKeys[0]]*100);
                        //alert(threshHold)
                        if (points in range(threshHold + 1) && user.points-truth[truth.length-1]['price']>=0)
                        {
                            $.ajax({
                                type: "post",
                                url: '/js/newpost',
                                async: true,
                                data:JSON.stringify({"user_id": user.id, "treatmentNum": treatmentNum, "valToBetOn": valToBetOn, 'price': points, 'shares':newShares,  'period': truth[truth.length-1].period}),
                                            dataType: "json",
                                dataType: "json",
                                contentType: "application/json",
                                success: function(){} 
                            });
                        }
                        else
                        {
			    if (user.points-truth[truth.length-1]['price']<=0)
			    {
				warn("You have no points to buy shares with.");
				
			    }
			    else
			    {
				warn("The current price of " + JSON.stringify(truth[truth.length-1]['price']) + " points \nexceeds your buying threshold of " + JSON.stringify(threshHold) + " points.\n\nIf you want to buy at the current price,\nyou must change your model!");
			    }
                        }
                    }
                    else {
                        warn(JSON.stringify(data));
                    }
                }
            });
            //this.betView.pointsInp.clear();
        }
    };
    //betView.pointsInp.registerEnterCallback(callback);
    makeClickable(betButton, callback);
    return betButton;
}
    
function makeSellButton(xPos)
{
    var putButton = makeButton("Sell", 70, 15);
    putButton.xPos=xPos;
    var callback = {
        //'betView': betView,
        'truth': truth,
        "call": function()
        {
            //var betView = this.betView;
            var valToBetOn = share_val;
            var points = truth[truth.length-1]['price'];
            //var bayesVar = betView.bayesVar;
            var vars = modelClass.vars;
            var queryPath = "";
            var conditionalVarNames = getIntersect(Object.keys(truth[truth.length-1]), modelClass.vars);
            var bettingVar= truth[truth.length-1]['betting_var'];

            conditionalVarNames.map(function(na)
            {
                queryPath += "/" + na + ":" + truth[truth.length-1][na];
            });
                //alert(truth[truth.length-1].period);
	   
            $.ajax({
                type: "GET",
                url: '/js/query' + queryPath,
                async: true,
                
                dataType: "json",
                success: function(data)
                {
                    if (typeof(data)==="object")
                    {
                        var prediction = data[bettingVar];
                        var currentKeys = Object.keys(prediction);
                        currentKeys.sort();
                        var threshHold = Math.round(prediction[currentKeys[0]]*100);			
                        var greaterVal = range(101).slice(threshHold, 101);
                        var truthVal = (greaterVal.contains(parseInt(points)));
                        if (truthVal === true && user.shares>=1) 
                        {
                            $.ajax({
                                type: "post",
                                url: '/js/newput',
                                async: true,
                                data:JSON.stringify({"user_id": user.id, "treatmentNum": treatmentNum, "valToBetOn": valToBetOn, 'price': points, 'shares':user.shares, 'period': truth[truth.length-1].period}),
                                            dataType: "json",
                                contentType: "application/json",
                                success: function(){} 
                            });
                        }
                        else
			{
			    if (user.shares<=0)
			    {
				warn("You have no shares to sell.");
				
			    }
			    else
			    {
				warn("The current share price of " + JSON.stringify(truth[truth.length-1]['price']) + " points \nis below your threshold of " + JSON.stringify(threshHold) + ". \n\nIf you want to sell at the current price,\n you must change your model!");

			    }
                        /*{
                            
                        }*/
			}
		    }
		    else
		    {
                        warn(JSON.stringify(data));
		    }
                }
		
	    });
	    
            //this.betView.pointsInp.clear();
        }
    };
    //betView.pointsInp.registerEnterCallback(callback);
    makeClickable(putButton, callback);
    return putButton;
}

//The below is not used now.
function makeBetWindow2(bets, domain, betVariable, xPos, isPut)
{ 
    //the variable "betVariable" is the variable on which bets are placed.  
    var betWidth = 100;
    var betHeight = 40
    var betSpacing = 10;
    var distBetweenYs = betHeight + betSpacing;
    var borderWidth = 0;

    var view = WidgetHL();
    view.width = 240;
    view.height = 170;
    view.frameHeight = 190;

    view.borderWidth = borderWidth;
    view.xPos = xPos; //this is the x position of the entire view, along the stage.

    if (isPut) {
        view.text = "FOR SALE";
    } else {
        view.text = "SEEKING TO BUY";
    }

    view.barButton = makeBarButton(view, 75);
    view.bayesVar = betVariable;

    view.background = makeRect(view.width, view.height, '#FFFFFF'/*'#EBEEF4', "#f0f0f0"*/, borderWidth, "white", 3);
    view.background.renderW(view, {x:0, y:0});
    view.yPos = 75;

    view.bets = bets;
    view.data = {"myputs": [], "myposts": []};

    view.drawFrame = function()
    {
        var view = this;
        var frame = WidgetHL();
        frame.postItems = [];
        view.bets.map(function(bet)
        {
            var postItem = WidgetHL();
            postItem.bet = bet;
            bet.postItem = postItem;

            postItem.value = makeTextWidget(bet.title, 16, "Arial", "#666");
            postItem.betEdge = makeRect(40, betHeight-20, '#FFFFFF'/*"#A9D0F5"*/, 1, '#FFFFFF'/*"#A9D0F5"*/, 50);
            postItem.betEdge.renderW(postItem, {x: 40, y: 20});
            postItem.betBackground = makeRect(view.width,betHeight-20,'#FFFFFF'/*"#A9D0F5"*/, 1, '#FFFFFF'/*"#A9D0F5"*/);
            postItem.betBackground.renderW(postItem, {x:50, y:20});
            //postItem.value.renderW(postItem, {x:45, y:22});
            postItem.points = makeTextWidget(bet.price, 16, "Arial", "#666");
            postItem.pointsBackground = makeRect(30,betHeight-20,"#ffffff", 1, '#FFFFFF'/*"#A9D0F5"*/, 50);
            postItem.pointsBackground.renderW(postItem, {x:view.width-45, y:20});
            postItem.points.renderW(postItem, {x:view.width-40, y:22});

            postItem.author = makeTextWidget(postItem.bet.author, 12, "Arial", "#666");
            postItem.author.renderW(postItem, {x:65, y:23});
            postItem.view = view;

            postItem.hasAccept = false;
            if (postItem.bet.userid !== user.id)
            {
                postItem.hasAccept = true;
                postItem.acceptButton = WidgetHL();
                var acceptButton = postItem.acceptButton;
                acceptButton.background = makeRect(60, 20, "#3B5998");
                acceptButton.background.renderW(acceptButton, {x: 0, y: 0});

                if (postItem.view.isPut) {
                    var acceptText = "BUY";
                } else {
                    var acceptText = "SELL";
                }

                acceptButton.text = makeTextWidget(acceptText, 10, "Arial", "white");
                acceptButton.text.renderW(acceptButton, {x: 10, y:5});
                acceptButton.renderW(postItem, {x:150, y: 45})

                var acceptButtonCallBack = {
                    "acceptButton": acceptButton,
                    "postItem": postItem,
                    "call": function() {
                        var acceptOperation;
                        if (this.postItem.view.isPut) {
                            acceptOperation = 'accept_put';
                        } else {
                            acceptOperation = 'accept_call';
                        }
                        $.ajax({
                            type: "post",
                            url: '/js/' + acceptOperation + '/' + this.postItem.bet.id+"/"+ user.id+'/'+ this.postItem.bet.userid,
                            async: true,
                            data: JSON.stringify({"points": this.postItem.bet.price}), 
                            dataType: "json",
                            contentType: "application/json",
                            success: function(){}
                        });
                    }
                };

                makeClickable3(acceptButton, acceptButtonCallBack, "orange", "red");
            }
            frame.postItems.push(postItem);
        });

        if (betWindowDebug) {
            alert("frame.postItems.length: " + frame.postItems.length);
        }

        yCoord = 70;
        view.frameHeight = Math.max(distBetweenYs*frame.postItems.length+20, 190);//it would be great to make this adoptable! 
        for (var i=0;i<frame.postItems.length;i++)
        {
            frame.postItems[i].yCoord = yCoord;
            frame.postItems[i].renderW(frame, {x:10, y: view.frameHeight-frame.postItems[i].yCoord});
            yCoord += distBetweenYs;
        }

        view.frame = makeFrameWidget( 
            view.width, 160,
            frame, view.frameHeight);

        view.frame.render(view.shape, {x:0, y:3});
    }

    view.drawFrame();
    view.isPut = isPut;

    view.previousUpdateTime = getTime();

    function refreshBets(event, data)
    {
        var view = data.view;
        var currentTime = getTime();
        if (currentTime-view.previousUpdateTime > 1000)
        {
            view.previousUpdateTime = currentTime;
            var getBetsUrl;
            if (view.isPut) {
                getBetsUrl = '/js/puts/'+ treatmentNum + '/' + getCurrTimePeriod();
                view.dataReturnKey = "myputs";
            } else {
                getBetsUrl = '/js/calls/' + treatmentNum + '/' + getCurrTimePeriod();
                view.dataReturnKey = "myposts";
            }
            //alert("sending update request to " + getBetsUrl);
            $.ajax(
                {
                    type: "GET",
                    url: getBetsUrl,
                    async: true,
                    dataType: "json",
                    success: function(data)
                    {
                        //do your stuff with the JSON data;
                        if (view.data[view.dataReturnKey].length !== data[view.dataReturnKey].length)
                        {
                            if ((putWindowDebug && view.isPut) || (callWindowDebug && !view.isPut))
                            {
                                var typeOfBet;
                                if (view.isPut) {
                                    typeOfBet = "PUTS";
                                } else {
                                    typeOfBet = "CALLS";
                                }
                                alert("NUMBER OF " + typeOfBet + " HAS CHANGED");
                                alert("view.data." + view.dataReturnKey + ".length: " + view.data[view.dataReturnKey].length);
                                alert("data." + view.dataReturnKey + ".length: " + data[view.dataReturnKey].length);
                            }
                            view.frame.erase();
                            view.bets = data[view.dataReturnKey];
                            view.drawFrame();
                            view.data = data;
                        }
                    }
                });
        }
    }

    var count=0;
    previousTimeT2 = getTime();

    createjs.Ticker.on("tick", refreshBets, null, false, {view: view});

    view.betBack = makeRect(view.width, 27, "#ffffff", borderWidth);
    view.betBack.render(view.shape, {x:0, y:162});
    view.inputLabel = makeTextWidget("Points:", 12, "Arial", "#666");
    view.inputLabel.render(view.shape, {x:70, y:170});

    ////view.pointMenu = makeScrollMenu(["10", "20", "30", "40", "50", "60", "70", "80", "90"], 40, 15, "white","0", 12);
    ////view.bettingMenu = makeScrollMenu(["A", "B", "C"], 40, 15, "white","Value", 12);
    ////view.pointMenu.render(view.shape, {x:120, y:170})
    ////view.bettingMenu.render(view.shape, {x:35, y:170});

    view.pointsInp = makeTextBox(20);
    view.pointsInp.renderW(view, Point(110, 165));

    view.barButton.render(view.shape, {x:-borderWidth, y:-22});

    if (view.isPut) {
        view.betButton = makePutButton(view);
    } else {
        view.betButton = makeBetButton2(view);
    }
    view.betButton.render(view.shape, {x:view.width-75, y:170});

    return view;
}

function showTestDataWindow()
{
    dataWindow = makeDataWindow(truth, ['A', 'B', 'C'], variables[2]);
    dataWindow.render(stage, {x:600, y:stageHeight-290});
}

