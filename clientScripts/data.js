// going to break the game into periods:1, 2, 3, 4, 5 etc. and that way all posts and all data will be the same for all players no matter when they start to play. This also solves Alessandra Casella's problem. There has to be a global clock that is gotten by an ajax call. The global clock gives periods: 1, 2, 3, plus how many seconds are left before the next period starts. Each bet and each datapoint is tagged with a period number (the current one). Each players interface pulls out the current bets and datapoints out of the mongodb database. 

var putWindowDebug = false;
var callWindowDebug = false;
var betWindowDebug = false;

function getTime()
{
    var d = new Date();
    return d.getTime();
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
            //var theBet = this.bet.activeChoice;
            //var points = this.points.activeChoice;
            var betView = this.betView;
            //var theBet = this.betView.pointsInp.getNumVal();
            var theBet = "A";
            var points = "" + this.betView.pointsInp.getNumVal();
            var bayesVar = betView.bayesVar;
            //alert(truth[truth.length-1].period);
            if (bayesVar.possibilities.indexOf(theBet) >= 0 && points in range(101))
            { 
            $.ajax({
                type: "post",
                url: '/ajax/newpost',
                async: true,
                data:JSON.stringify({"variable":bayesVar.varName.replace(/\s+/g, ''), 
    "username":user.name, "userid":user.id, "subject":theBet, 'price':points, 'open': 1, 'comments':[], 'period': truth[truth.length-1].period}),
                dataType: "json",
                contentType: "application/json",
                success: function(){} 
        
            });
            //betView.refresh(truth);
            
            }
            else {alert("you must first choose a value for your bet and you must decide how many points you want to bet!")}
        }
    };
    makeClickable(betButton, callback);
    return betButton;
}

function makePutButton(betView)
{
    var putButton = makeButton("Offer Sale!", 70, 15);
    var callback = {
        'betView': betView,
        'truth': truth,
        "call": function() {
            var betView = this.betView;
            //var thePut = this.betView.pointsInp.getNumVal();
            var thePut = "A";
            var points = "" + this.betView.pointsInp.getNumVal();
            var bayesVar = betView.bayesVar;
            if (bayesVar.possibilities.indexOf(thePut) >= 0 && points in range(101))
            { 
                $.ajax({
                    type: "post",
                    url: '/ajax/newput',
                    async: true,
                    data:JSON.stringify({ "variable": bayesVar.varName.replace(/\s+/g, ''), 
                                          "username": user.name,
                                          "userid": user.id,
                                          "subject": thePut,
                                          'price': points,
                                          'open': 1,
                                          'comments':[],
                                          'period': getCurrTimePeriod()}),
                    dataType: "json",
                    contentType: "application/json",
                    success: function() {} 
                });
                //betView.refresh(truth);
		
            }
            else {
                alert("you must first choose a value for your bet and you must decide how many points you want to bet!")
            }
        }
    };
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

    contractedButton.background = makeRect(contractedButtonWidth, height, "#ffffff", 1, "#666", 3);
    contractedButton.background.render(contractedButton.shape, {x:0, y:0});
    contractedButton.text.render(contractedButton.shape, {x:15, y:4});

    contractedButton.frameWindow = inpWindow;
    
    var callback = {
        "button": contractedButton,
        "window": inpWindow,
        "call": function() {
            var frameWindow = this.button.frameWindow;
            frameWindow.render(topLayer.shape, {x:frameWindow.xPos, y:frameWindow.yPos});
            this.button.erase();
        }
    };
    makeClickable(contractedButton, callback)
    return contractedButton;
}

