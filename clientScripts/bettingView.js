var THIS_DOMAIN="http://bettingisbelieving.com"
var View = Object.create(Widget);

function makeView(graphWidth, graphHeight, bayesVar)
{
    var borderWidth = 1;
    var view = Object.create(View);
    view.width=graphWidth;
    view.height=graphHeight;
    view.setShape(new createjs.Container());
    view.background = makeRect(graphWidth, graphHeight, "#EBEEF4", borderWidth);
    view.background.render(view.shape, {x:0, y:0});
    view.bayesVar=bayesVar;
    return view
}

function makeQueryButton(view, size)
{
    if (typeof size === 'undefined') 
    {
        size = 35;
    }
    var queryButton = makeButton("+", size, size);
    var callback = {
        "view": view,
        "call": function() {
            //tutorial.trigger("caseAdded");
            this.view.query();
        }
    };
    makeClickable(queryButton, callback);
    return queryButton;
}

function makeQueryView(width, height, bayesVar)
{
    var varModelNames=[];
    var varNames=[];
    for (val in model[model.id]){
	if (val!=="user" && val!=="userId"){
	    varModelNames.push(val);
	    varNames.push(capitaliseFirstLetter(val.replace("_", " ")));
	}
    }
    //alert(JSON.stringify(varNames))
    var borderWidth = 1;
    var queryView = Object.create(View);
    queryView.hasHist=false;
    queryView.width=width;
    queryView.height=height;
    queryView.setShape(new createjs.Container());
    queryView.background = makeRect(width, height, "#EBEEF4", borderWidth);
    queryView.background.render(queryView.shape, {x:0, y:55});
    queryView.bar=makeRect(width + 2*borderWidth, 55, "#3b5998"/*"#3B4DD0"*/, 0, 1, 3);
    queryView.bar.render(queryView.shape, {x:0, y:0});
    queryView.bayesVar=bayesVar;
    //var queryView = makeView(width, height, bayesVar)
    
    var modelSwitch = makeModelViewButton(bayesVar);
    modelSwitch.render(queryView.shape, {x:0, y:-35});
    var querySwitch = makeTextWidget("QUERY", 30, "Arial", "#ffffff");
    querySwitch.render(queryView.shape, {x:130, y:-32});
    queryView.name="QUERY"

    queryView.varnames=varNames;
    nextVarXcoord=20;
    nameLengths=[]
    menues=[] //make the menues part of the histograms. 
    //this is important to keep the conditions attached to the conditional
    //distributions, which are the histograms.
    
    queryView.varnames.map( function(item) {nameLengths.push(makeTextWidget(item,22, "Arial", "#666"  ).width)})
    //var NameWidth=Math.max.apply(null, nameLengths)+30;
    for (var i=0; i< varNames.length;i++) 
    {
	if (typeof(varNames[i])==="string" && varNames[i]!==bayesVar.varName)
	{
	    var varname=makeTextWidget(queryView.varnames[i], 28, "Arial", "white" )
	    var NameWidth=varname.width;
		//makDropDownMenu(switcher.varnames, NameWidth, 32, "white", switcher.varnames[i]);
	    varname.x=nextVarXcoord
	    varname.activeChoice=varname.shape.text;
	    menues.push(varname)
	    //makeTextWidget(switcher.varnames[i],22, "Arial", "black" )
	    varname.renderW(queryView, {x:varname.x, y:10})

	    var equalSign=makeTextWidget("=", 28, "Arial", "white" )
		//makeDropDownMenu(["=", "!="], 32, 32, "white")
	    equalSign.x= nextVarXcoord+NameWidth+10
	    equalSign.activeChoice=equalSign.shape.text;
	    menues.push(equalSign)
	    equalSign.renderW(queryView,{x:equalSign.x, y:10});
	    
	    var domain=makeDropDownMenu(["A", "B", "C"], 80, 32, "#8b9dc3", "Value");
	    domain.x= nextVarXcoord+NameWidth+50
	    menues.push(domain)
	    domain.renderW(queryView,{x:domain.x, y:10});
 
	    nextVarXcoord+=(150+NameWidth);
	}
    }
    queryView.menues=menues;
    
    
    queryView.query = function()
    {
        var queryPath="";
        var conditions={'bayesVar':queryView.bayesVar.varName.toLowerCase().replace(/\s+/g, '_')}
        conditions[queryView.bayesVar.varName.toLowerCase().replace(/\s+/g, '_')]={};

        for (var i=0; i<queryView.menues.length; i++)
        {
            //conds.push(switcher.menues[i].activeChoice)
            
            
            if ((i+3)%3===0) 
            {
                if (queryView.menues[i+2].activeChoice!=="Value"){//in the case that it has been specified
                    queryPath+="/" + queryView.menues[i].activeChoice.toLowerCase().replace(/\s+/g, '_') + ":"+ queryView.menues[i+2].activeChoice;
                    conditions[queryView.bayesVar.varName.toLowerCase().replace(/\s+/g, '_')][queryView.menues[i].activeChoice.toLowerCase().replace(/\s+/g, '_')]= queryView.menues[i+2].activeChoice;
                } else {
                    warn("Some values have still not been selected");
                    return;
                }
            }
        }
        

        //alert(queryPath);
        index=varNames.indexOf(queryView.bayesVar.varName);
        $.ajax({
            type: "GET",
            url: '/ajax/query/'+ user.id + queryPath,
            async: true,
        
            dataType: "json",
            success: function(data)
            {
                if (typeof data === 'string')
                { 
                    //alert(JSON.stringify(data))
                    warn(data);
                }
                else
                {
                    //alert(JSON.stringify(data[varModelNames[index]]))//do your stuff with the JSON data;
                    queryView.menues.map(function(item){item.erase()})
                    var queryHist = makeQueryHist(data[varModelNames[index]], queryView.width, queryView.height, queryView.bayesVar.color, conditions)
                    if (queryView.hasHist)
                    {
                        queryView.queryHist.erase()
                    }
                    queryView.queryHist=queryHist;
                    queryView.hasHist=true;
                    queryView.queryHist.render(queryView.shape, Point(0, 55));
                    queryView.menues.map(function(item){item.renderW(queryView,{x:item.x, y:10});})
                }
            }
        });

    }
    
    queryView.queryButton = makeQueryButton(queryView)
    queryView.queryButton.renderW(queryView,{x:nextVarXcoord, y:10});

    return queryView
}


