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

bot.on('contactRelationUpdate', function (message) {
    if (message.action === 'add') {
        var name = message.user ? message.user.name : null;
        var reply = new builder.Message()
                .address(message.address)
                .text("Hello %s... Thanks for adding me. How can I help you? ", name || 'there');
        bot.send(reply);
    } else {
        // delete their data
    }
});


bot.endConversationAction('goodbye', 'Goodbye:)', { matches: /^.*bye/i });

//=========================================================
// Bots Dialogs
//=========================================================
var style = builder.ListStyle["button"];


// Create LUIS recognizer that points at our model and add it as the root '/' dialog for our Cortana Bot.
var model = 'https://api.projectoxford.ai/luis/v1/application?id=27980a6e-ec18-4fa5-bc3f-8a031eb74f4c&subscription-key=a5c9c598a1864e928073f34258f04e27';
// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(model);
var intents = new builder.IntentDialog({ recognizers: [recognizer] })

intents.matches(/^hello|hi/i, [
    function (session) {
        session.send("Hello, how can I help you?");
        session.endDialog("");
    }
]);

intents.matches(/^thank |thanks/i, [
    function (session) {
        session.send("You are welcome.");
        session.endDialog("");
    }
]);


intents.onBegin(function (session, args, next) {
    session.dialogData.name = args.name;
    session.send("Hi %s...", args.name);
    next();
});


intents.matches('FindActivity', [
    function (session, args, next) {
        // Process optional entities received from LUIS
        var match;
        var entity = builder.EntityRecognizer.findEntity(args.entities, 'car park');
        if (entity) {
            match = builder.EntityRecognizer.findBestMatch(tasks, entity.entity);
        }
        
        // Prompt for task name
        if (!match) {
            builder.Prompts.choice(session, "Cannot intepret", tasks);
        } else {
            next({ response: match });
        }
    },
    function (session, results) {
        if (results.response) {
           
            session.send("The nearest car park is TP21.");
        } else {
            session.send('Could not find any car park near you');
        }
    }
]);




  
intents.onDefault(function (session) {
        session.send("Sorry, I'm not sure what you mean. Could you rephrase your question or provide more details?");
		
    })	

bot.dialog('/', intents);

