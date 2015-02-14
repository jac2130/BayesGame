function warn(msg)
{
    var warningWindow = WidgetHL();
    warningWindow.background = makeRect(400, 200, '#ffffff'/*"#f0f0f0"*/, 0.5, "#ffffff", 3);
    warningWindow.background.render(warningWindow.shape, Point(0, 0));
    warningWindow.bar = makeRect(401, 25, "#ffffff", 0, "#ffffff", 3);
    warningWindow.bar.render(warningWindow.shape, Point(0, -25.5));
    warningWindow.killButton=makeDeleteCross(10, 10, "#666"/*"#8b9dc3"*/, 2);
    warningWindow.killButton.render(warningWindow.shape, Point(385, -18));
    warningWindow.killButton.shape.on('click', function(){warningWindow.erase()});
    warningWindow.killButton.shape.on("mouseover", function(evt)
               {
               warningWindow.killButton.changeColor("red");
               })
    warningWindow.killButton.shape.on("mouseout", function(evt)
               {
               warningWindow.killButton.changeColor("#666"/*'#8b9dc3',"#f0f0f0"*/);
               });
    var message = user.first_name + ": ";
    var message2 = msg;

    warningWindow.message1=makeTextWidget(message, 16, "Arial", "#666");
    warningWindow.message2=makeTextWidget(message2, 16, "Arial", "#666");
    warningWindow.message1.renderW(warningWindow, Point(10, 10));
    warningWindow.message2.renderW(warningWindow, Point(10, 40));

    warningWindow.render(topLayer.shape, Point(stageWidth/2-200, stageHeight/2-100));

    var okayButton = WidgetHL();
    okayButton.background = makeRect(100, 25, "white", 1, "white", 2);
    okayButton.background.renderW(okayButton, Point(0, 0));
    okayButton.text = makeTextWidget("OKAY", 20, "Arial", "#666");
    okayButton.text.renderW(okayButton, Point(20, 0));
    okayButton.shape.on("mouseover", function(evt) {
            okayButton.background.changeColor("#666");
            okayButton.text.changeColor("#ffffff");
    });
    okayButton.shape.on("mouseout", function(evt) {
	okayButton.background.changeColor("#ffffff");
	okayButton.text.changeColor("#666");
    });

    okayButton.shape.on("mousedown", function(evt) {
        okayButton.background.changeColor("black");
	okayButton.text.changeColor("#ffffff");
        mousePressed = true;
    });
    okayButton.shape.on('click', function(){warningWindow.erase()});
    okayButton.renderW(warningWindow, Point(150, 150));
}


function sign(var1, var2, plusCallback, minusCallback)
{
        
    var warningWindow = WidgetHL();
    
    if (typeof plusCallback === 'undefined') 
    {
        var plusCallback = {
	    "var1":var1,
	    "var2":var2,
	    "connectCircles2":connectCircles2,
            "window": warningWindow,
            "call": function() {
		//tutorial.trigger("caseAdded");
		//warn(JSON.stringify(this.cases))
		this.window.erase();
		this.connectCircles2(this.var1, this.var2, "+");
	
            }
	};
    }  
    if (typeof minusCallback === 'undefined') 
    {
        var minusCallback = {
	    "var1":var1,
	    "var2":var2,
	    "connectCircles2":connectCircles2,
            "window": warningWindow,
            "call": function() {
		//tutorial.trigger("caseAdded");
		//warn(JSON.stringify(this.cases))
		this.window.erase();
		this.connectCircles2(this.var1, this.var2, "-");
	
            }
	};
    }  
   
    warningWindow.background = makeRect(400, 100, "#ffffff"/*'#EBEEF4',"#f0f0f0"*/, 0, "white", 3);
    warningWindow.background.render(warningWindow.shape, Point(0, 0));
    warningWindow.bar = makeRect(401, 25, "#ffffff"/*"#3b5998"*/, 0, "white", 3);
    warningWindow.bar.render(warningWindow.shape, Point(0, -25.5));
    warningWindow.killButton=makeDeleteCross(10, 10, "#666666"/*"#8b9dc3"*/, 2);
    warningWindow.killButton.render(warningWindow.shape, Point(385, -18));
    warningWindow.killButton.shape.on('click', function(){warningWindow.erase()});
    warningWindow.killButton.shape.on("mouseover", function(evt)
               {
               warningWindow.killButton.changeColor("red");
               })
    warningWindow.killButton.shape.on("mouseout", function(evt)
               {
               warningWindow.killButton.changeColor('#666'/*"#f0f0f0"*/);
               });
    //var message = user.first_name + ": ";
    var message = "Please select the sign of the causal relation below!";

    //warningWindow.message1=makeTextWidget(message, 16, "Arial", "#666");
    warningWindow.message=makeTextWidget(message, 16, "Arial", "#666");
    warningWindow.message.renderW(warningWindow, Point(10, 10));
    //warningWindow.message2.renderW(warningWindow, Point(10, 10));

    warningWindow.render(topLayer.shape, Point(stageWidth/2-200, stageHeight/2-100));
    //alert(callback)
     
        
    var plusButton = makePlusButton(warningWindow, 35, plusCallback);
    
    plusButton.renderW(warningWindow, Point(120, 50));

    var minusButton = makeMinusButton(warningWindow, 35, minusCallback);
    
    minusButton.renderW(warningWindow, Point(220, 50));
    
}