function makeDataView(width, height, bayesVar)
{
    var dataView=makeView(width, height, bayesVar)
    var y_pos=32;
    var valCount={}
    Yish=32;
    bayesVar.possibilities.map(function(pos){
	valCount[pos]=0;	
});

    truth.map(function(dat) {
	var value=dat[bayesVar.varName.toLowerCase().replace(/\s+/g, '_')]
	valCount[value]+=1;
	makeTextWidget(value, 40, "Arial", "#666").render(dataView.shape, {x:1350, y:y_pos});
	
			     y_pos+=50;
    })
    bayesVar.possibilities.map(function(pos){
	
	for (var i=0; i<valCount[pos];i++) {
	    bar=makeRect(98,50, bayesVar.color);
	    bar.render(dataView.shape, {x:50 + i*100, y:Yish});
	}
	makeTextWidget(pos, 50, "Arial", "#555").render(dataView.shape, {x:10, y:Yish});

	makeTextWidget(valCount[pos], 50, "Arial", "#666").render(dataView.shape, {x:80+valCount[pos]*100, y:Yish});
	Yish+=60;
	
    });

    

    var dataSwitch = makeTextWidget("DATA", 30, "Arial", "#ffffff");
    dataSwitch.render(dataView.shape, {x:0, y:-32});

    var modelSwitch = makeModelViewButton(bayesVar);
    modelSwitch.render(dataView.shape, {x:100, y:-35});
    
    var bettingSwitch=makeBetViewButton(bayesVar);
    bettingSwitch.render(dataView.shape, {x:230, y:-35});
    dataView.name="DATA"
    return dataView
}