function makeBarButton(inpWindow)
{
    var height = 25;
    var width = inpWindow.width + inpWindow.borderWidth*2;
    var barButton = Object.create(Button);
    barButton.setShape(new createjs.Container());
    barButton.background = makeRect(width, height, /*"#3B4DD0"*/ "#3b5998", 0, 1, 3);
    barButton.background.render(barButton.shape, {x:0, y:0});
    barButton.text=makeTextWidget(inpWindow.text, 15,"Verdana", "#ffffff");
    barButton.text.render(barButton.shape, {x:(width-barButton.text.width)/2, y:(height-barButton.text.height)/2});
    barButton.shape.on("click", function (evt)
            {
                var button = makeContractedButton(inpWindow)
                        //dataWindow=makeDataWindow(truth, ['A', 'B', 'C'], variables);
                button.render(stage, {x:inpWindow.xPos, y:stageHeight-25});
                inpWindow.erase()
            });

    return barButton;
}
  
function makeDataWindow(data, domain, variables, xPos, modelClass, isMonty)
{ 
    variables.map(function(variable){variable.enabled=true});
    var borderWidth = 0.3;
    var names=[];
    var enabled={};

    variables.map(function(variable){names.push(variable.varName.toLowerCase().replace(" ", "_"))});

    names.map(function(name){enabled[name]=true});

    var colors={}
    variables.map(function(variable){
        colors[variable.varName.toLowerCase().replace(" ", "_")] = variable.color;
    });

    var view = Object.create(View);
    
    view.enabled=enabled;
    view.height = stageHeight-80;
    view.width=(domain.length + 1)*50;
    view.frameHeight = (data.length + 1)*40;
    view.borderWidth=borderWidth;
    view.xPos = xPos;
    view.yPos = stageHeight - view.height;
    view.text="DATA";
    view.setShape(new createjs.Container());
    view.barButton=makeBarButton(view);
    
    view.background = makeRect(view.width, view.height, '#EBEEF4'/*"#f0f0f0"*/, borderWidth, 1, 3);
    view.background.render(view.shape, {x:0, y:0});
    view.barButton.render(view.shape, {x:-borderWidth, y:-22});
    xCoord = 20;
    coords = {};
    domain.map(function(element)
    {
	    makeTextWidget(element, 30, 'Arial', '#666').renderW(view, {x:xCoord, y:10});
	    coords[element] = xCoord;
	    xCoord += view.width/(domain.length);
	}) 
    view.data = data;

    view.drawInnerFrame = function()
    {
        view.innerFrame = WidgetHL();
        yCoord = 40;
        view.data.map(function(dat)
        {
            names.map(function(key)
            {
                value = dat[key];
                col = colors[key];
                //alert(JSON.stringify({'col':col, 'x':xCoord, 'y':yCoord}));
                if (value!==undefined)
                {
                    makeCircle(8, col).renderW(view.innerFrame, {x: coords[value], y: yCoord})
                }
            
            })
            dat.yCoord = yCoord;
            yCoord += 40;
        })

        for (var i = 1; i < view.data.length; i++) 
        {
            var dataLine = new createjs.Shape();
            var graphics = dataLine.graphics.setStrokeStyle(2);
            names.map(function(key) {
                value0 = view.data[i-1][key];
                value1 = view.data[i][key]
                col = colors[key];
                graphics.beginStroke(col).moveTo(coords[value0] + 8,
                        view.data[i-1].yCoord + 8).lineTo(coords[value1] + 8,
                        view.data[i].yCoord + 8);
                graphics.endStroke();
                view.innerFrame.shape.addChild(dataLine);
                //alert(JSON.stringify({'col':col, 'x':xCoord, 'y':yCoord}));
                //makeCircle(8, col).renderW(view,{x:coords[value], y:yCoord})
            });
        }
    }  

    view.drawInnerFrame();
    var num;
    var count;
    var countDown = WidgetHL();

    $.ajax(
    {
	    type: "GET",
	    url: '/ajax/clock',
	    async: true,
    
	    dataType: "json",
	    success: function(data)
        {
            //do your stuff with the JSON data;
            num = data[0] + 1; 
            //count = data[1]
            countDown.text = makeTextWidget("New data in "+ num + " minutes", 12, "Arial", "#666");
            countDown.background = makeRect(countDown.text.width+10, 20, '#EBEEF4');
            countDown.background.renderW(countDown, Point(0, 0));
            countDown.text.renderW(countDown, Point(5, 5));
            countDown.renderW(view, Point((view.width - countDown.text.width)/2, /*view.height-40*/stageHeight-110));
        }
    });

    updateCount = function()
    {
        $.ajax({
            type: "GET",
            url: '/ajax/clock',
            dataType: "json",
            async: false, //options.sync,
            success: function(data) {
                count = data[1]// todo
                if (count===0) {
                    num-=1;
                }
                if (num===1) {
                    if (count!==0) {
                        countDown.text.changeText("New data in "+count+" seconds")
                    }
                } else if (num==0) {
                    renewData()
                    num=2;
                } else {
                    countDown.text.changeText("New data in "+num+" minutes")
                }
            
            }
        });
    }

    renewData = function()
    {
        //we don't need to produce any new data directed from the client side; the server takes care of that. We just need to request the newest data. 
        $.ajax({
            type: "GET",
            url: '/ajax/newData/' + user.id,
            async: true,

            dataType: "json",
            success: function(data)
            {
		if (data["newModelClass"]) 
		{
		    resetModelClass(modelClass)
		}
		else {
            data = data['samples'];
                var newTruth1 = data[0];
                var newTruth2 = data[1];
                newTruth1.yCoord = truth[truth.length-1].yCoord;
                newTruth2.yCoord = truth[truth.length-1].yCoord + 40;
                truth = truth.slice(0, truth.length-1).concat([newTruth1, newTruth2]);
                view.data = view.data.slice(0, view.data.length-1).concat(data);

                view.frame.erase();
                view.frameHeight += 40;
                view.drawInnerFrame();

                view.frame = makeFrameWidget( 
                    view.width, view.height-80,
                    view.innerFrame, view.frameHeight);

                view.frame.render(view.shape, {x:0, y:45});
                countDown.renderW(view, Point((view.width-countDown.text.width)/2-20, stageHeight-110));

                var totalWinnings=0;
                //alert(truth[truth.length-2]['prize_door'])
                var bettingVar = modelClass['betting_variable'];
                if (truth[truth.length-2][bettingVar] !== share_val)
                {
                    alert("user.points: " + user.points + ", user.shares: " + user.shares);
                    var newWinnings= (user.points + user.shares*100);
                    user.score += newWinnings; 
                    warn('Here are your total winnings: ' + newWinnings)
                    scoreTag.score.changeText(JSON.stringify(user.score));
                    //pointWindow.points.changeText(user.points +"      points");
                    //totalWinnings = user.shares*100;
                    var scoreLength = JSON.stringify(scoreTag.score.shape.text).length*4
                    scoreTag.shape.graphics.clear();
                    var g = scoreTag.shape.graphics.beginFill("white");
                    
                    g.beginStroke("black").setStrokeStyle(0.5);
            
                    g.moveTo(10, 8).lineTo(10, 14);
                    g.lineTo(6, 17)
                    g.lineTo(10, 20)
                    g.lineTo(10, 26)
                    g.lineTo(10 + scoreLength + 16, 26)
                    g.lineTo(10 + scoreLength + 16, 8).closePath();
            
                    g.endStroke("black");
                    g.endFill();
		    
                }
                else
                {
                    var newWinnings = user.points;
                    user.score += newWinnings;
                    warn('Here are your total winnings: ' + newWinnings)
                            scoreTag.score.changeText(JSON.stringify(user.score));
                            //totalWinnings = 0;
                    var scoreLength = JSON.stringify(scoreTag.score.shape.text).length*4
                    scoreTag.shape.graphics.clear();
                    var g = scoreTag.shape.graphics.beginFill("white");
                       
                    g.beginStroke("black").setStrokeStyle(0.5);
            
                    g.moveTo(10, 8).lineTo(10, 14);
                    g.lineTo(6, 17)
                    g.lineTo(10, 20)
                    g.lineTo(10, 26)
                    g.lineTo(10 + scoreLength + 16, 26)
                    g.lineTo(10 + scoreLength + 16, 8).closePath();
            
                    g.endStroke("black");
                    g.endFill();
		    
                }

                if (isMonty)
                {
                    if (truth[truth.length-1]['monty_door']==='A')
                    {
                        share_val = 'B';
                    }
                    else
                    {
                        share_val = 'A';
                    }
                } else {
                    share_val = 'H';
                }
                var winningsWindow = WidgetHL();
                winningsWindow.background = makeRect(400, 200, '#EBEEF4'/*"#f0f0f0"*/, 0.5, 1, 3);

                winningsWindow.background.render(winningsWindow.shape, Point(0, 0));
                winningsWindow.bar = makeRect(401, 25, "#3b5998", 0, 1, 3);
                winningsWindow.bar.render(winningsWindow.shape, Point(0, -25.5));
                winningsWindow.killButton=makeDeleteCross(10, 10, "#8b9dc3", 2);
                winningsWindow.killButton.render(winningsWindow.shape, Point(385, -18));
                winningsWindow.killButton.shape.on('click', function(){winningsWindow.erase()});
                winningsWindow.killButton.shape.on("mouseover", function(evt)
                               {
                                   winningsWindow.killButton.changeColor("#ffffff");
                               })
                winningsWindow.killButton.shape.on("mouseout", function(evt)
                               {
                                   winningsWindow.killButton.changeColor('#8b9dc3'/*"#f0f0f0"*/);
                               });
                var message=user.first_name + ", ";
                var message2="";
                if (totalWinnings > 0) {
                    message2 += "won " + totalWinnings + " points."
                }
                else{
                    message2 += "lost " + Math.abs(totalWinnings) + " points."
                }
                winningsWindow.message1 = makeTextWidget(message, 16, "Arial", "#666");
                winningsWindow.message2 = makeTextWidget(message2, 16, "Arial", "#666");
                winningsWindow.message1.renderW(winningsWindow, Point(10, 10));
                winningsWindow.message2.renderW(winningsWindow, Point(10, 40));
                //winningsWindow.render(topLayer.shape, Point(stageWidth/2-200, stageHeight/2-100));
		}
	      }
            });
    }
    
    
    var resInterval = window.setInterval('updateCount()', 1000); // 1 second
	//count=updateCount(count);

    view.drawInnerFrame();
    
    view.frame = makeFrameWidget( 
        view.width, view.height-80,
        view.innerFrame, view.frameHeight);

    view.frame.render(view.shape, {x:0, y:45});
    
    return view;
    
}

