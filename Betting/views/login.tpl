<!DOCTYPE html>

<html>
  <head>
    <title>Login</title>
    <style type="text/css">
      .label {text-align: right}
      .error {color: red}
    </style>
    <script src="http://code.jquery.com/jquery-1.11.0.min.js"></script>
  </head>

  <body>
<script>
      var user={}
      window.fbAsyncInit = function() 
      {
      FB.init(
      {
          appId      : '753236104711327',
          status     : true,
          xfbml      : true
       }
      );
	
	FB.login(function(response) 
      {
      if (response.authResponse) 
      {
      uid =response.authResponse.userID
      
      console.log('Welcome!  Fetching your information.... ');
      FB.api('/me', function(response) 
      {
      console.log(response);
      
      user=response;
      user.bets=[];
      //user.key='value';
      //user.key2='value2';

      function welcomePlayer(user) {
    var myWindow = window.open("", user.id, "width=300, height=300, menubar=0, scrollbars=0, location=0, resizable=0, titlebar=0");
    myWindow.document.write("<head><title>"+user.name+"</title></head><body><p><img src='https://graph.facebook.com/" + uid + "/picture?width=96&height=96' width='96' height='96'></p><p>Welcome, "+user.name +"!</p></body>");
};
      

      $.ajax({
    type: "post",
    url: '/ajax/login',
    async: true,
    data:JSON.stringify(user),
    dataType: "json",
    contentType: "application/json",
    success: function(user){alert(user.name)} 
    
});


     
      welcomePlayer(user);
      //console.log("welcome" + " " + uid)
      //var welcomeMsgContainer=Object.create(Widget);
      //welcomeMsgContainer.setShape(new createjs.Container());
      //welcomeMsgContainer.bkgdRect = makeRect(600, 120, "#fffff0", 3, "#666");
      //welcomeMsgContainer.bkgdRect.renderW(welcomeMsgContainer, {x:-10, y:0});
      //var  = document.createElement('div');
      var welcomeMsgStr = 'Welcome, ' + response.first_name + '!';
      //var welcomeMsg=makeTextWidget(welcomeMsgStr, 20, "Arial", "#666");
      //welcomeMsg.id = 'welcome_msg';

		    //welcomeMsg.renderW(welcomeMsgContainer, {x:10, y:10});
		    
      
      //welcomeMsg.innerHTML = welcomeMsgStr;
      
      //welcomeMsgContainer.appendChild(welcomeMsg);

      //var imageURL = 'https://graph.facebook.com/' + uid + '/picture?width=96&height=96';
      //var profileImage = new createjs.Bitmap(imageURL);;
      //profileImage.setAttribute('src', imageURL);
      //profileImage.id = 'welcome_img';
      //profileImage.setBounds(,0, '48px', '48px'); 
      //profileImage.setAttribute('width', '148px');
      //welcomeMsgContainer.appendChild(profileImage);
      //console.log(profileImage)
      //profileImage.suppressCrossDomainErrors=true;
      //profileImage.isVisible=welcomeMsgContainer.isVisible;
      //welcomeMsgContainer.shape.addChild(profileImage);
      //welcomeMsgContainer.render(topLayer.shape, {x:315, y:50});
});


   
} 
      else 
      {
     console.log('User cancelled login or did not fully authorize.');
      }
 }, {scope: 'user_birthday, friends_birthday, basic_info, user_about_me, friends_about_me, user_education_history, friends_education_history, user_hometown, friends_hometown, user_interests, friends_interests, user_location, friends_location, user_questions, friends_questions, user_relationships, friends_relationships, user_relationship_details, friends_relationship_details, user_religion_politics, friends_religion_politics, user_work_history, friends_work_history'});
}; 
      (function(d, s, id){
         var js, fjs = d.getElementsByTagName(s)[0];
         if (d.getElementById(id)) {return;}
         js = d.createElement(s); js.id = id;
         js.src = "//connect.facebook.net/en_US/all.js";
         fjs.parentNode.insertBefore(js, fjs);
       }(document, 'script', 'facebook-jssdk'));
      
    </script>

  </body>

</html>
