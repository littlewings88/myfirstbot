var builder = require('botbuilder');
var restify = require('restify');

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

// Create LUIS recognizer that points at our model and add it as the root '/' dialog for our Cortana Bot.
var model = 'https://api.projectoxford.ai/luis/v1/application?id=27980a6e-ec18-4fa5-bc3f-8a031eb74f4c&subscription-key=a5c9c598a1864e928073f34258f04e27';
// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var intents = new builder.IntentDialog({ recognizers: [recognizer] })
    .matches('FindActivity', [
        function (session, args, next) {
         

            // try extracting entities
            var cityEntity = builder.EntityRecognizer.findEntity(args.entities, 'location');
           
            if (cityEntity) {
                // city entity detected, continue to next step
                session.dialogData.searchType = 'location';
                next({ response: cityEntity.entity });
            }  else {
                // no entities detected, ask user for a destination
                builder.Prompts.text(session, 'Could not detect a location');
            }
        },
        function (session, results) {
            var destination = results.response;

            var message = 'Looking for carpark';
            if (session.dialogData.searchType === 'airport') {
                message += ' near %s airport...';
            } else {
                message += ' in %s...';
            }

            session.send(message, destination);

            var message = new builder.Message()
                        .attachmentLayout(builder.AttachmentLayout.carousel)
                        .attachments(cityEntity.map(hotelAsAttachment));

                    session.send(message);

                    // End
                    session.endDialog();

            
        }
    ])

  
    .onDefault((session) => {
        session.send('Sorry, I did not understand \'%s\'. ', session.message.text);
    });

bot.dialog('/', intents);

// Helpers
function hotelAsAttachment(hotel) {
    return new builder.HeroCard()
        .buttons([
            new builder.CardAction()
                .title('More details')
                .type('openUrl')
                .value('https://www.bing.com/search?q=' + encodeURIComponent(cityEntity.location))
        ]);
}

function reviewAsAttachment(review) {
    return new builder.ThumbnailCard()
        .title(review.title)
        .text(review.text)
        .images([new builder.CardImage().url(review.image)])
}