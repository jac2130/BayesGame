function makeBetQueryWindow(variables)
{
    //console.log("variables: " + variables);
    var colors={}
    variables.map(function(variable)
    {
        colors[variable.varName.toLowerCase().replace(" ", "_")] = variable.color;
    });
    //console.log("colors: " + colors);
    var betQueryWindow = Object.create(Widget);
    var borderWidth = 0;
    betQueryWindow.setShape(new createjs.Container());
    betQueryWindow.width = stageWidth-(dataWindow.xPos + dataWindow.width);
    betQueryWindow.height = stageHeight-80;
    betQueryWindow.background = makeRect(betQueryWindow.width, betQueryWindow.height, '#FFFFFF', borderWidth, "white", 5);
    betQueryWindow.background.render(betQueryWindow.shape, {x:0, y:0});
    betQueryWindow.heading = makeTextWidget("Your Predictions", 15, "Arial", "#666");
    betQueryWindow.heading.render(betQueryWindow.shape, {x:0, y:5});
    betQueryWindow.xPos = dataWindow.xPos + dataWindow.width;
    betQueryWindow.dict = {};

    var conditionalVarNames = getConditionalVarNames();
    //console.log("conditionalVarNames: " + conditionalVarNames);

    var condCircles = [];
    var condTags = [];
    var predictions = [];
    var radius = ((betQueryWindow.width-55)/(conditionalVarNames.length)/4);
    var xCoord = 5;

    conditionalVarNames.map(function(name)
    {
        var circ = makeCircle(radius, colors[name], 0, colors[name]);
        circ.xCoord = xCoord;
        circ.varName = name;
        circ.render(betQueryWindow.shape, {x:circ.xCoord, y:betQueryWindow.height-25});
        condCircles.push(circ);

        var condTag = Object.create(Widget);
        condTag.setShape(new createjs.Container());
        condTag.triangle = makeTriangle(radius, radius, 0.5, "black", 90, 
                                                   1, "black");

        condTag.triangle.render(condTag.shape, {x:radius, y:radius});
        condTag.content=makeTextWidget(truth[truth.length-1][name], radius*2, "Arial", "#ffffff");

        condTag.background=makeRect(condTag.content.width+2, radius*2+2, "black");
        condTag.name = name;
        condTag.background.render(condTag.shape, {x:radius, y:0})
        condTag.content.render(condTag.shape, {x:radius+1, y:1});
        condTag.render(betQueryWindow.shape, {x:circ.xCoord+2*radius, y:betQueryWindow.height-25});
        condTags.push(condTag)
        xCoord += 5*radius;
    });
    betQueryWindow.condTags = condTags;

    betQueryWindow.notAvailText = makeTextWidget("", "#666")
    betQueryWindow.notAvailText.render(betQueryWindow.shape, {x:10, y:200});

    betQueryWindow.render(topLayer.shape, {x: betQueryWindow.xPos, y:stageHeight-betQueryWindow.height-23});
    return betQueryWindow
}

function getConditionalVarNames()
{
    var conditionalVarNames = [];
    for (var i=0; i<modelClass['vars'].length; i++)
    {
        if (modelClass['vars'][i] != modelClass['betting_variable'])
        {
            conditionalVarNames.push(modelClass['vars'][i]);
        }
    }
    return conditionalVarNames;
}

