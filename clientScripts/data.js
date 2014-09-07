//going to break the game into periods:1, 2, 3, 4, 5 etc. and that way all posts and all data will be the same for all players no matter when they start to play. This also solves Alessandra Casella's problem. There has to be a global clock that is gotten by an ajax call. The global clock gives periods: 1, 2, 3, plus how many seconds are left before the next period starts. Each bet and each datapoint is tagged with a period number (the current one). Each players interface pulls out the current bets and datapoints out of the mongodb database. 

function makeBetButton2(betView)
{
    var betButton = makeButton("Place Bet!", 70, 15);
    var callback = {
        "bet": betView.bettingMenu,
	"points":betView.pointMenu,
	'betView':betView,
	'truth':truth,
        "call": function() {
            var theBet=this.bet.activeChoice;
	    var points=this.points.activeChoice;
	    var betView=this.betView;
	    var bayesVar=betView.bayesVar;
	    //alert(truth[truth.length-1].period);
	    if (bayesVar.possibilities.indexOf(theBet)>=0 && points in range(91))
	    { 
		$.ajax({
		    type: "post",
		    url: '/ajax/newpost',
		    async: true,
		    data:JSON.stringify({"variable":bayesVar.varName.replace(/\s+/g, ''), 
"username":user.name, "userid":user.id, "subject":theBet, 'body':points, 'comments':[], 'period': truth[truth.length-1].period}),
		    dataType: "json",
		    contentType: "application/json",
		    success: function(user){alert(user.name)} 
    
		});
		betView.refresh(truth);
		
	    }
	    else {alert("you must first choose a value for your bet and you must decide how many points you want to bet!")}
        }
    };
    makeClickable(betButton, callback);
    return betButton;
}

function makeContractedButton(window) {
    var height=25;
    var width=window.width/2;
    var ContractedButton = Object.create(Button);
    ContractedButton.setShape(new createjs.Container());
    ContractedButton.background = makeRect(width, height, "#ffffff", 1, "#666", 3);
    ContractedButton.background.render(ContractedButton.shape, {x:0, y:0});
    ContractedButton.text=makeTextWidget(window.text, 15,"Verdana", "#666");
    ContractedButton.text.render(ContractedButton.shape, {x:(width-ContractedButton.text.width)/2, y:(height-ContractedButton.text.height)/2});
    
    var callback = {
	"button":ContractedButton,
	"window":window,
        "call": function() {
	    var window=this.window;
            this.button.shape.on("click", function (evt)
            {
                //dataWindow=makeDataWindow(truth, ['A', 'B', 'C'], variables);
		window.render(topLayer.shape, {x:window.xPos, y:stageHeight-window.frameHeight});
		this.widget.erase()
            });
        }
    };
    makeClickable(ContractedButton, callback)
    return ContractedButton;
}
function makeBarButton(window)
{
    var height=25;
    var width=window.width+window.borderWidth*2;
    var barButton = Object.create(Button);
    barButton.setShape(new createjs.Container());
    barButton.background = makeRect(width, height, /*"#3B4DD0"*/ "#3b5998", 0, 1, 3);
    barButton.background.render(barButton.shape, {x:0, y:0});
    barButton.text=makeTextWidget(window.text, 15,"Verdana", "#ffffff");
    barButton.text.render(barButton.shape, {x:(width-barButton.text.width)/2, y:(height-barButton.text.height)/2});
    barButton.shape.on("click", function (evt)
            {
		var button=makeContractedButton(window)
                //dataWindow=makeDataWindow(truth, ['A', 'B', 'C'], variables);
		button.render(stage, {x:window.xPos, y:stageHeight-25});
		window.erase()
            });

    return barButton;
}
  