alertStatus = 0

function getCurrTimePeriod()
{
    // the variable "truth" is just the data that the server returns
    // console.log("truth: " + truth)
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

function makeBetWindow2(bets, domain, betVariable, xPos, isPut)
{ 
    //the variable "betVariable" is the variable on which bets are placed.  
    var betWidth = 100;
    var betHeight = 40
    var betSpacing = 10;
    var distBetweenYs = betHeight + betSpacing;
    var borderWidth = 0.3;
    //var view = Object.create(Widget);

    var view = WidgetHL();
    view.width = 240;
    //alert(bets.length);
    //view.height = Math.max(distBetweenYs*bets.length + 20, 170);//it would be great to make this adoptable! 
    view.height = 170;
    view.frameHeight=190;

    //view.background.render(view.shape, {x:0, y:0});
    view.borderWidth = borderWidth;
    view.xPos = xPos; //this is the x position of the entire view, along the stage.

    if (isPut) {
        view.text = "FOR SALE";
    } else {
        view.text = "SEEKING TO BUY";
    }

    view.barButton = makeBarButton(view);
    view.bayesVar = betVariable;

    view.background = makeRect(view.width, view.height, '#EBEEF4'/*"#f0f0f0"*/, borderWidth, 1, 3);
    view.background.renderW(view, {x:0, y:0});
    view.yPos = stageHeight - view.height - 25;

    //var frame=makeBettingFrame(betVariable, view);
    view.bets = bets;
    view.data = {"myputs": [], "myposts": []};

    view.drawFrame = function()
    {
        var view = this;
        var frame = WidgetHL();
        frame.postItems = [];
        view.bets.map(function(bet)
        {
	    //alert(JSON.stringify(bet))
            var postItem = WidgetHL();
            postItem.bet = bet;
            bet.postItem = postItem;

            postItem.value = makeTextWidget(bet.title, 16, "Arial", "#666");
            postItem.betEdge = makeRect(40, betHeight-20, "#A9D0F5", 1, "#A9D0F5", 50);
            postItem.betEdge.renderW(postItem, {x: 40, y: 20});
            postItem.betBackground = makeRect(view.width,betHeight-20,"#A9D0F5", 1, "#A9D0F5");
            postItem.betBackground.renderW(postItem, {x:50, y:20});
            postItem.value.renderW(postItem, {x:45, y:22});
	    //alert(bet.userid)
            if (bet.userid===user.id)
            {
		//alert(bet.userid)
                bet.pic = new createjs.Bitmap(THIS_DOMAIN + "/ajax/picture/" + bet.userid + "/12/12");
		//alert(bet.pic)
                bet.pic.x = 0;
                bet.pic.y = 20;
                bet.pic.scaleX *= 0.18;
                bet.pic.scaleY *= 0.18;
		//alert(bet.pic)
                //postItem.shape.addChild(bet.pic);
            }
	    //else {alert(JSON.stringify(bet))}
            postItem.points = makeTextWidget(bet.price, 16, "Arial", "#666");
            postItem.pointsBackground=makeRect(30,betHeight-20,"#ffffff", 1, "#A9D0F5", 50);
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
                            url: '/ajax/' + acceptOperation + '/' + this.postItem.bet.id+"/"+ user.id+'/'+ this.postItem.bet.userid,
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
            ////postItem.yCoord=yCoord;
            ////postItem.renderW(frame, {x:10, y:view.height-postItem.yCoord});
            ////yCoord += distBetweenYs;
        });

        if (betWindowDebug) {
            alert("frame.postItems.length: " + frame.postItems.length);
        }

        ////frame.postItems[i]
        ////for (var i=0;i<

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
        if (currentTime-view.previousUpdateTime > 400)
        {
            view.previousUpdateTime = currentTime;
            var getBetsUrl;
            if (view.isPut) {
                getBetsUrl = '/ajax/puts/'+ removeSpaces(view.bayesVar.varName) + '/' + getCurrTimePeriod();
                view.dataReturnKey = "myputs";
            } else {
                getBetsUrl = '/ajax/calls/' + removeSpaces(view.bayesVar.varName) + '/' + getCurrTimePeriod();
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
                        //console.log(data);
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

    view.betBack = makeRect(view.width, 27, "#ffffff", borderWidth, 1, 0);
    view.betBack.render(view.shape, {x:0, y:162});
    view.inputLabel = makeTextWidget("Points:", 12, "Arial", "#666");
    view.inputLabel.render(view.shape, {x:70, y:170});

    //view.pointMenu = makeScrollMenu(["10", "20", "30", "40", "50", "60", "70", "80", "90"], 40, 15, "white","0", 12);

    //view.bettingMenu = makeScrollMenu(["A", "B", "C"], 40, 15, "white","Value", 12);

    //view.pointMenu.render(view.shape, {x:120, y:170})

    //view.bettingMenu.render(view.shape, {x:35, y:170});
    
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

