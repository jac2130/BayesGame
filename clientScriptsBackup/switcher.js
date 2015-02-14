var check=false;
var checkQuery=function() {
    
    $.ajax({
	type: "GET",
	url: '/ajax/'+ "has_query/"+user.id,
	async: true,
    
	dataType: "json",
	success: function(data){
	    if (data) 
	    {
		check = true;
	    }
	    else
	    {
		check= false;
	    }
	    
	}
	
    });
    return check;
}


function capitaliseFirstLetter(string)
{
    return string.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function makeHideButton(switcher, Id, size)
{
    if (typeof size === 'undefined') 
    {
        size = 25;
    }
    var hideButton = Object.create(Widget);
    hideButton.setShape(new createjs.Container());
    //arrowWid.background = makeRect(30, 30, "#F2F2F2", 2);
    hideButton.background = makeRect(size, size, "white", 0, 0, 100);
    hideButton.background.render(hideButton.shape, {x: 0, y: 0});
    
    hideButton.text = makeDeleteCross(size*0.5,size*0.5, "#666", size/10);
    hideButton.text.renderW(hideButton, {x: size*0.25, y: size*0.25});

    var callback = {
	"switcher":switcher,
        "Id": Id,
        "call": function() {
            this.switcher.hideCase(this.Id);
        }
    };
    makeClickable(hideButton, callback);
    return hideButton;
}


function makeAddButton(cases, size)
{
    if (typeof size === 'undefined') 
    {
        size = 35;
    }
    var addButton = makeButton("+", size, size);
    var callback = {
        "cases": cases,
        "call": function() {
            tutorial.trigger("caseAdded");
            this.cases.addCase();
        }
    };
    makeClickable(addButton, callback);
    return addButton;
}

function makeArrow(upOrDown, cases) {
    var arrowWid = Object.create(Widget);
    arrowWid.setShape(new createjs.Container());
    //arrowWid.background = makeRect(30, 30, "#F2F2F2", 2);
    arrowWid.background = makeRect(30, 30, "grey", 2);
    arrowWid.background.render(arrowWid.shape, {x: 0, y: 0});
    if (upOrDown === "up") {
        arrowWid.text = makeEquiTriangle(20, "black");
        arrowWid.text.render(arrowWid.shape, {x: 15, y: 23});
        var callback = {
            "cases": cases,
            "call":  function() {
                this.cases.nextCase();
            }
        };
        makeClickable(arrowWid, callback);
    } else {
        arrowWid.text = makeEquiTriangle(20, "black", 180);
        arrowWid.text.render(arrowWid.shape, {x: 15, y: 7});
        var callback = {
            "cases": cases,
            "call":  function() {
                this.cases.prevCase();
            }
        };
        makeClickable(arrowWid, callback);
    }
    return arrowWid;
}

function makeArrowUp(cases)
{
    return makeArrow("up", cases);
}

function makeArrowDown(cases)
{
    return makeArrow("down", cases);
}

function makeCases(container, menu1, menu2, hist, equalsSign, 
                   caseNumText, clickOutList, switcher)
{
    var cases = Object.create(Cases);
    cases.container = container;
    cases.switcher = switcher;
    cases.caseNum = 0;
    cases.caseNumText = caseNumText;
    cases.caseList = [[menu1, menu2, equalsSign, hist]];
    cases.clickOutList = clickOutList;
    cases.setCase(0);
    return cases;
}

var Cases = {}


var makeHistFromVals=function(Id, bayesVar, switcher, gapHeight,vals, valList, valObj, ajaxObject, graphWidth, histHeight,fontSize)
//vals is a list, containing an array of conditions and an array of values; 
{
    values=vals[1];
    conditions=vals[0];
    tempHist=makeHist(values, bayesVar.possibilities, graphWidth, histHeight, 20, bayesVar.color, conditions);
    //tempHist.conditions=conditions;
    //tempHist.condList=[];
    condString="P ("+ bayesVar.varText + " |"
    valList=valList;
    for (var i=0; i< tempHist.conditions.length; i++)
    {
	//if ((i+3)%3===0) 
	//{
	valList.push(conditions[i])
	    //making the dictionary with conditions.
	    //tempHist.condList.push([conditions[i],conditions[i+2]]);
	//}
	condString+= " " + capitaliseFirstLetter(tempHist.conditions[i][0].replace("_", " ")) + "=" + tempHist.conditions[i][1];
	if (i<tempHist.conditions.length-1)
	{
	    condString+= ",";
	}
    }
    
    var valObj=valObj;
    for (var i=0;i< bayesVar.possibilities.length; i++)
    {
	valObj[bayesVar.possibilities[i]]= values[i]
    }
			       
			       
    condString+=")";
    ajaxObject[bayesVar.varText].push([valList,valObj]); 
			       

    tempHist.condText= makeTextWidget(condString,fontSize, "Arial", "#666"  ) 
    tempHist.condText.renderW(tempHist, {x:switcher.width-tempHist.condText.width-20, y:gapHeight})
    
    if (switcher.cases.caseNumber!=1){
	tempHist.hideButton=makeHideButton(switcher, Id, histHeight/3);

	tempHist.hideButton.renderW(tempHist, {x:switcher.width+10, y:histHeight/3})
    }

    return tempHist
}

function sameTwoCases(case1, case2)
{
//this function checks whether two cases are the same
    var conditions=[];
    case1.map(function(item)
	      {
		  var element=false;
		  for (var i=0; i<case1.length; i++)
		  {
		      if (JSON.stringify(item)===JSON.stringify(case2[i]))
		      {
			  element=true;
		      }
		  }
		  conditions.push(element)
	      })
    var outcome=true;
    conditions.map(function(item){outcome*=item})

    return outcome
}

function checkDict(menues, searchList){
    //varMap must be an object like this: 
    //[[["prize_door", "A"], ["guest_door", "A"]],[["prize_door", "A"], ["guest_door", "B"]]]
    
    var conds=[]
    for (var i=0; i<menues.length; i++)
    {
	if (i%3===0)
	{
	    conds.push([menues[i].activeChoice.toLowerCase().replace(" ", "_"), menues[i+2].activeChoice])
	    //this is a not yet included case; so it should be allowed. 
	   
	}
    }
    var dictCheck=true;
    searchList.map(function(item){if (sameTwoCases(conds, item[0])){dictCheck=false}});
    return dictCheck
}



function makeSwitcher(bayesVar, graphWidth, graphHeight, color, varnames, defaultVals)
{
    if (typeof defaultVals === 'undefined') 
    {
        defaultVals = [20, 30, 50];
    }
    verifyType(color, "string", color);
    var borderWidth = 1;
    
    var switcher = Object.create(View);
    switcher.width=graphWidth;
    switcher.height=graphHeight;
    switcher.setShape(new createjs.Container());
    switcher.background = makeRect(graphWidth, graphHeight, "#3b5998"/*"#3B4DD0"*/, borderWidth);
    switcher.background.render(switcher.shape, {x:0, y:0});

    var histHeight=graphHeight-35;
    var hist = makeHist(defaultVals, bayesVar.possibilities,
                         graphWidth, histHeight, 20, color);

    hist.renderW(switcher, {x:0, y:55});
    switcher.varnames=varnames;
    nextVarXcoord=20;
    nameLengths=[]
    menues=[] //make the menues part of the histograms. 
    //this is important to keep the conditions attached to the conditional
    //distributions, which are the histograms.
    
    switcher.varnames.map( function(item) {nameLengths.push(makeTextWidget(item,22, "Arial", "#666"  ).width)})
    //var NameWidth=Math.max.apply(null, nameLengths)+30;
    for (var i=0; i< varnames.length;i++) 
    {
	if (typeof(varnames[i])==="string")
	{
	    var varname=makeTextWidget(switcher.varnames[i], 28, "Arial", "white" )
	    var NameWidth=varname.width;
		//makDropDownMenu(switcher.varnames, NameWidth, 32, "white", switcher.varnames[i]);
	    varname.x=nextVarXcoord
	    varname.activeChoice=varname.shape.text;
	    menues.push(varname)
	    //makeTextWidget(switcher.varnames[i],22, "Arial", "black" )
	    varname.renderW(switcher, {x:varname.x, y:10})

	    var equalSign=makeTextWidget("=", 28, "Arial", "white" )
		//makeDropDownMenu(["=", "!="], 32, 32, "white")
	    equalSign.x= nextVarXcoord+NameWidth+10
	    equalSign.activeChoice=equalSign.shape.text;
	    menues.push(equalSign)
	    equalSign.renderW(switcher,{x:equalSign.x, y:10});
	    
	    var domain=makeDropDownMenu(["A", "B", "C"], 80, 32, "#8b9dc3", "Value");
	    domain.x= nextVarXcoord+NameWidth+50
	    menues.push(domain)
	    domain.renderW(switcher,{x:domain.x, y:10});
 
	    nextVarXcoord+=(150+NameWidth);
	}
    }
    switcher.menues=menues;
    /*hist.conditions=[] //this is now done in histogram.js
    hist.updateConditions=function()
    {
	
	switcher.menues.map(function(menu){hist.conditions.push(menu.activeChoice)});
    }
    hist.updateConditions()*/
    switcher.hists=[hist]
    switcher.cases=[]
    switcher.hists.map(function(hist) {switcher.cases.push([hist.conditions, hist.getVals()])})
    cases=switcher.cases;
    cases.caseNumber=1; //we start by adding the second case
    switcher.cases=cases;
    var varKey=bayesVar.varText.toLowerCase().replace(" ", "_");
    switcher.varKey=varKey;
    
/////////////////////hideCase /////////////////////////////
    switcher.hideCase=function(CaseId)
    {
	//this function is modeled after addCase() with a few changes.
	var nextPosY=55;
	var caseNumber=Math.max(switcher.cases.caseNumber-1, 1);
	
	var gapHeight=(graphHeight/caseNumber)/20
	var fontSize=5*Math.log(gapHeight*10);
	var histHeight=(graphHeight-gapHeight/2)/caseNumber;
	switcher.cases=[]
	switcher.cases.caseNumber=caseNumber;
	
	//here is the big change: extract only the one histogram that is to be killed and allows rendering everything else.
 
	var i=0;
	switcher.hists.map(function(hist) {
	    if (i!=CaseId)
	    {
		switcher.cases.push([hist.conditions, hist.getVals()]);
	    }
	    i+=1;
	})
	var refreshMenues=switcher.menues;
	
	switcher.menues.map(function(menue) {menue.erase()});
	switcher.menues=refreshMenues;

	switcher.hists.map(function(hist) {hist.erase()});
	switcher.hists=[];
	ajaxObject={};
	ajaxObject[bayesVar.varText]=[];
	var valList=[];
	var valObj={};
	var ajaxObject={};
	ajaxObject[bayesVar.varText]=[];
	Id=0;
	model[model.id][switcher.varKey]=[];
	switcher.cases.map(function(vals){
	    tempHist=makeHistFromVals(Id, bayesVar, switcher, gapHeight,vals, valList, valObj, ajaxObject, graphWidth, histHeight,fontSize)
	    switcher.hists.push(tempHist)
	    if (tempHist.conditions.length)
	    {
		var modelDict={}
		for (var k in tempHist.valDict){modelDict[k]=tempHist.valDict[k]/100}
		model[model.id][switcher.varKey].push([tempHist.conditions, modelDict]);
	    }
	    Id+=1
	})
	
	
	switcher.hists.map(function(hist)
			   {
			       hist.barArea.moveIncr({x:0, y:gapHeight})
			   });

	for (var i=0; i<switcher.hists.length;i++ ) 
	{
	    
	    switcher.hists[i].renderW(switcher, {x:0, y:nextPosY}); 
	    nextPosY+=histHeight;
	};
	switcher.menues.map(function(menue) {menue.renderW(switcher, {x:menue.x, y:10})});

	//sending back the changes;
	$.ajax({ 
	    type: "post",
	    url: '/ajax/model',
	    async: true,
	    data:JSON.stringify(model),
	    dataType: "json",
	    contentType: "application/json",
	    success: function(user){alert(user.name)} 
    
	});
	check=checkQuery();

    }
//////////////////////end of hideCase ///////////////////////////////
    
    switcher.cases.addCase=function() 
    { 
        switcher.caseList = []
        model[model.id][switcher.varKey]=[];
        switcher.hists.map(function(hist)
                   {			       
                       if (hist.conditions.length)
                       {
                       var modelDict={}
                       for (var k in hist.valDict){modelDict[k]=hist.valDict[k]/100}
                       model[model.id][switcher.varKey].push([hist.conditions, modelDict]);
                       }
                       
                   });
        
        
        //this will be replaced by a check to see if the case
        //is already part of the model.
        /*if (checkQuery()) 
        {
            alert("done") 
            return false
        }*/

        var dictCheck=false
        if (checkDict(switcher.menues, model[model.id][switcher.varKey]))
        { 
            dictCheck=true;
        }
        if (!dictCheck) {
            alert("you already specified this case!");
            return false
        }

//mu    st replace the above 

        switcher.cases.caseNumber += 1
        var nextPosY=55;
        var caseNumber=switcher.cases.caseNumber;
        var gapHeight=(graphHeight/caseNumber)/20
        var fontSize=5*Math.log(gapHeight*10);
        var histHeight=(graphHeight-gapHeight/2)/caseNumber;
        switcher.cases=[]
        switcher.cases.caseNumber=caseNumber;//have to add it again to the cases;
        //here, I must add the values which originally came from the .activeChoice; of the menues
        switcher.hists.map(function(hist) {switcher.cases.push([hist.conditions, hist.getVals()])})
        var refreshMenues=switcher.menues;
        //var lastChoice=[]
        //switcher.menues.map(function(menu){lastChoice.push(menu.activeChoice)});
        switcher.menues.map(function(menue) {menue.erase()});
        switcher.menues=refreshMenues;

        switcher.hists.map(function(hist) {hist.erase()});
        switcher.hists=[];
        
        var valList=[];
        var valObj={};
        var ajaxObject={};
        ajaxObject[bayesVar.varText] = [];
        Id=0;
        switcher.cases.map(function(vals)
        {
            tempHist = makeHistFromVals(Id, bayesVar, switcher, gapHeight,vals, valList, valObj, ajaxObject, graphWidth, histHeight,fontSize)
            switcher.hists.push(tempHist)
            Id+=1
        })
        switcher.hists.map(function(hist)
        {
            hist.barArea.moveIncr({x:0, y:gapHeight})
        });
        
        var condString="P ("+ bayesVar.varText + " |";
        
        valList = [];
        var valObj = {};
        switcher.hists[switcher.hists.length-1].conditions = [];
        var vals=switcher.hists[switcher.hists.length-1].getVals()
        //alert(vals)
        for (var i=0; i<bayesVar.possibilities.length; i++)
        {
            valObj[bayesVar.possibilities[i]] = vals[i];
        }
        
   
        for (var i=0; i< switcher.menues.length; i++)
        {
            //conds.push(switcher.menues[i].activeChoice)

            if ((i+3)%3===0) 
            {
                valList.push([switcher.menues[i].activeChoice, switcher.menues[i+2].activeChoice]);
                switcher.hists[switcher.hists.length-1].conditions.push([switcher.menues[i].activeChoice.toLowerCase().replace(" ", "_"), switcher.menues[i+2].activeChoice]);
            }
            
            condString+= " " + switcher.menues[i].activeChoice; 
            if ((i+1)%3 === 0 && i>0 && i<switcher.menues.length-1)
            {
                condString+= ",";
            }
        }

        //ajaxObject[bayesVar.varText][ajaxObject[bayesVar.varText].length-1]=[valList, valObj];
        condString += ")";
        var ValDict = switcher.hists[switcher.hists.length-1].valDict;
        var modelDict = {};
        for (var k in ValDict)
        {
            modelDict[k] = ValDict[k]/100;
        }
        model[model.id][switcher.varKey].push([switcher.hists[switcher.hists.length-1].conditions, modelDict]);
        
        //here goes the ajax post call.
        $.ajax({
            type: "post",
            url: '/ajax/model',
            async: true,
            data:JSON.stringify(model),
            dataType: "json",
            contentType: "application/json",
            success: function(user){alert(user.name)} 
        
        });
        
        //check=checkQuery();
        
        switcher.hists[switcher.hists.length-1].condText.erase();
        switcher.hists[switcher.hists.length-1].condText= makeTextWidget(condString,fontSize, "Arial", "#666"  ) 
        
        //switcher.hists[switcher.hists.length-1].conditions=conds;
        
        switcher.hists[switcher.hists.length-1].condText.renderW(switcher.hists[switcher.hists.length-1], {x:switcher.width-switcher.hists[switcher.hists.length-1].condText.width-20, y:gapHeight});


        newHist = makeHist(defaultVals, ["A", "B", "C"], graphWidth, histHeight, 20, color);
        //newHist.conditions=[];
        //newHist.condList=[];
        newHist.hideButton=makeHideButton(switcher, Id, histHeight/3);

        newHist.hideButton.renderW(newHist, {x:switcher.width+10, y:histHeight/3});
        switcher.hists.push(newHist);

        for (var i=0; i<switcher.hists.length;i++ ) 
        {
            
            switcher.hists[i].renderW(switcher, {x:0, y:nextPosY}); 
            nextPosY += histHeight;
        };

        switcher.menues.map(function(menue)
        {
            menue.renderW(switcher, {x:menue.x, y:10})
        });

        //if (checkQuery()){alert(checkQuery())}
        //here I need to add the .activeChoice to the histograms.
        //newHist.renderW(switcher, {x:0, y:nextPosY});
    }
//end of addCase

////////////////////////////////////////////////////////////////////////////
    
    switcher.getCurrHist=function(){return switcher.hists[switcher.hists.length-1]};
    //switcher.hideCase=function(Id){

    //}
    switcher.addButton = makeAddButton(switcher.cases);
    switcher.addButton.render(switcher.shape, {x:nextVarXcoord, y:10});
    return switcher
}

function makeTweaker(clickOutList, color, varnames, defaultVals)
{
    if (typeof defaultVals === 'undefined') {
        defaultVals = [20, 30, 50];
    }
    verifyType(color, "string", color);
    
    var switcher = Object.create(Widget);
    switcher.setShape(new createjs.Container());
    switcher.color = color;
    switcher.varnames=varnames;
    switcher.getCurrHist = function ()
    {
        return this.cases.caseList[this.cases.caseNum][3];
    }

    switcher.getCurrVals = function()
    {
        var currHist = this.getCurrHist();
        return currHist.getVals();
    }

    var var1DDM = makeDropDownMenu(switcher.varnames 
                                    , 110, 25, "white",
                                    "Select Parent");
    var1DDM.shape.on("click", function() {
        tutorial.trigger("menuClicked", switcher);
    });
    //var1DDM.render(switcher.shape, {x:105, y:30});
    clickOutList.push(var1DDM);
    var var2DDM = makeDropDownMenu(["A", "B", "C"], 110, 25, "white",
                                    "Select Value");
    var2DDM.shape.on("click", function() {
        tutorial.trigger("menuClicked", switcher);
    });
    //var2DDM.render(switcher.shape, {x:470, y:30});
    clickOutList.push(var2DDM);

    //equalsSign = makeTextWidget("=", 40);
    var equalsSign = makeDropDownMenu(["=", "!="], 25, 25, "white");
    equalsSign.shape.on("click", function() {
        tutorial.trigger("menuClicked", switcher);
    });
    //equalsSign.render(switcher.shape, {x: 380, y: 30});
    clickOutList.push(equalsSign);

    var caseNumText = makeTextWidget("0", 20);
    caseNumText.render(switcher.shape, {x: 20, y: 37});

    var hist = makeHist(defaultVals, ["A", "B", "C"], 1500, 800, 20,
                        switcher.color);
    //hist.render(stage, {x: 100, y: 100});
    switcher.smallHists = hist.smallHists;
    switcher.cases = makeCases(switcher.shape, var1DDM, var2DDM, hist,
                       equalsSign, caseNumText, clickOutList, switcher);

    switcher.addButton = makeAddButton(switcher.cases);
    switcher.addButton.render(switcher.shape, {x:350, y:20});

    switcher.arrowUp = makeArrowUp(switcher.cases);
    switcher.arrowUp.render(switcher.shape, {x: 10, y: 5});

    switcher.arrowDown = makeArrowDown(switcher.cases);
    switcher.arrowDown.render(switcher.shape, {x: 10, y: 60});

    //switcher.okayButton = makeOkayButton(switcher.cases);
    //switcher.okayButton.render(switcher.shape, {x: 700, y: 530});

    return switcher;
}