function makeDataWindow(data, domain, variables, Xpos)
{ 
    variables.map(function(variable){variable.enabled=true});
    var borderWidth = 0.3;
    var names=[];
    var enabled={};
    

    variables.map(function(variable){names.push(variable.varName.toLowerCase().replace(" ", "_"))});

    names.map(function(name){enabled[name]=true});

    var colors={}
    variables.map(function(variable){colors[variable.varName.toLowerCase().replace(" ", "_")]=variable.color});

    var view = Object.create(View);
    
    view.enabled=enabled;
    view.frameHeight=stageHeight-80;
    view.width=(domain.length + 1)*50;
    view.height=(data.length + 2)*40;
    view.borderWidth=borderWidth;
    view.xPos=Xpos;
    view.text="DATA";
    view.setShape(new createjs.Container());
    view.barButton=makeBarButton(view);
    
    view.background = makeRect(view.width, view.height, '#EBEEF4'/*"#f0f0f0"*/, borderWidth, 1, 3);
    view.background.render(view.shape, {x:0, y:0});
    view.barButton.render(view.shape, {x:-borderWidth, y:-22});
    xCoord=20;
    coords={};
    domain.map(
	function(element){
	    makeTextWidget(element, 30, 'Arial', '#666').renderW(view,{x:xCoord, y:10});
	    coords[element]=xCoord;
	    xCoord+=view.width/(domain.length);
	    
	}) 
    view.data=data;
    var frame = Object.create(View);
    view.drawFrame=function(){
	
	frame.setShape(new createjs.Container());
	yCoord=40;
	view.data.map(function(dat){
	    names.map(function(key){
	    
		value=dat[key];
		col=colors[key];
	    //alert(JSON.stringify({'col':col, 'x':xCoord, 'y':yCoord}));
		if (value!==undefined){makeCircle(8, col).renderW(frame,{x:coords[value], y:yCoord})}
	    
	    })
	    dat.yCoord=yCoord;
	    yCoord+=40;
	})

    
	for (var i = 1; i < view.data.length; i++) 
	{
	    var dataLine = new createjs.Shape();
	    var graphics = dataLine.graphics.setStrokeStyle(2);
	    names.map(function(key){
	    
		value0=view.data[i-1][key];
		value1=view.data[i][key]
		col=colors[key];
		graphics.beginStroke(col).moveTo(coords[value0]+8, view.data[i-1].yCoord+8).lineTo(coords[value1]+8, view.data[i].yCoord+8);
		graphics.endStroke();
		frame.shape.addChild(dataLine);
	    
	    //alert(JSON.stringify({'col':col, 'x':xCoord, 'y':yCoord}));
	    //makeCircle(8, col).renderW(view,{x:coords[value], y:yCoord})
	    })
	
	}
    }  
    view.drawFrame()
    var num;
    var count;
    var countDown = WidgetHL();
    $.ajax({
	    type: "GET",
	    url: '/ajax/clock',
	    async: true,
    
	    dataType: "json",
	    success: function(data){
		//do your stuff with the JSON data;
		num = data[0] + 1; 
		//count = data[1]
		countDown.text=makeTextWidget("New data in "+ num + " minutes", 12, "Arial", "#666");
		countDown.background=makeRect(countDown.text.width+10, 20, '#EBEEF4');
		countDown.background.renderW(countDown, Point(0, 0));
		countDown.text.renderW(countDown, Point(5, 5));
		countDown.renderW(view, Point((view.width-countDown.text.width)/2, /*view.height-40*/stageHeight-110));
		
	    }})
        
    
    

    updateCount = function() {
	$.ajax({
	    type: "GET",
	    url: '/ajax/clock',
	    dataType: "json",
	    async: false, //options.sync,
	    success: function(data) {
		count = data[1]// todo
		if (count===0){
		    num-=1;
		}
		if (num===1){
		    if (count!==0){
			countDown.text.changeText("New data in "+count+" seconds")
		    }
		    //if (count===0){ 
		
		}
		else if (num==0){
		    renewData()
		    num=2;
		}
		else{
		    countDown.text.changeText("New data in "+num+" minutes")
		}
		
	    }
	})
    };

    renewData = function() {
	//we don't need to produce any new data directed from the client side; the server takes care of that. We just need to request the newest data. 
	$.ajax({
	    type: "GET",
	    url: '/ajax/newData',
	    async: true,
    
	    dataType: "json",
	    success: function(data){
		var newTruth1=data[0];
		var newTruth2=data[1];
		newTruth1.yCoord=truth[truth.length-1].yCoord;
		newTruth2.yCoord=truth[truth.length-1].yCoord+40;
		truth=truth.slice(0, truth.length-1).concat([newTruth1, newTruth2]);
		//alert(JSON.stringify(truth[truth.length-2]['prize_door']));
		view.data=view.data.slice(0, view.data.length-1).concat(data);
			//alert(JSON.stringify(view.data.slice(view.data.length-2,view.data.length)));
			
			
		frame.erase()
		view.height+=40;
		view.drawFrame()
			
		frame = makeFrameWidget( 
		    view.width,stageHeight-123,
		    frame, view.height);

		frame.render(view.shape, {x:0, y:40});
		countDown.renderW(view, Point((view.width-countDown.text.width)/2-20, stageHeight-110));
			//
			//
			//
		renewalPosts=[]
		var totalWinnings=0;
		posts.map(function(p){
			    
		    if (truth[truth.length-2]['prize_door']===p.title)
		    {
			if (p.userid===user.id){
			    //alert("you just won "+ p.body+ " points")
			    user.points +=parseInt(p.body);
			    pointWindow.points.changeText(user.points +"      points");
			    totalWinnings+=parseInt(p.body);
			}
			p.won=1;
			renewalPosts.push(p)
		    }
		    else
		    {
			if (p.userid===user.id){
			    //alert("you just lost "+ p.body+ " points")
			    user.points -=parseInt(p.body);
			    pointWindow.points.changeText(user.points +"      points");
			    totalWinnings-=parseInt(p.body);
			}
			p.lost=1;
			renewalPosts.push(p)
		    }
			    
		})
		
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
		if (renewalPosts.length > 1){
		    message+="your bets "
		}
		else{message+="your bet "}
		var message2="";
		if (totalWinnings > 0) {message2+="won "+totalWinnings+" points."}
		else{message2+="lost "+Math.abs(totalWinnings)+" points."}
		winningsWindow.message1=makeTextWidget(message, 16, "Arial", "#666");
		winningsWindow.message2=makeTextWidget(message2, 16, "Arial", "#666");
		winningsWindow.message1.renderW(winningsWindow, Point(10, 10));
		winningsWindow.message2.renderW(winningsWindow, Point(10, 40));
		if (renewalPosts.length > 0){
		    winningsWindow.render(topLayer.shape, Point(stageWidth/2-200, stageHeight/2-100));
		};
		
	    }
	});
    }
    
    
    var ResInterval = window.setInterval('updateCount()', 1000); // 1 second
	//count=updateCount(count);

    
    frame = makeFrameWidget( 
	view.width,stageHeight-123,
	frame, view.height);

    frame.render(view.shape, {x:0, y:40});
    
    return view
    
}

