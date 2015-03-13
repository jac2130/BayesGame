function displayScoreAndPointWindow()
{
    user.score = 0; 
    user.points = 150;
    user.shares = 10;
    scoreWindow = WidgetHL();
    scoreWindow.background = makeRect(91,20,'#FFFFFF'/*"#3b5998"*/, 0, 1, 3);
    scoreWindow.background.renderW(scoreWindow, Point(0, 0));
    scoreWindow.title = makeTextWidget(" Total Score " , 12, "Arial", "#666");
    scoreWindow.title.renderW(scoreWindow, Point(14, 3));

    scoreWindow.renderW(topLayer, Point(stageWidth*0.0040, stageHeight*0.875));
    scoreTagDrawn = true;
    scoreTag = WidgetHL();
    scoreTag.shape = new createjs.Shape();
    scoreTag.score = makeTextWidget(user.score, 12, "Arial", "#666");
    var scoreLength = JSON.stringify(scoreTag.score.shape.text).length*7
    var globalScoreTag = scoreTag.shape.graphics.beginFill("white");

    globalScoreTag.beginStroke("black").setStrokeStyle(0.5);

    globalScoreTag.moveTo(10, 8).lineTo(10, 14);
    globalScoreTag.lineTo(6, 17)
    globalScoreTag.lineTo(10, 20)
    globalScoreTag.lineTo(10, 26)
    globalScoreTag.lineTo(10 + scoreLength + 16, 26)
    globalScoreTag.lineTo(10 + scoreLength + 16, 8).closePath();

    globalScoreTag.endStroke("black");
    globalScoreTag.endFill();

    // scoreTag.addChild(scoreTag.score, Point(5, 5))

    scoreTag.render(stage, Point(scoreWindow.shape.x+88, scoreWindow.shape.y - 7))
    scoreTag.score.render(stage, Point(scoreWindow.shape.x+106, scoreWindow.shape.y + 3))

    var pointWindow = WidgetHL();
    pointWindow.background=makeRect(358,30,/*"#3b5998"*/'#FFFFFF', 0, 1, 3);
    pointWindow.background.renderW(pointWindow, Point(0, 0));
    pointWindow.points=makeTextWidget(user.points +"      points", 15, "Arial", "#666");
    pointWindow.shares=makeTextWidget(user.shares +"      shares", 15, "Arial", "#666");
    pointWindow.points.renderW(pointWindow, Point(5, 5));
    pointWindow.shares.renderW(pointWindow, Point(150, 5));
    pointWindow.renderW(topLayer, Point(stageWidth-368, 10));
    var pointWindowUpdatePrevTime = getTime();
    pointWindow.refresh = function()
    {
        var newTime = getTime() 
        if (newTime > pointWindowUpdatePrevTime + 500)
        {
            pointWindowUpdatePrevTime = newTime;
            $.ajax({
                type: "GET",
                url: '/js/pointsRefresh',
                async: true,
            
                dataType: "json",
                success: function(data) {
                    user.points = parseInt(data['points']);
                    user.shares = parseInt(data['shares']);
                    //alert(user.points);
                    //alert(user.shares);
		    //alert(parseInt(data['points']));
                    pointWindow.points.changeText(user.points +"      points");
                    pointWindow.shares.changeText(user.shares +"      shares");
                    //do your stuff with the JSON data;
                }
            });
        }
    }
    pointWindow.refresh();
    return pointWindow;
}

function updatePointWindow()
{
    pointWindow.refresh();
}
