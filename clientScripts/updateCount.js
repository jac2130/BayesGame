updateCount = function(dataView)
{
    //updateQueryPrediction();
    checkFreePeriod();
    var currPeriod = getCurrTimePeriod();

    $.ajax({
        type: "GET",
        url: '/js/newData/' + treatmentNum + "/" + currPeriod,
        dataType: "json",
        async: true, //options.sync,
        success: function(data)
        {
            var timeUntilNextData = 120;
            if (obtainedTruth && data['dataAvail'])
            {
                addDataToDataWindow(data['newData']);
                timeUntilNextData = 120;
            }
            else
            {
                timeUntilNextData = data['timeUntilNextData'];
            }
            var minLeft = Math.floor(timeUntilNextData/60);
            var secLeft = timeUntilNextData % 60;

            countDown.text.changeText("New data in " + timeUntilNextData + " seconds");
        }
    });
}

function checkFreePeriod()
{
    $.ajax({
        type: "GET",
        url: '/js/isFreePeriod',
        dataType: "json",
        async: true, //options.sync,
        success: function(data) {
            var isFreePeriod = data['free_period'];
            if (isFreePeriod)
            {
                if (betButton.isRendered()) {
                    betButton.erase();
                }
                if (betsWindow.isRendered()) {
                    betsWindow.erase();
                }
                if (putButton.isRendered()) {
                    putButton.erase();
                }
                if (putsWindow.isRendered()) {
                    putsWindow.erase();
                }
            } else if (prevIsFreePeriod) {
                betButton.render(stage, {x:betsWindow.xPos, y:75});
                betButton.callback.call()
                putButton.render(stage, {x:putsWindow.xPos, y:75});
                putButton.callback.call()
            }
            prevIsFreePeriod = isFreePeriod;
        }
    });
}

// newDataSets[0] is confirmation of the previous data with the value of
//      the betting variable revealed
// newDataSets[1] is new data for the current time period
function addDataToDataWindow(newDataSets)
{
    var newTruth1 = newDataSets[0];
    var newTruth2 = newDataSets[1];
    newTruth1.yCoord = truth[truth.length-1].yCoord;
    newTruth2.yCoord = truth[truth.length-1].yCoord + 40;
    truth = truth.slice(0, truth.length-1).concat([newTruth1, newTruth2]);
    dataWindow.data = dataWindow.data.slice(0, dataWindow.data.length-1).concat(newDataSets);

    dataWindow.frame.erase();
    dataWindow.frameHeight += 40;
    dataWindow.drawInnerFrame();

    dataWindow.frame = makeFrameWidgetWide( 
        dataWindow.height-80, dataWindow.width,
        dataWindow.innerFrame, dataWindow.frameHeight);

    dataWindow.frame.render(dataWindow.shape, {x:0, y:0});

    var totalWinnings = 0;
    var bettingVar = modelClass['betting_variable'];
    if (truth[truth.length-2][bettingVar] !== share_val)
    {
        updateScoreTag(true);
    }
    else
    {
        updateScoreTag(false);
    }
    setShareVal();
}

function initializeModel(GraphJson)
{
    model = {};
    model.id = user.id;
    model[user.id] = GraphJson;
    storedModel = "";

    // make a copy of the model
    // When model is updated, storedModel also updated
    // but storedModel may be briefly different from model
    
    sendModelIfUpdated();
}

function sendModelIfUpdated()
{
    if (JSON.stringify(storedModel) !== JSON.stringify(model))
    {
        storedModel = JSON.parse(JSON.stringify(model));
        $.ajax({
            type: "post",
            url: '/js/model',
            async: true,
            data:JSON.stringify(model),
            dataType: "json",
            contentType: "application/json",
            success: function(){}
        });
    }
}

function updateScoreTag(sharesEarnedWinnings)
{
    if (prevIsFreePeriod || !scoreTagDrawn) { return; }
    var newWinnings;
    if (sharesEarnedWinnings)
    {
        newWinnings= (user.points + user.shares*100);
    }
    else
    {
        newWinnings = user.points;
    }
    user.score += newWinnings; 
    warn('Each of your ' + user.shares + ' shares earned 100 points\n\nYour remaining points were ' + user.points + '\n\n' + "This round's winnings are: " + user.shares + " x 100 + " + user.points + " = " + newWinnings);

    scoreTag.score.changeText(JSON.stringify(user.score));
    var scoreLength = JSON.stringify(scoreTag.score.shape.text).length*4;
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

function startCountDownText(view)
{

    var num = 2
    countDown = WidgetHL();
    countDown.text = makeTextWidget("New data in "+ num + " minutes", 12, "Arial", "#666");
    countDown.background = makeRect(countDown.text.width + 10, 20, '#FFFFFF'/*'#EBEEF4'*/);
    countDown.background.renderW(countDown, Point(0, 0));
    countDown.text.renderW(countDown, Point(5, 5));
    countDown.renderW(view, Point((view.width - countDown.text.width)/2, view.height-90));
}

function setShareVal()
{
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
}
