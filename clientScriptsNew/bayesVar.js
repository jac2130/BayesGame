// requires histgram.js
/*
 * makeBayesVar
 *
 * bayesVar -> object with bayesVarCircles
 *      -> varName -> name of variable
 *      -> varText -> text to be displayed
 *      -> probSetter -> histogram or switcher
 *      -> isMultiVar -> has dependent variables (determines if probSetter is histogram or switcher)
 *      -> varName
 *      -> color
 *
 */

var BAYES_HIST_WIDTH = 750;
var BAYES_HIST_HEIGHT = 500;

function bayesVarJs()
{
    var colors = ["#3B4DD0"  /*"#3b5998"*/,  "yellow", "red", "green", "purple", "brown",
                  "DarkRed", "GoldenRod"];
    var BayesVar = {};
    var numVars = 0;
    var makeBayesVar = function(varName, varText, possibilities)
    {
        var newBayesVar = Object.create(BayesVar);
        newBayesVar.color = colors[numVars];
        newBayesVar.varName = varName;
        newBayesVar.varText = varText;
        newBayesVar.possibilities = possibilities;
        newBayesVar.hasActiveView = false;
        newBayesVar.isMultiVar = false;
        newBayesVar.probSetter = makeHist([20, 30, 50], possibilities,
                                  BAYES_HIST_WIDTH, BAYES_HIST_HEIGHT, 20, newBayesVar.color);

        newBayesVar.getCurrHistVals = function()
        {
            if (!this.isMultiVar) {
                this.probSetter.getVals();
            } else {
                this.probSetter.getCurrVals();
            }
        }

        // adding the innitial variable object to the graph object.
        var modelDict = {}
        for (var k in newBayesVar.probSetter.valDict)
        {
            modelDict[k] = newBayesVar.probSetter.valDict[k]/100;
        }

        //GraphJson[newBayesVar.varName.toLowerCase().replace(" ", "_")] = [[newBayesVar.probSetter.conditions, modelDict]];
        //the reason why there are so many brackets is because later several conditions can fill the outer list. 
        numVars += 1;

        newBayesVar.getMenuChoices = function ()
        {
            var menuChoices = Set();
            var fromVars = this.getFromVars();
            for (var i=0;i<fromVars.length;i++)
            {
                menuChoices.add(fromVars[i].varName);
                for (var j=0;j<fromVars[i].possibilities.length;j++)
                {
                    menuChoices.add(fromVars[i].possibilities[j]);
                }
            }
            return menuChoices;
        }
        return newBayesVar;
    }
    return makeBayesVar;
}

makeBayesVar = bayesVarJs();
