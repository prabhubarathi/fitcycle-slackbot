const SlackBot = require('slackbots') ;
const axios = require('axios');

var Botkit = require('botkit')
var fs = require('fs')
var slackToken = 'xoxb-386509464003-401409504435-gNZiKPgqCEXoJwfDI9nniyAU' //Replace Slack Token

if (!process.env.slack_token_path) {
    console.log('Error: Specify slack_token_path in environment')
    process.exit(1)
  }
  
  fs.readFile(process.env.slack_token_path, function (err, data) {
    if (err) {
      console.log('Error: Specify token in slack_token_path file')
      process.exit(1)
    }
    data = String(data)
    data = data.replace(/\s/g, '')
    controller
      .spawn({token: data})
      .startRTM(function (err) {
        if (err) {
          throw new Error(err)
        }
      })
  })

  var controller = Botkit.slackbot({debug: false})

var bot = new SlackBot ({
    token: slackToken,
})

controller.hears('ask fitcycle','direct_message,direct_mention', function fitcycle(bot,message) {
    axios.get ('http://13.56.14.98/api/v1.0/signups')
      .then(res => {
          const allusers= res.data.polls_prospect;
          var jsonData=JSON.stringify (allusers)
          var fs = require('fs');
          fs.writeFile("test.json", jsonData, function(err) {
              if (err) {
                  console.log(err);
              }
          });
          const first_name = res.data.polls_prospect[1].firstname;
          const last_name = res.data.polls_prospect[1].lastname
          console.log(first_name)
          console.log(last_name)
        bot.reply(message,`The Winner is ${first_name} ${last_name}` )
        }
    )
})