function makeModelView(width, height, bayesVar)
{
    var modelView = WidgetHL();
    
    bayesVar.probSetter.render(modelView.shape, {x:0, y:0});
    bayesVar.probSetter.modelView = modelView;
    var querySwitch = makeQueryViewButton(bayesVar);
    querySwitch.render(modelView.shape, {x:130, y:-35});

    var modelSwitch = makeTextWidget("MODEL", 30, "Arial", "#ffffff");
    modelSwitch.render(modelView.shape, {x:0, y:-32});
    
    //var bettingSwitch=makeBetViewButton(bayesVar);
    //bettingSwitch.render(modelView.shape, {x:230, y:-35});
    modelView.name="MODEL"

    return modelView;
}

function makeCounterButton(menu, post, betView)
{
    var counterButton = makeButton("Go!", 58, 25);
    var callback = {
        "bet": menu,
	"post": post,
	'betView':betView,
        "call": function() {
            var theBet=this.bet.activeChoice;
	    //alert(theBet)
	    var permalink=this.post.permalink;
	    var id=this.post['id'];
	    var betView=this.betView;
	    var bayesVar=betView.bayesVar;
	    getMe(5, 5);//getting facebook profile picture.
	    if (bayesVar.possibilities.indexOf(theBet)>=0) //if the bet is in ['A','B'...
		//in python this would be 'if theBet in ["A", "B", "C"]:'
	    {
		
		$.ajax({
		    type: "post",
		    url: '/ajax/newcomment',
		    async: true,
		    data:JSON.stringify({"variable": bayesVar.varName.replace(/\s+/g, ''), 
"commentName":user.name, "commentId":user.id, "commentEmail":"","commentBody": theBet, "permalink":permalink, "id":id}),
		    dataType: "json",
		    contentType: "application/json",
		    success: function(user){alert(user.name)} 
    
		});

		//delete betting view and recreate new one
		var width=betView.width;
		var height=betView.height;
		var bayesVar=betView.bayesVar;
		var betView=makeBettingView(width, height, bayesVar);
		makeActiveView(betView, bayesVar)

		//betView.shape.scaleX = 0.5;
		//betView.shape.scaleY = 0.5;
		//var blackFade = makeBlackFade(betView);
		//blackFade.currentOne=bayesVar;
		//blackFade.render(stage, {x:0, y:0});
		//make active view for bayesVar
		//bayesVar.activeView=betView;
		//bayesVar.hasActiveView=true;
	    }
	    else {alert("you must first choose a value for your counter bet!")}
        }
    };
    makeClickable(counterButton, callback);
    return counterButton;
}


function makeBetButton(betView)
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
	    if (bayesVar.possibilities.indexOf(theBet)>=0 && points in range(91))
	    { 
		$.ajax({
		    type: "post",
		    url: '/ajax/newpost',
		    async: true,
		    data:JSON.stringify({"variable":bayesVar.varName.replace(/\s+/g, ''), 
"username":user.name, "userid":user.id, "subject":theBet, 'body':points, 'comments':[], 'period': this.truth[this.truth.length-1].period}),
		    dataType: "json",
		    contentType: "application/json",
		    success: function(user){alert(user.name)} 
    
		});

		//delete betting view and create new one.
		var width=betView.width;
		var height=betView.height;
		var bayesVar=betView.bayesVar;
		var betView=makeBettingView(width, height, bayesVar);
		makeActiveView(betView, bayesVar)
		
	    }
	    else {
            alert("you must first choose a value for your bet and you must decide how many points you want to bet!")
        }
        }
    };
    makeClickable(betButton, callback);
    return betButton;
}

function makeBlackFade(view) 
{
    var blackFade = WidgetHL();
    blackFade.top = makeRect(stageWidth, 80, "rgba(0, 0, 0, 0.75)");
    blackFade.top.render(blackFade.shape, {x:0, y:0});
    blackFade.background = makeRect(stageWidth, stageHeight, "rgba(0, 0, 0, 0.75)");
    blackFade.background.render(blackFade.shape, {x:0, y:80}); //rendering should happen after makeBlackFade is called 
    view.renderW(blackFade, {x:200, y:100});

    blackFade.background.shape.on("dblclick", function (evt)
	{
	    //this.currentOne must be a bayesVar with an activeView, 
	    //which is attached to the blackFade (this).
	    //blackFade.currentOne.activeView.erase()
	    blackFade.currentOne.hasActiveView = false;  
	    blackFade.erase()
	});
    return blackFade;
}


