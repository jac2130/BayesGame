truth=[]; 
user={}; //should be global variables. 
//alert(JSON.stringify(GraphJson))
friendCache = {};
global_graphJson = {};
facebookLogin = function() 
{
    FB.init(
    {
        appId      : '753236104711327',
        frictionlessRequests: true,
        status     : true,
        cookie     : true,
        xfbml      : true,
        version    : 'v2.1'
    });
        
    //FB.login(function(response) 
    //{
    //    if (response.authResponse) 
    //    {
	//	    uid =response.authResponse.userDI
	//	    FB.api('/me', function(response) 
	//		{
    //            user=response;   
	//		    model={};
	//		    model.id = user.id
	//		    model[user.id]= global_graphJson;
	//		    getMe(180, 180);
	//		    //welcome();

	//		    //alert(JSON.stringify(model))
	//		    //the "model" variable 
	//		    //represents the initial (default) model of the user, 
	//		    //which the user modifies in the course of the game.
	//		    //Each time that the user's model is modified, 
	//		    //the model is sent back to the server, where it is 
	//		    //tagged with a time stamp and inserted into a mongodb 
	//		    //data base.  
	//		    //Out of this database, a seperate program then
	//		    //pulls
	//		    //the most recent model for each of k people 
	//		    //in a k-group. These are k people who have 
	//		    //been assigned by some treatment mechanism,
	//		    //to see each other's bets and to 
	//		    //thus--by my definition of k-group--belong 
	//		    //to such.
	//		    //Further, this program then, calculates the
	//		    //diversity of time t (as defined in the above,  
	//		    //overlapping generations data model). 
	//		    //The diversity is then calculated
	//		    //and posted as the next data point in a time series
	//		    //on the analysis website: 
	//		    //http://bettingisbelieving.com/analysis.
	//		    //On this same website,
	//		    //a distance matrix between all k models is also
	//		    //posted, with 
	//		    //the modeler's facebook fotos as column and 
	//		    //row names. The latter, serves as a  
	//		    //further treatment, which can be 
	//		    //turned on and off for a group. 
	//		    //If they have access to the analysis website 
	//		    //of their group
	//		    //participants and all others
	//		    //can then click through time to see 
	//		    //the evolution of distance matrices, along with the
	//		    //overall diversity measure for the group. 
	//		    //Performance measures
	//		    //will also be added (as soon as I have the 
	//		    //algorithms worked out).
	//		    //send first the user:
	//		    $.ajax({
	//		        type: "post",
	//		        url: '/ajax/login',
	//		        async: true,
	//		        data:JSON.stringify(user),
	//		        dataType: "json",
	//		        contentType: "application/json",
	//		        success: function(user){alert(user.name)} 
    //
	//		    });
	//		    //then his model:
	//		    $.ajax({
	//		        type: "post",
	//		        url: '/ajax/model',
	//		        async: true,
	//		        data:JSON.stringify(model),
	//		        dataType: "json",
	//		        contentType: "application/json",
	//		        success: function(user){alert(user.name)} 
    //
	//		    });

	//		    $.ajax({
	//		        type: "post",
	//		        url: '/ajax/new_user_points/' + user.id,
	//		        async: true,
	//		        //data:JSON.stringify({}),
	//		        dataType: "json",
	//		        contentType: "application/json",
	//		        success: function(user){alert(user.name)} 
    //
	//		    });
	//		
	//		    $.ajax({
	//		        type: "GET",
	//		        url: '/ajax/truth',
	//		        async: true,
	//		        
	//		        dataType: "json",
	//		        success: function(data){
	//		    	if (data) 
	//		    	{
	//		    	    truth = truth.concat(data);
    //                    if (truth[truth.length-1]['monty_door']==='A')
    //                    {
    //                        share_door='B';
    //                    }
    //                    else
    //                    {
    //                        share_door='A';
    //                    }
	//		    	    //var dataWindow = makeDataWindow(truth, ['A', 'B', 'C'], variables, stageWidth-250);

	//		    	    //var dataButton = makeContractedButton(dataWindow);
	//		    	    //dataButton.render(stage, {x:dataWindow.xPos, y:stageHeight-25})
	//		    	    //var betsWindow = makeCallWindow([], ['A', 'B', 'C'], variables[variables.length-1], stageWidth-500);

	//		    	    ////the last variable must always be the betting variable!
    //                    ////MARK1
	//		    	    //var betButton=makeContractedButton(betsWindow);
	//		    	    //betButton.render(stage, {x:betsWindow.xPos, y:stageHeight-25});
	//		    	    //
	//		    	    //var putsWindow = makePutWindow([], ['A', 'B', 'C'], variables[variables.length-1], stageWidth-750);

	//		    	    ////the last variable must always be the betting variable!
	//		    	    //var putButton = makeContractedButton(putsWindow);
	//		    	    //putButton.render(stage, {x:putsWindow.xPos, y:stageHeight-25});
	//		    	    

	//		    	} 
	//		    	else
	//		    	{
	//		    	    alert("the truth is missing!");
	//		    	}
	//		    	
	//		        }
	//		        
	//		    });
	//		    

	//		    });
	//	    //alert(user.first_name);
	//	    
	//	 }
	//	 else 
	//	 {
	//	     console.log('User cancelled login or did not fully authorize.');
	//	 }
    // }, 
	// {scope: 'user_birthday, friends_birthday, public_profile,user_friends, user_about_me, friends_about_me, user_education_history, friends_education_history, user_hometown, friends_hometown, user_interests, friends_interests, user_location, friends_location, user_questions, friends_questions, user_relationships, friends_relationships, user_relationship_details, friends_relationship_details, user_religion_politics, friends_religion_politics, user_work_history, friends_work_history'});
}; 
(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/all.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
     
function getMe(width, height) 
{
    FB.api('/me', 
	{fields: 'id,name, picture.width(' + width + ').height(' + height + ')'}, 
	function(response)
	{
	    if( !response.error ) 
	    {
		
		//friendCache.me = response;
		//photo_url = friendCache.me.picture.data.url
		$.ajax({
		    type: "post",
		    url: '/ajax/picture',
		    async: true,
		    data:JSON.stringify({'id':response.id, 'url':response.picture.data.url, 'width':width, 'height':height}),
		    dataType: "json",
		    contentType: "application/json",
		    success: function(){} 
    
		});
		
	    } 
	    else 
	    {
            console.error('/me', response);
	    }
	});
}

//a convenience method for sending challenges:

function sendChallenge(to, message, callback) {
  var options = {
    method: 'apprequests'
  };
  if(to) options.to = to;
  if(message) options.message = message;
  FB.ui(options, function(response) {
    if(callback) callback(response);
  });
}
