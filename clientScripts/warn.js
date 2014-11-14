function warn(msg)
{
    var warningWindow = WidgetHL();
    warningWindow.background = makeRect(400, 200, '#EBEEF4'/*"#f0f0f0"*/, 0.5, 1, 3);
    warningWindow.background.render(warningWindow.shape, Point(0, 0));
    warningWindow.bar = makeRect(401, 25, "#3b5998", 0, 1, 3);
    warningWindow.bar.render(warningWindow.shape, Point(0, -25.5));
    warningWindow.killButton=makeDeleteCross(10, 10, "#8b9dc3", 2);
    warningWindow.killButton.render(warningWindow.shape, Point(385, -18));
    warningWindow.killButton.shape.on('click', function(){warningWindow.erase()});
    warningWindow.killButton.shape.on("mouseover", function(evt)
               {
               warningWindow.killButton.changeColor("#ffffff");
               })
    warningWindow.killButton.shape.on("mouseout", function(evt)
               {
               warningWindow.killButton.changeColor('#8b9dc3'/*"#f0f0f0"*/);
               });
    var message = user.first_name + ": ";
    var message2 = msg;

    warningWindow.message1=makeTextWidget(message, 16, "Arial", "#666");
    warningWindow.message2=makeTextWidget(message2, 16, "Arial", "#666");
    warningWindow.message1.renderW(warningWindow, Point(10, 10));
    warningWindow.message2.renderW(warningWindow, Point(10, 40));

    warningWindow.render(topLayer.shape, Point(stageWidth/2-200, stageHeight/2-100));

    var okayButton = WidgetHL();
    okayButton.background = makeRect(100, 25, "red", 1, "black", 2);
    okayButton.background.renderW(okayButton, Point(0, 0));
    okayButton.text = makeTextWidget("OKAY", 20);
    okayButton.text.renderW(okayButton, Point(20, 0));
    okayButton.shape.on("mouseover", function(evt)
    {
       okayButton.background.changeColor("#ffffff");
    })
    okayButton.shape.on("mouseout", function(evt)
    {
       okayButton.background.changeColor('#8b9dc3'/*"#f0f0f0"*/);
    });
    okayButton.shape.on('click', function(){warningWindow.erase()});
    okayButton.renderW(warningWindow, Point(100, 100));
}
