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
