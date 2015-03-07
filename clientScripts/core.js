scoreTagDrawn = false;

function welcome()
{
    var welcomeScreen = WidgetHL();
    welcomeScreen.tutorialCover = makeRect(400, 200, "#ffffff");
    welcomeScreen.tutorialCover.render(welcomeScreen.shape, Point(260, 0));
    welcomeScreen.background=makeRect(stageWidth, stageHeight, "rgba(0, 0, 0, 0.75)");
    welcomeScreen.background.render(welcomeScreen.shape, Point(0, 0));
    welcomeScreen.nextButton = makeButton(">", 50, 50);

    var callback = {
        "welcomeScreen": welcomeScreen,
        "call": function()
        {
            this.welcomeScreen.erase();
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
} //end of welcome function. 

obtainedTruth = false;
truth = []; 
user = {}; //should be global variables. 
// alert(JSON.stringify(GraphJson))
friendCache = {};
Login = function() 
{ 
    // the "model" variable 
    // represents the initial (default) model of the user, 
    // which the user modifies in the course of the game.
    // Each time that the user's model is modified, 
    // the model is sent back to the server, where it is 
    // tagged with a time stamp and inserted into a mongodb 
    // data base.  
    // Out of this database, a seperate program then
    // pulls
    // the most recent model for each of k people 
    // in a k-group. These are k people who have 
    // been assigned by some treatment mechanism,
    // to see each other's bets and to 
    // thus--by my definition of k-group--belong 
    // to such.
    // Further, this program then, calculates the
    // diversity of time t (as defined in the above,  
    // overlapping generations data model). 
    // The diversity is then calculated
    // and posted as the next data point in a time series
    // on the analysis website: 
    // http://bettingisbelieving.com/analysis.
    // On this same website,
    // a distance matrix between all k models is also
    // posted, with 
    // the modeler's facebook fotos as column and 
    // row names. The latter, serves as a  
    // further treatment, which can be 
    // turned on and off for a group. 
    // If they have access to the analysis website 
    // of their group
    // participants and all others
    // can then click through time to see 
    // the evolution of distance matrices, along with the
    // overall diversity measure for the group. 
    // Performance measures
    // will also be added (as soon as I have the 
    // algorithms worked out).
    // send first the user:
    // then his model:

    $.ajax({
        type: "GET",
        url: '/js/truth',
        async: true,

        dataType: "json",
        success: function(data)
        {
            obtainedTruth = true;
            user.id = data['user_id']
            modelClass = data['model_class'];
            truth = data['samples'];
            isAdmin = data['isAdmin'];
            treatmentNum = data['treatmentNum'];

            //user.score= data['score'];
            //user.points= data['points'];
            //user.shares= data['shares'];

            if (isAdmin)
            {
                beginDemoButton = makeButton("SIMPLE", 210, 25);
                beginDemoButton.callback = {
                    call: function()
                    {
                        $.ajax({
                            type: "GET",
                            url: '/js/beginDemo',
                            async: true,

                            dataType: "json",
                            success: function(data) {}
                        });
                    }
                };

                makeClickable(beginDemoButton, beginDemoButton.callback)
                beginDemoButton.render(stage, {x:650, y:150})

                endDemoButton = makeButton("COMPLEX", 210, 25);
                endDemoButton.callback = {
                    call: function() {
                        $.ajax(
                        {
                            type: "GET",
                            url: '/js/endDemo',
                            async: true,
                            dataType: "json",
                            success: function(data) {}
                        });
                    }
                };
                makeClickable(endDemoButton, endDemoButton.callback)
                endDemoButton.render(stage, {x:650, y:200})

                beginFreeButton = makeButton("Begin Model Building", 210, 25);
                beginFreeButton.callback = {
                    call: function() {
                        $.ajax({
                            type: "GET",
                            url: '/js/beginFreePeriod',
                            async: true,
                            
                            dataType: "json",
                            success: function(data) {}
                        });
                    }
                }
                makeClickable(beginFreeButton, beginFreeButton.callback)
                beginFreeButton.render(stage, {x:650, y:250})

                beginBetting = makeButton("Begin Betting", 210, 25);

                beginBetting.callback = {
                    call: function() {
                        $.ajax({
                            type: "GET",
                            url: '/js/endFreePeriod',
                            async: true,
                            dataType: "json",
                            success: function(data) {}
                        });
                    }
                };
                makeClickable(beginBetting, beginBetting.callback)
                beginBetting.render(stage, {x:650, y:300})
                emptyMclasses = makeButton("Empty Models", 210, 25);

                emptyMclasses.callback = {
                    call: function()
                    {
                        $.ajax({
                            type: "GET",
                            url: '/js/emptyData',
                            async: true,
                            
                            dataType: "json",
                            success: function(data) {}
                        });
                    }
                };
                makeClickable(emptyMclasses, emptyMclasses.callback);
                emptyMclasses.render(stage, {x:650, y:350})
//beginF    reePeriod
            }

            //alert(JSON.stringify(truth))
            var bettingVar = modelClass['betting_variable'];
            //truth = truth.concat(data);
            //var isMonty;
            if (modelClass['model_name'] === 'monty')
            {
                isMonty = true;
                if (truth[truth.length-1]['monty_door'] === 'A')
                {
                    share_val = 'B';
                }
                else
                {
                    share_val = 'A';
                }
            } else {
                share_val = 'H';
                isMonty = false;
            }
            var domain;
            if (isMonty) {
                domain = ["A", "B", "C"];
            } else {
                domain = ["H", "L"];
            }
            var sideBar = createSideBar2(modelClass, isMonty);
            var rightX = 170;//stageWidth-300;
            variables = sideBar.Vars;
            dataWindow = makeDataWindow(truth, domain, variables, rightX, modelClass);
            window.setInterval('updateCount()', 1000); // 1 second
            betQueryWindow = makeBetQueryWindow(variables);
            window.setInterval('updateQueryPrediction()', 1000); // 1 second
            pointWindow = displayScoreAndPointWindow();
            window.setInterval('updatePointWindow()', 1000); // 1 second

            var dataButton = makeContractedButton(dataWindow);
            dataButton.render(stage, {x:dataWindow.xPos, y: stageHeight-25});
            dataButton.callback.call();
            betsWindow = makeCallWindow([], domain, variables[variables.length-1], rightX+dataWindow.width-250);

            //the last variable must always be the betting variable!
            betButton = makeContractedButton(betsWindow);
            betButton.render(stage, {x:betsWindow.xPos, y:75});
            betButton.callback.call();

            putsWindow = makePutWindow([], domain, variables[variables.length-1], rightX + dataWindow.width-500);

            //the last variable must always be the betting variable!
            putButton = makeContractedButton(putsWindow);
            putButton.render(topLayer.shape, {x:putsWindow.xPos, y:75});
            putButton.callback.call();
        }
    });
}
