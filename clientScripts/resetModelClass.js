
function resetModelClass(modelClass)
{
    truth=[]; 
    GraphJson={};
    model[user.id]=GraphJson;
    sideBar.erase()
    dataWindow.erase();
    putWindow.erase();
    callWindow.erase();
    if (modelClass["model_name"]==="monty") {
	isMonty=true; 
    } else {isMonty=false}

    //sideBar=createSideBar2(modelClass, isMonty);
    //var modelClass = data['model_class'];
    //truth = data['samples'];
    //var bettingVar = modelClass['betting_variable'];
    $.ajax({
				    type: "GET",
				    url: '/js/truth/' + user.id,
				    async: true,
				    
				    dataType: "json",
				    success: function(data){
					if (data) 
					{
                        var modelClass = data['model_class'];
                        truth = data['samples'];
                        bettingVar = truth[truth.length-1]['betting_var'];
                        //truth = truth.concat(data);
                        var isMonty;
                        if (modelClass['model_name'] == 'monty')
                        {
                            isMonty = true;
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
                            isMonty = false;
                        }
                        var domain;
                        if (isMonty) {
                            domain = ["A", "B", "C"];
                        } else {
                            domain = ["H", "L"];
                        }
                        sideBar = createSideBar2(modelClass, isMonty);
                        variables = sideBar.Vars;
					    dataWindow = makeDataWindow(truth, domain, variables, stageWidth-250, modelClass, isMonty);

					    dataButton = makeContractedButton(dataWindow);
					    dataButton.render(stage, {x:dataWindow.xPos, y:stageHeight-25})
					    //betsWindow = makeCallWindow([], domain, variables[variables.length-1], stageWidth-500);

					    //the last variable must always be the betting variable!
                        //MARK1
					    //betButton=makeContractedButton(betsWindow);
					    //betButton.render(stage, {x:betsWindow.xPos, y:stageHeight-25});
					    
					    //putsWindow = makePutWindow([], domain, variables[variables.length-1], stageWidth-750);

					    //the last variable must always be the betting variable!
					    //putButton = makeContractedButton(putsWindow);
					    //putButton.render(stage, {x:putsWindow.xPos, y:stageHeight-25});
					    

					} 
					else
					{
					    alert("the truth is missing!");
					}
					
				    }
				    
				});
				

			  
}
