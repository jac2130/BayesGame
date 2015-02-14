var THIS_DOMAIN="http://bettingisbelieving.com"
function makeLoginScreen()
{
    logInScreen   = WidgetHL();
    logInScreen.cover=makeRect(stageWidth, stageHeight, "#ffffff");
    logInScreen.cover.render(logInScreen.shape, Point(0, 0));
    logInScreen.background=makeRect(stageWidth, stageHeight, "rgba(0, 0, 0, 0.75)");
    logInScreen.background.render(logInScreen.shape, Point(0, 0));
    logInScreen.title=makeTextWidget("Betting is Believing", 45, "Arial", "#FFFFFF");

    logInScreen.title.renderW(logInScreen, Point((stageWidth-logInScreen.title.width)/2, 100));

    logInScreen.pic=new createjs.Bitmap(THIS_DOMAIN + "/LoginWithFacebook.png");
    logInScreen.pic.x = (stageWidth-318)/2;
    logInScreen.pic.y = 200;
    logInScreen.pic.scaleX *= 0.9;
    logInScreen.pic.scaleY *= 0.9;
    logInScreen.shape.addChild(logInScreen.pic);    
    logInScreen.message1 = makeTextWidget("No worries; nothing will be posted on your facebook profile without your permission", 15, "Arial", "#FFFFFF");
    logInScreen.message1.renderW(logInScreen, Point((stageWidth-logInScreen.message1.width)/2, 300));
    logInScreen.message2 = makeTextWidget("and your facebook data will be made anonymous and will only be used for scientific purposes.", 15, "Arial", "#FFFFFF");
    logInScreen.message2.renderW(logInScreen, Point((stageWidth-logInScreen.message2.width)/2, 320));

    logInScreen.pic.on("click", function(event) {
        logInScreen.erase()
        facebookLogin();
    });
}

function welcome()
{
    var welcomeScreen = WidgetHL();
    welcomeScreen.tutorialCover = makeRect(400, 200, "#ffffff");
    welcomeScreen.tutorialCover.render(welcomeScreen.shape, Point(260, 0));
    welcomeScreen.background=makeRect(stageWidth, stageHeight, "rgba(0, 0, 0, 0.75)");
    welcomeScreen.background.render(welcomeScreen.shape, Point(0, 0));
    welcomeScreen.pic = new createjs.Bitmap(THIS_DOMAIN + "/ajax/picture/" + user.id + "/180/180");
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
            user.points = 1000;
            user.shares = 10;
            scoreWindow = WidgetHL();
            scoreWindow.background = makeRect(91, 20, "#3b5998", 0, 1, 3);
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
            
            pointWindow = WidgetHL();
            pointWindow.background = makeRect(358,30,"#3b5998", 0, 1, 3);
            pointWindow.background.renderW(pointWindow, Point(0, 0));
            pointWindow.points = makeTextWidget(user.points +"      points", 15, "Verdana", "#ffffff");
            pointWindow.shares = makeTextWidget(user.shares +"      shares", 15, "Verdana", "#ffffff");
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
    welcomeScreen.message=makeTextWidget("Welcome, " + user.first_name + "!", 35, "Arial", "#FFFFFF");
    welcomeScreen.forwardMessage=makeTextWidget("To navigate through the tutorial please click this navigation button!", 20, "Arial", "#FFFFFF");
    welcomeScreen.message.renderW(welcomeScreen, Point(280, 110));
    welcomeScreen.forwardMessage.renderW(welcomeScreen, Point(280, 180));
    welcomeScreen.arrow = makeArrow2(170, 43);
    welcomeScreen.arrow.render(welcomeScreen.shape, Point(700, 175));
    welcomeScreen.render(topLayer.shape, Point(0, 0));
}//end of welcome function. 