function makeBetWindow(bets, domain, betVariable, Xpos)
{ 
    //the variable "betVariable" is the variable on which bets are placed.  
    var betWidth = 100;
    var betHeight=40
    var betSpacing = 10;
    var distBetweenYs = betHeight + betSpacing;
    var borderWidth = 0.3;
    var view = Object.create(View);
    view.width=240;
    view.height=Math.max(distBetweenYs*bets.length +20, 170);//it would be great to make this adoptable! 
    view.frameHeight=190;
    	    
    //view.background.render(view.shape, {x:0, y:0});
    view.borderWidth=borderWidth;
    view.xPos=Xpos; //this is the x position of the entire view, along the stage.
    view.text="BETS";
    view.setShape(new createjs.Container());
    view.barButton=makeBarButton(view);
    view.bayesVar=betVariable;
    
    view.background = makeRect(view.width, view.height, '#EBEEF4'/*"#f0f0f0"*/, borderWidth, 1, 3);
    view.background.render(view.shape, {x:0, y:0});
    
    //var frame=makeBettingFrame(betVariable, view);
    view.bets=bets;
 
    var frame = Object.create(View);
    view.drawFrame=function(){
	
	frame.setShape(new createjs.Container());
	yCoord=80;
	view.bets.map(function(bet){
	    var postItem = WidgetHL();
	    postItem.yCoord=yCoord;
	    postItem.bet = bet;
	    bet.postItem = postItem;
	    
	    postItem.value = makeTextWidget(bet.title, 16, "Arial", "#666");
	    postItem.betEdge=makeRect(40,betHeight-20,"#A9D0F5", 1, "#A9D0F5", 50);
	    postItem.betEdge.renderW(postItem, {x:40, y:20});
	    postItem.betBackground=makeRect(view.width,betHeight-20,"#A9D0F5", 1, "#A9D0F5");
	    postItem.betBackground.renderW(postItem, {x:50, y:20});
	    postItem.value.renderW(postItem, {x:45, y:22});
	    if (bet.userid)
	    {
		bet.pic=new createjs.Bitmap(THIS_DOMAIN + "/ajax/picture/" + bet.userid + "/12/12");
		bet.pic.x=0;
		bet.pic.y=20;
		bet.pic.scaleX*=0.18;
		bet.pic.scaleY*=0.18;
		postItem.shape.addChild(bet.pic);
	    }

	    postItem.points = makeTextWidget(bet.body, 16, "Arial", "#666");
	    postItem.pointsBackground=makeRect(30,betHeight-20,"#ffffff", 1, "#A9D0F5", 50);
	    postItem.pointsBackground.renderW(postItem, {x:view.width-45, y:20});
	    postItem.points.renderW(postItem, {x:view.width-40, y:22});
	    postItem.author=makeTextWidget(postItem.bet.author, 12, "Arial", "#666");
	    postItem.author.renderW(postItem, {x:65, y:23});
	
	    postItem.yCoord=yCoord;

	    postItem.renderW(frame, {x:10, y:view.height-postItem.yCoord});
	    yCoord += distBetweenYs;

	    
	})

   	view.frame = makeFrameWidget( 
        view.width,160,
	frame, view.height);

	view.frame.render(view.shape, {x:0, y:3});
    }  
    view.drawFrame()


    view.refresh=function(truth){
	$.ajax({
	    type: "GET",
	    url: '/ajax/'+ this.bayesVar.varName.replace(/\s+/g, '') + '/' + truth[truth.length-1].period,
	    async: true,
    
	    dataType: "json",
	    success: function(data){
		//do your stuff with the JSON data;
		user_data=data;
		posts=data.myposts;
		view.frame.erase();
		view.bets=posts;
		view.drawFrame()
		//alert(posts)
	    }})
    }

    var count=0;
    function tick(event) { 
	$.ajax({
	    type: "GET",
	    url: '/ajax/'+ view.bayesVar.varName.replace(/\s+/g, '') + '/' + truth[truth.length-1].period,
	    async: true,
    
	    dataType: "json",
	    success: function(data){
		//do your stuff with the JSON data;
		if (user_data.myposts.length!==data.myposts.length){
		
		    view.refresh(truth);
		//alert(posts)
		}
	    }})
	/*count=(count+1)%60;
	if (count%20===0){
	view.refresh(truth);    		
	}*/
		    
    };
    createjs.Ticker.setFPS(1);
    createjs.Ticker.on("tick", tick);


    view.betBack = makeRect(view.width, 27, "#ffffff", borderWidth, 1, 0);
    view.betBack.render(view.shape, {x:0, y:162});
    view.enterValue = makeTextWidget("Door:", 12, "Arial", "#666");
    view.enterValue.render(view.shape, {x:0, y:170})
    view.enterPoints = makeTextWidget("Points:", 12, "Arial", "#666");
    view.enterPoints.render(view.shape, {x:80, y:170})

    view.pointMenu = makeScrollMenu(["10", "20", "30", "40", "50", "60", "70", "80", "90"], 40, 15, "white","0", 12)
    

    view.bettingMenu = makeScrollMenu(["A", "B", "C"], 40, 15, "white","Value", 12)
    view.pointMenu.render(view.shape, {x:120, y:170})
    
    view.bettingMenu.render(view.shape, {x:35, y:170})
    view.barButton.render(view.shape, {x:-borderWidth, y:-22});

    view.betButton = makeBetButton2(view);
    view.betButton.render(view.shape, {x:view.width-75, y:170})
    
    
return view
    
}

function showTestDataWindow(){
    dataWindow=makeDataWindow(truth, ['A', 'B', 'C'], variables[2]);
    dataWindow.render(stage, {x:600, y:stageHeight-290});
}
