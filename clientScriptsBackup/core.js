function welcome()
{
    var welcomeScreen = WidgetHL();
    welcomeScreen.tutorialCover = makeRect(400, 200, "#ffffff");
    welcomeScreen.tutorialCover.render(welcomeScreen.shape, Point(260, 0));
    welcomeScreen.background=makeRect(stageWidth, stageHeight, "rgba(0, 0, 0, 0.75)");
    welcomeScreen.background.render(welcomeScreen.shape, Point(0, 0));
    welcomeScreen.pic=new createjs.Bitmap(THIS_DOMAIN + "/ajax/picture/" + user.id + "/180/180");
    welcomeScreen.pic.x=150;
    welcomeScreen.pic.y=100;
    welcomeScreen.pic.scaleX*=0.54;
    welcomeScreen.pic.scaleY*=0.54;
    welcomeScreen.shape.addChild(welcomeScreen.pic);
    welcomeScreen.nextButton = makeButton(">", 50, 50);
    var callback = {
        "welcomeScreen": welcomeScreen,
        "call": function() {
            this.welcomeScreen.erase();
	    user.score=0; 
            user.points=150;
            user.shares=10;
	    scoreWindow=WidgetHL();
            scoreWindow.background=makeRect(91,20,"#3b5998", 0, 1, 3);
            scoreWindow.background.renderW(scoreWindow, Point(0, 0));
            scoreWindow.title=makeTextWidget(" Total Score " , 12, "lucida grande", "#ffffff");
            scoreWindow.title.renderW(scoreWindow, Point(14, 3));
            
	    
	    //alert(scoreLength)
            scoreWindow.renderW(topLayer, Point(stageWidth*0.0040, stageHeight*0.875));
	    var scoreTag = WidgetHL();
	    scoreTag.shape = new createjs.Shape();
	    scoreTag.score=makeTextWidget(user.score , 12, "lucida grande", "#666");
	    var scoreLength = JSON.stringify(scoreTag.score.shape.text).length*7
	    var g = scoreTag.shape.graphics.beginFill("white");
	    
            g.beginStroke("#666").setStrokeStyle(1);
    
	    g.moveTo(10, 8).lineTo(10, 14);
	    g.lineTo(6, 17)
	    g.lineTo(10, 20)
	    g.lineTo(10, 26)
	    g.lineTo(10 + scoreLength + 16, 26)
	    g.lineTo(10 + scoreLength + 16, 8).closePath();
    
            g.endStroke("#666");
    
	    g.endFill();
	    //scoreTag.addChild(scoreTag.score, Point(5, 5))
	    
	    scoreTag.renderW(topLayer, Point(scoreWindow.shape.x+88, scoreWindow.shape.y - 7))
            scoreTag.score.renderW(topLayer, Point(scoreWindow.shape.x+106, scoreWindow.shape.y + 3))
	    
	    pointWindow=WidgetHL();
            pointWindow.background=makeRect(358,30,"#3b5998", 0, 1, 3);
            pointWindow.background.renderW(pointWindow, Point(0, 0));
            pointWindow.points=makeTextWidget(user.points +"      points", 15, "Verdana", "#ffffff");
            pointWindow.shares=makeTextWidget(user.shares +"      shares", 15, "Verdana", "#ffffff");
            pointWindow.points.renderW(pointWindow, Point(5, 5));
            pointWindow.shares.renderW(pointWindow, Point(150, 5));
            pointWindow.renderW(topLayer, Point(stageWidth-368, 10));
            var pointWindowUpdatePrevTime = getTime();
            pointWindow.refresh = function() {
                var newTime = getTime() 
                if (newTime > pointWindowUpdatePrevTime + 500)
                {
                    pointWindowUpdatePrevTime = newTime;
                    $.ajax({
                        type: "GET",
                        url: '/ajax/pointsRefresh/' + user.id,
                        async: true,
                    
                        dataType: "json",
                        success: function(data) {
                            user.points = parseInt(data['points']);
                            user.shares = parseInt(data['shares']);
                            //alert(user.points);
                            //alert(user.shares);
                            pointWindow.points.shape.text = user.points +"      points";
                            pointWindow.shares.shape.text = user.shares +"      shares";
                            //do your stuff with the JSON data;
                        }
                    });
                }
            }
            createjs.Ticker.addEventListener("tick", pointWindow.refresh);

        }
    }
    makeClickable(welcomeScreen.nextButton, callback);
    welcomeScreen.nextButton.render(welcomeScreen.shape, {x: 810, y: 10});
    welcomeScreen.message=makeTextWidget("Welcome, " +user.first_name + "!", 35, "Arial", "#FFFFFF");
    welcomeScreen.forwardMessage=makeTextWidget("To navigate through the tutorial please click this navigation button!", 20, "Arial", "#FFFFFF");
    welcomeScreen.message.renderW(welcomeScreen, Point(280, 110));
    welcomeScreen.forwardMessage.renderW(welcomeScreen, Point(280, 180));
    welcomeScreen.arrow = makeArrow2(170, 43);
    welcomeScreen.arrow.render(welcomeScreen.shape, Point(700, 175));
    welcomeScreen.render(topLayer.shape, Point(0, 0));
}//end of welcome function. 

