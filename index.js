const SlackBot = require('slackbots');
const axios = require('axios');
const vke_token = 'Bearer eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJwYmFyYXRoaUB2bXdhcmUuY29tIiwiYXVkIjoicGJhcmF0aGlAdm13YXJlLmNvbSIsInNjb3BlIjoicnNfYWRtaW5fc2VydmVyIGF0X2dyb3VwcyBvcGVuaWQgb2ZmbGluZV9hY2Nlc3MgcnNfdm1kaXIgaWRfZ3JvdXBzIiwibXVsdGlfdGVuYW50IjpmYWxzZSwiaXNzIjoiaHR0cHM6XC9cL2xpZ2h0d2F2ZS52a2UuY2xvdWQudm13YXJlLmNvbVwvb3BlbmlkY29ubmVjdFwvYmZkN2E3NTEtYjJmNS00M2EzLWIyYjMtMGM4MmQ2ODk2YWVlIiwiZ3JvdXBzIjpbImJmZDdhNzUxLWIyZjUtNDNhMy1iMmIzLTBjODJkNjg5NmFlZVxcVktFU2VydmljZUFkbWluaXN0cmF0b3JzIiwiYmZkN2E3NTEtYjJmNS00M2EzLWIyYjMtMGM4MmQ2ODk2YWVlXFxpbnRlcmVzdHdlYmRldiIsImJmZDdhNzUxLWIyZjUtNDNhMy1iMmIzLTBjODJkNjg5NmFlZVxcdmNzLWN0cyIsImJmZDdhNzUxLWIyZjUtNDNhMy1iMmIzLTBjODJkNjg5NmFlZVxcRXZlcnlvbmUiXSwidG9rZW5fY2xhc3MiOiJpZF90b2tlbiIsInRva2VuX3R5cGUiOiJCZWFyZXIiLCJleHAiOjE1MzUwNzcwMDgsImlhdCI6MTUzNTAzMzgwOCwianRpIjoid3dCNmQya1kxRVhUMlBVX3RQV2pHMjdJNHNNSkROMWtDMndZYVlQamlpWSIsInRlbmFudCI6ImJmZDdhNzUxLWIyZjUtNDNhMy1iMmIzLTBjODJkNjg5NmFlZSJ9.e18mAPy65A_sD2GzAl5FdgOVwy9hvu29u0Gyo-Dmkv1AYx1ZYFcB52VfNWUy3dSMoJsvRj1sj3LX9GnrVBGecIvGTpnmrGnHLvCnjKQyJT9G3MOWgU9fX79c_JBQH9rJ1JKApMrnk94cGGH0fUKuSL8k2W8eVBXgqQ00jXXTwaVjQrKJmK6Dx4setqO49OIt0djYhrItmrf3hQZKieNCLlKhuvBeV4JgbIxaCqkH7xY6RmSktMKDe3O804MqKhBBcxBIM5M-MIhLkIYDfwoPgd9IJLnNqqwtWwtlrVC4eCHbw1FKTxBqfb7SbL-SgRe5zXvEH_yP44eN2VqGj7ko-g'

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
    .spawn({
      token: data
    })
    .startRTM(function (err) {
      if (err) {
        throw new Error(err)
      }
    })
})

var controller = Botkit.slackbot({
  debug: false
})

var bot = new SlackBot({
  token: slackToken,
})

controller.hears('ask fitcycle', 'direct_message,direct_mention', function fitcycle(bot, message) {
  axios.get('http://13.56.14.98/api/v1.0/signups')
    .then(res => {
      const allusers = res.data.polls_prospect;
      var jsonData = JSON.stringify(allusers)
      var fs = require('fs');
      fs.writeFile("test.json", jsonData, function (err) {
        if (err) {
          console.log(err);
        }
      });
      const first_name = res.data.polls_prospect[1].firstname;
      const last_name = res.data.polls_prospect[1].lastname
      console.log(first_name)
      console.log(last_name)
      bot.reply(message, `The Winner is ${first_name} ${last_name}`)
    })
})

controller.hears(['Create 3 VKE Clusters in folder interestwebsite, project devb called (.*)', 'Build VKE Cluster called (.*)'], 'direct_message,direct_mention,mention', function (bot, message) {
  var ipadd = message.match[1];
  var config = {
    headers: {
      'Authorization': vke_token
    }
  };

  controller.storage.users.get(message.user, function (err, user) {
    if (!user) {
      user = {
        id: message.user,
      };
    }
    user.ipadd = ipadd;
    console.log(message)
    controller.storage.users.save(user, function (err, id) {
      bot.reply(message, 'Got it. I will create cluster called ' + user.ipadd + ' for you.')
      
      var built_clusters = 0

      while (built_clusters < 3) { 
      axios.post('https://api.vke.cloud.vmware.com//v1/orgs/bfd7a751-b2f5-43a3-b2b3-0c82d6896aee/clusters?region=us-west-2', {
          "name": `${ipadd}`+`-${built_clusters}`,
          "displayName": `${ipadd}`+`-${built_clusters}`,
          "folderName": "interestwebsite",
          "projectName": "devb",
          "serviceLevel": "DEVELOPER",
          "networking": {
            "networkingTenancy": "SHARED"
          },
          "version": "1.10.2-59"
        }, config)
        .then(res => {
          const cluster_operations = res.data.operation;
          console.log(cluster_operations)
          bot.reply(message, 'Success! Creating VKE Cluster, Status is' + cluster_operations)
          
        })
        built_clusters++ } 
    });
  });
});

