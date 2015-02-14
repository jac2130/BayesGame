var winningsWindow = WidgetHL();
winningsWindow.background = makeRect(400, 200, '#EBEEF4'/*"#f0f0f0"*/, 0.5, 1, 3);

winningsWindow.background.render(winningsWindow.shape, Point(0, 0));
winningsWindow.bar = makeRect(401, 25, "#3b5998", 0, 1, 3);
winningsWindow.bar.render(winningsWindow.shape, Point(0, -25.5));
winningsWindow.killButton=makeDeleteCross(10, 10, "#8b9dc3", 2);
winningsWindow.killButton.render(winningsWindow.shape, Point(385, -18));
winningsWindow.killButton.shape.on('click', function(){winningsWindow.erase()});
winningsWindow.killButton.shape.on("mouseover", function(evt)
               {
                   winningsWindow.killButton.changeColor("#ffffff");
               })
winningsWindow.killButton.shape.on("mouseout", function(evt)
               {
                   winningsWindow.killButton.changeColor('#8b9dc3'/*"#f0f0f0"*/);
               });
var message=user.first_name + ", ";
var message2="";
if (totalWinnings > 0) {
    message2 += "won " + totalWinnings + " points."
}
else{
    message2 += "lost " + Math.abs(totalWinnings) + " points."
}
winningsWindow.message1 = makeTextWidget(message, 16, "Arial", "#666");
winningsWindow.message2 = makeTextWidget(message2, 16, "Arial", "#666");
winningsWindow.message1.renderW(winningsWindow, Point(10, 10));
winningsWindow.message2.renderW(winningsWindow, Point(10, 40));
