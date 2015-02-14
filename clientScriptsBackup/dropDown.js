// requires shapeLib.js
 
function makeDropDownArrow()
{ 
    var dropDownArrow = Object.create(Widget);
    var arrowShape = new createjs.Shape();
    var graphics = arrowShape.graphics.setStrokeStyle(1);
    graphics.beginStroke("#666").moveTo(0, 0).lineTo(2, 4).lineTo(4, 0);
    graphics.endStroke();
    arrowShape.x = arrowShape.regX = 0;
    arrowShape.y = arrowShape.regY = 0;
    dropDownArrow.shape = arrowShape;
    return dropDownArrow;
}

function makeDropUpArrow()
{ 
    var dropUpArrow = Object.create(Widget);
    var arrowShape = new createjs.Shape();
    var graphics = arrowShape.graphics.setStrokeStyle(1);
    graphics.beginStroke("#666").moveTo(0, 4).lineTo(2, 0).lineTo(4, 4);
    graphics.endStroke();
    arrowShape.x = arrowShape.regX = 0;
    arrowShape.y = arrowShape.regY = 0;
    dropUpArrow.shape = arrowShape;
    return dropUpArrow;
}

var DropDownMenu = Object.create(Widget);

function makeDropDownMenu(choices, width, height, color, defaultMessage, fontSize)
{
    if (typeof fontSize === 'undefined') {
	fontSize=22;
    }
    var dropDownMenu = Object.create(DropDownMenu);
    dropDownMenu.choices = choices;
    dropDownMenu.fontSize=fontSize;
    dropDownMenu.hasActive = false;
    dropDownMenu.expanded = false;

    dropDownMenu.setShape(new createjs.Container());

    dropDownMenu.width = width;
    dropDownMenu.height = height;
    dropDownMenu.color = color;

    dropDownMenu.dropDownArrow = makeDropDownArrow();
    dropDownMenu.dropDownArrow.render(dropDownMenu.shape, {x: width-10, y: 10});
    dropDownMenu.dropDownItems = dropDownMenu.createDropDownItems(choices);

    if (typeof defaultMessage === 'undefined') {
        dropDownMenu.hasDefaultMessage = false;
        dropDownMenu.activeChoice = dropDownMenu.choices[0];
        dropDownMenu.setActiveChoice(dropDownMenu.choices[0]);
    } else {
        dropDownMenu.hasDefaultMessage = true;
        dropDownMenu.defaultMessage = defaultMessage;
        dropDownMenu.activeChoice = defaultMessage;
        dropDownMenu.defaultDDI = makeDropDownItem(defaultMessage, 
                dropDownMenu.height, dropDownMenu.width, "white", dropDownMenu);
        dropDownMenu.setActiveChoice(dropDownMenu.defaultMessage);
    }

    return dropDownMenu;
}

DropDownMenu.createDropDownItems = function(choices)
{
    var dropDownItems = [];
    var menu = this;
    for (var i=0; i < choices.length; i++) {
        var dropDownItem = makeDropDownItem(choices[i], this.height, 
                                            this.width, "white", this);
        dropDownItems.push(dropDownItem)
    }
    return dropDownItems;
}

function makeDropDownItem(itemText, menuHeight, menuWidth, menuColor, menu)
{
    var dropDownItem = Object.create(Widget);
    dropDownItem.setShape(new createjs.Container());
    dropDownItem.width = menuWidth;
    dropDownItem.height = menuHeight;
    dropDownItem.background = makeRect(menuWidth, menuHeight, menuColor, 1);
    dropDownItem.text = makeTextWidget(itemText, menu.fontSize);
    dropDownItem.background.shape.x = 0;
    dropDownItem.background.shape.y = 0;
    dropDownItem.shape.addChild(dropDownItem.background.shape);
    dropDownItem.shape.addChild(dropDownItem.text.shape);
    dropDownItem.text.shape.x = 2;
    dropDownItem.text.shape.y = menuHeight/2 - 8;
    dropDownItem.dropDownMenu = menu;

    dropDownItem.shape.on("mouseover", function(event) {
        if (menu.expanded) {
            dropDownItem.background.changeColor("#f0fff0");
        }
    });

    dropDownItem.shape.on("mouseout", function(event) {
        dropDownItem.background.changeColor(dropDownItem.background.color);
    });

    dropDownItem.shape.removeAllEventListeners("click");
    dropDownItem.shape.on("click", function(evt)
    {
        if (menu.activeChoice !== this.widget.text.shape.text)
        {
            menu.setActiveChoice(this.widget.text.shape.text);
        }
    });
    return dropDownItem;
}

DropDownMenu.getActiveChoiceItem = function()
{
    for (var i=0; i < this.dropDownItems.length; i++) {
        if (this.dropDownItems[i].text.shape.text === this.activeChoice)
        {
            return this.dropDownItems[i];
        }
    };
    if (this.activeChoice === this.defaultMessage)
    {
        return this.defaultDDI;
    }
}

DropDownMenu.disableActive = function()
{
    var menuWidget = this;
    if (typeof this.activeChoice !== "undefined")
    {
        activeChoiceItem = this.getActiveChoiceItem();
        activeChoiceItem.shape.removeAllEventListeners("click");
        activeChoiceItem.shape.on("click", function(evt)
        {
            var dropDownMenu = this.widget.dropDownMenu;
            if (dropDownMenu.activeChoice !== this.widget.text.shape.text)
            {
                dropDownMenu.setActiveChoice(this.widget.text.shape.text);
            }
        });
    }
}