function makeBettingView(graphWidth, graphHeight, bayesVar)
{
    
    var betView = makeView(graphWidth, graphHeight, bayesVar);

    var nextYPosition = 120;

    var dataSwitch = makeDataViewButton(bayesVar);
    dataSwitch.render(betView.shape, {x:0, y:-35});

    var modelSwitch = makeModelViewButton(bayesVar)
    modelSwitch.render(betView.shape, {x:100, y:-35});
    
    var bettingSwitch=makeTextWidget("BETS", 30, "Arial", "#ffffff");
    bettingSwitch.render(betView.shape, {x:230, y:-32});

    betView.bigButton = makeRect(graphWidth/5, graphWidth/5,"#3B4DD0", 4, "#460595",50);

    betView.bigButton.render(betView.shape, {x:nextYPosition, y:nextYPosition});

    betView.enterBet = makeTextWidget("Enter Your Bet:", 26, "Arial", "#ffffff");
    betView.enterBet.render(betView.shape, {x:nextYPosition+30, y:nextYPosition+10})

    betView.enterPoints = makeTextWidget("How Many Points?:", 26, "Arial", "#ffffff");
    betView.enterPoints.render(betView.shape, {x:nextYPosition+30, y:nextYPosition+125})

    betView.pointMenu = makeDropDownMenu(["10", "20", "30", "40", "50", "60", "70", "80", "90"], 210, 45, "white","Select Value")
    

    betView.bettingMenu = makeDropDownMenu(["A", "B", "C"], 210, 45, "white","Select Value")
    

    betView.betButton = makeBetButton(betView)
    betView.betButton.render(betView.shape, {x:nextYPosition+37, y:nextYPosition+245})
    
    betView.pointMenu.render(betView.shape, {x:nextYPosition+30, y:nextYPosition+175})
    betView.bettingMenu.render(betView.shape, {x:nextYPosition+30, y:nextYPosition+65})

    var betWidth = 320;
    var betHeight=90
    var counterHeight=5;
    var betSpacing = 60;
    var distBetweenYs = betHeight + betSpacing;
    var distBetweenCounts= counterHeight + betSpacing;
    betView.Posts=[];
    betView.WidgetList=[]
    betView.addPost = function(post)
    {
        var postItem = WidgetHL();
	postItem.post = post;
        post.postItem = postItem;
	this.Posts.push(post)
	post.betView=this;

        postItem.postButton = makeRect(betWidth,betHeight,"#3B4DD0", 4, "#460595", 50);
        postItem.postButton.renderW(postItem, {x:280, y:20});
	
	

	postItem.text = makeTextWidget("Enter counter bet:", 26, "Arial", "#ffffff");
	postItem.text.renderW(postItem, {x:310, y:20});

        postItem.bet = makeTextWidget(post.title, 46, "Arial", "#ffffff");
	postItem.betEdge=makeRect(65,betHeight-20,"#666", 4, "#666", 50);
	postItem.betEdge.renderW(postItem, {x:-220, y:20});
	postItem.betBackground=makeRect(425,betHeight-20,"#666", 4, "#666");
	postItem.betBackground.renderW(postItem, {x:-190, y:20});
	postItem.bet.renderW(postItem, {x:-200, y:30});
	if (post.userid)
	{
	    post.pic=new createjs.Bitmap(THIS_DOMAIN + "/ajax/picture/" + post.userid + "/5/5");
	    post.pic.x=-150;
	    post.pic.y=20;
	    post.pic.scaleX*=0.3;
	    post.pic.scaleY*=0.3;
	    postItem.shape.addChild(post.pic);
	}

	postItem.points = makeTextWidget(post.body, 46, "Arial", "#666");
	postItem.pointsBackground=makeRect(65,betHeight,"#ffffff", 4, "#460595", 50);
	postItem.pointsBackground.renderW(postItem, {x:200, y:20});
	postItem.points.renderW(postItem, {x:205, y:35});
	
	
	postItem.place=nextYPosition;

	comments=""
	counter=0;
	if ("comments" in post)
	{

	    if (post.comments.length>=1)
	    {
		nextYPosition+=betSpacing;
		counter+=post.comments.length;
	    };
	    counter= "Counter Bets: " + String(counter) + "\n\n";
	    postItem.author=makeTextWidget(postItem.post.author, 22, "Arial", "#ffffff");
	    postItem.author.renderW(postItem, {x:-70, y:40});

	    postItem.counter=makeTextWidget(counter, 22, "Arial", "#460595");
	    postItem.counter.renderW(postItem, {x:-50, y:100});

	    for (i in post.comments)
	    {
		if (post.comments[i].body!=undefined)
		{
		    makeRect(660, 60, "#F5F6CE",2, "#F7D358", 50).renderW(postItem, {x:20, y:150 + i*80});
		    makeTextWidget(post.comments[i].body, 22, "Arial", "red").renderW(postItem, {x:30, y:170 + i*80});
		    makeTextWidget(post.comments[i].author, 22, "Arial", "#666").renderW(postItem, {x:130, y:170 + i*80});

		    if (post.comments[i].id)
		    {
			post.comments[i].pic=new createjs.Bitmap(THIS_DOMAIN + "/ajax/picture/" + post.comments[i].id + "/5/5");
			post.comments[i].pic.x=60;
			post.comments[i].pic.y=150 + i*80;
			post.comments[i].pic.scaleX*=0.5;
			post.comments[i].pic.scaleY*=0.5;
			postItem.shape.addChild(post.comments[i].pic);
		    }
		    nextYPosition += distBetweenCounts;
		    
		}
		
	    }
	}
	//postItem.comments=makeTextWidget(comments, 26, "Arial", "green");
	//postItem.comments.renderW(postItem, {x:30, y:130});

	postItem.menu = makeDropDownMenu(["A", "B", "C"], 210, 45, "white","Select Counter Bet")
	postItem.menu.renderW(postItem, {x:310, y:60});

	postItem.counterButton=makeCounterButton(postItem.menu, postItem.post, postItem.post.betView)
	postItem.counterButton.renderW(postItem, {x:530, y:70});

	//postItem.render(this.shape, {x:700, y:postItem.place});
        nextYPosition += distBetweenYs;
	return postItem;
    };

    $.ajax({
    type: "GET",
	url: '/ajax/'+ betView.bayesVar.varName.replace(/\s+/g, '') + '/' + 0,
    async: true,
    
    dataType: "json",
    success: function(data){
	user_data=data//do your stuff with the JSON data;
	posts=user_data.myposts;
	postItems=[]
	for (var i=0; i <posts.length; i++)
{
    postItem = betView.addPost(posts[i])
    postItems.push(postItem)
	  
}
	for (var i=(posts.length-1);i>=0;i--)
{
    postItems[i].render(betView.shape, {x:700, y:postItems[i].place});	    
}
 
	}})

    $.ajax({
	type: "GET",
	url: '/ajax/puts/'+ betView.bayesVar.varName.replace(/\s+/g, '') + '/' + 0,
	async: true,
    
	dataType: "json",
	success: function(data){
	    user_data2=data//do your stuff with the JSON data;
	    puts=user_data2.myputs;

	    
	}})
    
    betView.name="BETS"
    return betView;
}

//var filename='/ajax'+'/hello/' + user.id;

//$.ajax({
//    type: "GET",
//    url: filename,
//    async: true,
    
//    dataType: "json",
//    success: function(data){
//	alert(data.name)//do your stuff with the JSON data
//    }
//});

//$.ajax({
//    type: "post",
//    url: '/ajax/posthere',
//    async: true,
//    data:JSON.stringify(user),
//    dataType: "json",
//    contentType: "application/json",
//    success: function(data){
//        alert(data.name)//do your stuff with the JSON data                      
//    }
//});

