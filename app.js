var builder = require('botbuilder');
var restify = require('restify');
var oxford = require('project-oxford'),client = new oxford.Client('1d57abfdd3ae474d883d28f7e5fea645');
var _Promise = require('bluebird');
//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: '1df75fc1-b66d-43a3-88fc-8a81ed963154',
    appPassword: '6537Ezm76Vs9f59PSsJnRvh'
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());


bot.endConversationAction('goodbye', 'Goodbye:)', { matches: /^.*bye/i });

//=========================================================
// LUIS Setup
//=========================================================


// Create LUIS recognizer that points at our model and add it as the root '/' dialog for our Cortana Bot.
var model = 'https://api.projectoxford.ai/luis/v1/application?id=27980a6e-ec18-4fa5-bc3f-8a031eb74f4c&subscription-key=a5c9c598a1864e928073f34258f04e27';
// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(model);
var intents = new builder.IntentDialog({ recognizers: [recognizer] });

//=========================================================
// FACE API
//=========================================================




intents.matches(/^hello|hi/i, [
    function (session) {
        session.send("Hello, how can I help you?");
        session.endDialog("");
    }
]);


intents.matches('FindActivity', [
    function (session, args, next) {
        // Process optional entities received from LUIS
        var match;
        session.send("in FindActivity");

      

        var entity = builder.EntityRecognizer.findEntity(args.entities, 'carpark');
        //session.send("entity is " +entity);

        if (!entity) {
            builder.Prompts.text(session, "Please try again later.");
        }else {
            next({ response: entity });
        }
    },
    function (session, results) {


        if (results.response) {
           
            session.send("The nearest car park is TP21.");
			builder.Prompts.attachment(session, "Thanks. Now upload a picture");
			/*
            var card = createHeroCard(session);
        
			var msg = new builder.Message(session).addAttachment(card);
            session.send(msg);
			*/
			
			
		


        } else {
            session.send('Could not find any car park near you');
        }
    },
	
	function(session, results) {
    var uploadedImage = results.response[0];
	session.send('hi');
    //session.send(JSON.stringify(results.response));
	//session.send(uploadedImage.contentUrl);
		
	downloadAttachments(session,connector,uploadedImage);
		

			
			
	
	}
]);



  
intents.onDefault(function (session) {
        session.send("Sorry, I'm not sure what you mean. Could you rephrase your question or provide more details?");
		
    })	

bot.dialog('/', intents);

function createHeroCard(session) {
    return new builder.HeroCard(session)
        .title('BotFramework Hero Card')
        .subtitle('Your bots — wherever your users are talking')
        .text('Build and connect intelligent bots to interact with your users naturally wherever they are, from text/sms to Skype, Slack, Office 365 mail and other popular services.')
        .images(getSampleCardImages(session))
        .buttons(getSampleCardActions(session));
}

function getSampleCardImages(session) {
    return [
        builder.CardImage.create(session, 'https://maps.googleapis.com/maps/api/staticmap?center=Brooklyn+Bridge,New+York,NY&zoom=13&size=600x300&maptype=roadmap&markers=color:blue%7Clabel:S%7C40.702147,-74.015794&markers=color:green%7Clabel:G%7C40.711614,-74.012318&markers=color:red%7Clabel:C%7C40.718217,-73.998284&key=AIzaSyDdB2NNyssfWkHWhJkqRKfHAuYKQdQA7LI')
    ];
}
function getSampleCardActions(session) {
    return [
        builder.CardAction.openUrl(session, 'https://maps.google.com/?q=HDB+HUB', 'Get Location')
    ];
}

var async = require('async');
var url = require('url');
var request = require('request');
var buffers = [];
function downloadAttachments(session,connector, message, callback) {
    var attachments = [];
    var containsSkypeUrl = true;
	
	

        async.waterfall([
            function (cb) {
               
                    connector.getAccessToken(cb);
                
                
            }
        ], function (err, token) {
            if (!err) {
            
                    var contentUrl = message.contentUrl;
				    var headers = {};
                   
                        headers['Authorization'] = 'Bearer ' + token;
                        headers['Content-Type'] = 'application/octet-stream';
                 
                    request({
                        url: contentUrl,
                        headers: headers,
						encoding:null,
                    }, function (err, res, body) {
                        if (!err && res.statusCode == 200) {
                            compareFaces(session, body);
						   
						
                        }
                        cb(err);
					    
						
                    });
               
            }
            else {
                if (callback)
                    callback(err, null);
            }
        });

}

function compareFaces(session, faceToCompare){
	
	/*
	var faceURL = 'https://api.projectoxford.ai/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false';
	var subscription = 'cbff8a55e6c4468b875f4042e4b087c2';
	
	
				    var headers = {};
                   
                        
                        headers['Content-Type'] = 'application/octet-stream';
						headers['Host'] = 'api.projectoxford.ai';
						headers['Ocp-Apim-Subscription-Key'] = subscription;
                 
                    request.post({
                        url: faceURL,
                        headers: headers,
						body:faceToCompare
                    }, function (err, res, body) {
                        if (!err && res.statusCode == 200) {
                            console.log('BODY:'+ body);
						   
						
                        }
                        //cb(err);
					    console.log('ERROR:'+ err);
						
                    });
	
	*/
	var checkFaces = [];
			
	//var compareFace64 = new Buffer(faceToCompare).toString('base64');
	var detects = [];
			
			detects.push(client.face.detect({
                    data: faceToCompare,
                    returnFaceId: true
                }).then(function(response) {
				   session.send('1'+response[0].faceId);
                    checkFaces.push(response[0].faceId);
                })
            );

            detects.push(client.face.detect({
                    path: 'image/juface2.jpg',
                    returnFaceId: true
                }).then(function(response) {
				   session.send('2'+response[0].faceId);
                    checkFaces.push(response[0].faceId);
                })
            );
			
			
			
			
			
			_Promise.all(detects).then(function() {
				
				session.send('3'+JSON.stringify(checkFaces));
					
					
					
				client.face.verify(checkFaces).then(function (response) {
					
                session.send('4'+JSON.stringify(response));
				
				});	
					
			
            });

	
}