DropDownMenu.setActiveChoice = function(aChoice)
{
    var menuWidget = this;
    var handleActiveItemClick = function(evt) {
        if (menuWidget.expanded) {
            var activeChoiceItem = menuWidget.getActiveChoiceItem();
            activeChoiceItem.background.changeColor(activeChoiceItem.background.color);
            menuWidget.undisplayItems();
        } else {
            var activeChoiceItem = menuWidget.getActiveChoiceItem();
            activeChoiceItem.background.changeColor("#f0fff0");
            menuWidget.displayAllItems();
        }
    };

    this.disableActive();
    this.activeChoice = aChoice;

    if (this.activeChoice === this.defaultMessage) {
        this.defaultDDI.renderW(this, {x: 0, y: 0}, "ulCorner", 0);
    } else {
        for (var i=0; i < this.dropDownItems.length; i++) {
            if (this.dropDownItems[i].text.shape.text === aChoice) {
                this.dropDownItems[i].render(this.shape, {x: 0, y: 0}, "ulCorner", 0);
            }
        }
    }

    var activeChoiceItem = menuWidget.getActiveChoiceItem();
    activeChoiceItem.shape.removeAllEventListeners("click");
    activeChoiceItem.shape.on("click", handleActiveItemClick);
    this.undisplayItems();
}

DropDownMenu.displayAllItems = function()
{
    this.expanded = true;
    var addNum = 0;
    for (var i=0; i < this.choices.length; i++) {
        if (this.choices[i] !== this.activeChoice) {
            addNum += 1;
            this.dropDownItems[i].render(this.shape, 
                    {x: 0, y: addNum*this.height});
        }
    };
}

DropDownMenu.undisplayItems = function()
{
    this.expanded = false;
    for (var i=0; i < this.dropDownItems.length; i++) {
        var listItem = this.dropDownItems[i];
        if (listItem.text.shape.text !== this.activeChoice) {
            this.shape.removeChild(listItem.shape);
        }
    };
    if (this.hasDefaultMessage && 
            this.defaultDDI.getParent() === this.shape) {
        this.defaultDDI.erase();
    }
    var activeChoiceItem = this.getActiveChoiceItem();
    activeChoiceItem.renderW(this, Point(0,0), "ulCorner", 0);
    activeChoiceItem.background.changeColor(activeChoiceItem.background.color);
}

DropDownMenu.clickOut = function() {
    this.undisplayItems()
}

var ScrollMenu = Object.create(Widget);

function makeScrollMenu(choices, width, height, color, defaultMessage, fontSize)
{
    if (typeof fontSize === 'undefined') {
	var fontSize=22;
    }
    var scrollMenu = Object.create(ScrollMenu);
    scrollMenu.choices = choices;
    scrollMenu.fontSize=fontSize;

    scrollMenu.hasActive = false;
    scrollMenu.expanded = false;

    scrollMenu.setShape(new createjs.Container());

    scrollMenu.width = width;
    scrollMenu.height = height;
    scrollMenu.color = color;

    scrollMenu.scrollDownArrow = makeDropDownArrow();
    scrollMenu.scrollUpArrow=makeDropUpArrow();
    scrollMenu.scrollDownArrow.render(scrollMenu.shape, {x: width-10, y: 10});
    scrollMenu.scrollUpArrow.render(scrollMenu.shape, {x: width-10, y: 0});
    scrollMenu.scrollItems=[]
    choices.map(function(choice){scrollMenu.scrollItems.push(makeTextWidget(choice, fontSize))});
    
    scrollMenu.setActiveChoice(choices[0]);
    scrollMenu.scrollUpArrow.shape.on("click", function(evt)
				      {
					  scrollMenu.setActiveChoice(choices[(choices.indexOf(scrollMenu.activeChoice)+1)%choices.length]);
				      })
    scrollMenu.scrollDownArrow.shape.on("click", function(evt)
				      {
					  scrollMenu.setActiveChoice(choices[(choices.indexOf(scrollMenu.activeChoice)+ choices.length-1)%choices.length]);
				      })
    //ls[(ls.indexOf(1)+ls.length-1)%ls.length]
    return scrollMenu;
}


ScrollMenu.getActiveChoiceItem = function()
{
    for (var i=0; i < this.scrollItems.length; i++) {
        if (this.scrollItems[i].shape.text === this.activeChoice)
        {
            return this.scrollItems[i];
        }
    };
   
}

ScrollMenu.disableActive = function()
{
    var menuWidget = this;
    if (typeof this.activeChoice !== "undefined")
    {
        activeChoiceItem = this.getActiveChoiceItem();
        activeChoiceItem.shape.removeAllEventListeners("click");
	activeChoiceItem.erase()
        
    }
}

ScrollMenu.setActiveChoice = function(aChoice)
{
    var menuWidget = this;
    this.disableActive();
    this.activeChoice = aChoice;

    
    for (var i=0; i < this.scrollItems.length; i++) {
        if (this.scrollItems[i].shape.text === aChoice) {
            this.scrollItems[i].render(this.shape, {x: 0, y: 0}, "ulCorner", 0);
            
        }
    }
    var activeChoiceItem = menuWidget.getActiveChoiceItem();
}