function updateQueryPrediction()
{
    var bettingVar = modelClass['betting_variable'];
    if (JSON.stringify(storedModel) !== JSON.stringify(model) | obtainedTruth)
    {
        var queryPath = "";
        var condText = "Pr("+ capitalizeEachWord(bettingVar.replace("_", " ")) + " |";
        var conditionalVarNames = getConditionalVarNames();
        var radius = ((betQueryWindow.width-55)/(conditionalVarNames.length)/4);
        conditionalVarNames.map(function(na)
        {
            queryPath += "/" + na + ":" + truth[truth.length-1][na];
            condText += capitalizeEachWord(na.replace("_", " ")) + " = " + truth[truth.length-1][na] + ", ";
        });
        condText = condText.slice(0, condText.length-2) + ")";
        if (typeof(betQueryWindow.text) !== "undefined")
        {
            betQueryWindow.text.erase();
        }

        betQueryWindow.condTags.map(function(condTag)
        {
            condTag.content.erase();
            condTag.content = makeTextWidget(truth[truth.length-1][condTag.name], radius*2, "Arial", "#ffffff");
            condTag.content.render(condTag.shape, {x:radius+1, y:1});
        });
	
	$.ajax({
            type: "GET",
            url: '/js/queryList/interest_rate',
            //data: JSON.stringify({'asdf': 'sdfg', 'someinfo2': 'hello world2'}),
            async: true,
            dataType: "json",
            success: function(data)
            {
			
	/*if (typeof(mydict.responseJSON) === "undefined")
                {
		    new_dict=JSON.parse(mydict.responseJSON)
		    alert(JSON.stringify(new_dict))
		}*/
	//responseSrting=mydict.responseJSON;
	//alert(JSON.stringify(mydict.respnseJSON))

		predictions.map(function(pred)
				{
				    pred.prediction(data) 
				});
	    }})

        $.ajax({
            type: "GET",
            url: '/js/query' + queryPath,
            async: true,

            dataType: "json",
            success: function(data)
            {
                if (typeof(data[bettingVar]) === "undefined")
                {
                    var currentKeys=Object.keys(betQueryWindow.dict);
                    currentKeys.map(function(key)
                    {
                        if (typeof(betQueryWindow.dict[key]) !== "undefined" & betQueryWindow.dict[key].isActive)
                        {
                            betQueryWindow.dict[key].erase();
                            betQueryWindow.dict[key].percent.erase();
                            betQueryWindow.dict[key].key.erase();
                            betQueryWindow.dict[key].isActive = false;
                        }
                    });
                    betQueryWindow.notAvailText.changeText("Not\n Available")
                }
                else
                {
                    betQueryWindow.notAvailText.changeText("");
                    var currentData = data[bettingVar];
                    var currentKeys = Object.keys(currentData);
                    currentKeys.sort();
                    var  barWidth = (betQueryWindow.width-20-(currentKeys.length-1)*5)/currentKeys.length;
                    var xPos = 10;
                    currentKeys.map(function(key)
                    {
                        if (typeof(betQueryWindow.dict[key]) !== "undefined")
                        {
                            if (betQueryWindow.dict[key].isActive)
                            {
                                betQueryWindow.dict[key].erase();
                                betQueryWindow.dict[key].percent.erase();
                                betQueryWindow.dict[key].key.erase();
                            }
                        }

                        betQueryWindow.dict[key] = makeRect(barWidth, (betQueryWindow.height-120)*currentData[key], 'red', 1, "red", 1);
                        betQueryWindow.dict[key].isActive = true;
                        betQueryWindow.dict[key].percent = makeTextWidget(JSON.stringify(Math.round(currentData[key]*100)), 10, "Arial", "#666");
                        betQueryWindow.dict[key].key = makeTextWidget(key, 13, "Arial", "#666");
                        betQueryWindow.dict[key].render(betQueryWindow.shape, {x:xPos, y:betQueryWindow.height-60-(betQueryWindow.height-120)*currentData[key]});
                        betQueryWindow.dict[key].percent.render(betQueryWindow.shape, {x:xPos+barWidth/2-betQueryWindow.dict[key].percent.width/2, y:betQueryWindow.height-75-(betQueryWindow.height-120)*currentData[key]})
                        betQueryWindow.dict[key].key.render(betQueryWindow.shape, {x:xPos+barWidth/2-betQueryWindow.dict[key].key.width/2, y:betQueryWindow.height-55})
                        xPos += barWidth+5;
                    });
                }
            }
        });
        sendModelIfUpdated();
    }
}