truth=[]; 
user={}; //should be global variables. 
//alert(JSON.stringify(GraphJson))
friendCache = {};
Login = function() 
//window.fbAsyncInit = function() 
{ 
    FB.init(
	{
	    appId      : '753236104711327',
	    frictionlessRequests: true,
	    status     : true,
	    cookie     : true,
	    xfbml      : true
	}
    );
    
    FB.login(function(response) 
	     {
		 if (response.authResponse) 
		 {
		     uid =response.authResponse.userDI
		     FB.api('/me', function(response) 
			    {
				user=response;   
				model={};
				model.id=user.id
				model[user.id]= GraphJson;
				getMe(180, 180);
				welcome();
			 

				//alert(JSON.stringify(model))
				//the "model" variable 
				//represents the initial (default) model of the user, 
				//which the user modifies in the course of the game.
				//Each time that the user's model is modified, 
				//the model is sent back to the server, where it is 
				//tagged with a time stamp and inserted into a mongodb 
				//data base.  
				//Out of this database, a seperate program then
				//pulls
				//the most recent model for each of k people 
				//in a k-group. These are k people who have 
				//been assigned by some treatment mechanism,
				//to see each other's bets and to 
				//thus--by my definition of k-group--belong 
				//to such.
				//Further, this program then, calculates the
				//diversity of time t (as defined in the above,  
				//overlapping generations data model). 
				//The diversity is then calculated
				//and posted as the next data point in a time series
				//on the analysis website: 
				//http://bettingisbelieving.com/analysis.
				//On this same website,
				//a distance matrix between all k models is also
				//posted, with 
				//the modeler's facebook fotos as column and 
				//row names. The latter, serves as a  
				//further treatment, which can be 
				//turned on and off for a group. 
				//If they have access to the analysis website 
				//of their group
				//participants and all others
				//can then click through time to see 
				//the evolution of distance matrices, along with the
				//overall diversity measure for the group. 
				//Performance measures
				//will also be added (as soon as I have the 
				//algorithms worked out).
				//send first the user:
				$.ajax({
				    type: "post",
				    url: '/ajax/login',
				    async: true,
				    data:JSON.stringify(user),
				    dataType: "json",
				    contentType: "application/json",
				    success: function(user){alert(user.name)} 
    
				});
				//then his model:
				$.ajax({
				    type: "post",
				    url: '/ajax/model',
				    async: true,
				    data:JSON.stringify(model),
				    dataType: "json",
				    contentType: "application/json",
				    success: function(user){alert(user.name)} 
    
				});

				$.ajax({
				    type: "post",
				    url: '/ajax/new_user_points/' + user.id,
				    async: true,
				    //data:JSON.stringify({}),
				    dataType: "json",
				    contentType: "application/json",
				    success: function(user){alert(user.name)} 
    
				});
			 
				$.ajax({
				    type: "GET",
				    url: '/ajax/truth',
				    async: true,
				    
				    dataType: "json",
				    success: function(data){
					if (data) 
					{
					    truth = truth.concat(data);
                        if (truth[truth.length-1]['monty_door']==='A')
                        {
                            share_door='B';
                        }
                        else
                        {
                            share_door='A';
                        }
					    var dataWindow = makeDataWindow(truth, ['A', 'B', 'C'], variables, stageWidth-250);

					    var dataButton = makeContractedButton(dataWindow);
					    dataButton.render(stage, {x:dataWindow.xPos, y:stageHeight-25})
					    var betsWindow = makeCallWindow([], ['A', 'B', 'C'], variables[variables.length-1], stageWidth-500);

					    //the last variable must always be the betting variable!
                        //MARK1
					    var betButton=makeContractedButton(betsWindow);
					    betButton.render(stage, {x:betsWindow.xPos, y:stageHeight-25});
					    
					    var putsWindow = makePutWindow([], ['A', 'B', 'C'], variables[variables.length-1], stageWidth-750);

					    //the last variable must always be the betting variable!
					    var putButton = makeContractedButton(putsWindow);
					    putButton.render(stage, {x:putsWindow.xPos, y:stageHeight-25});
					    

					} 
					else
					{
					    alert("the truth is missing!");
					}
					
				    }
				    
				});
				

			    });
		     //alert(user.first_name);
		     
		 }
		 else 
		 {
		     console.log('User cancelled login or did not fully authorize.');
		 }
	     }, 
	     {scope: 'user_birthday, friends_birthday, public_profile,user_friends, user_about_me, friends_about_me, user_education_history, friends_education_history, user_hometown, friends_hometown, user_interests, friends_interests, user_location, friends_location, user_questions, friends_questions, user_relationships, friends_relationships, user_relationship_details, friends_relationship_details, user_religion_politics, friends_religion_politics, user_work_history, friends_work_history'});
}; 
(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/all.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
     


function getMe(width, height) 
{
    FB.api('/me', 
	{fields: 'id,name, picture.width(' + width + ').height(' + height + ')'}, 
	function(response)
	{
	    if( !response.error ) 
	    {
		
		//friendCache.me = response;
		//photo_url = friendCache.me.picture.data.url
		$.ajax({
		    type: "post",
		    url: '/ajax/picture',
		    async: true,
		    data:JSON.stringify({'id':response.id, 'url':response.picture.data.url, 'width':width, 'height':height}),
		    dataType: "json",
		    contentType: "application/json",
		    success: function(){} 
    
		});
		
	    } 
	    else 
	    {
            console.error('/me', response);
	    }
	});
}


