const SlackBot = require('slackbots');
const axios = require('axios');
const vke_token = 'Bearer eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJwYmFyYXRoaUB2bXdhcmUuY29tIiwiYXVkIjoicGJhcmF0aGlAdm13YXJlLmNvbSIsInNjb3BlIjoicnNfYWRtaW5fc2VydmVyIGF0X2dyb3VwcyBvcGVuaWQgb2ZmbGluZV9hY2Nlc3MgcnNfdm1kaXIgaWRfZ3JvdXBzIiwibXVsdGlfdGVuYW50IjpmYWxzZSwiaXNzIjoiaHR0cHM6XC9cL2xpZ2h0d2F2ZS52a2UuY2xvdWQudm13YXJlLmNvbVwvb3BlbmlkY29ubmVjdFwvYmZkN2E3NTEtYjJmNS00M2EzLWIyYjMtMGM4MmQ2ODk2YWVlIiwiZ3JvdXBzIjpbImJmZDdhNzUxLWIyZjUtNDNhMy1iMmIzLTBjODJkNjg5NmFlZVxcVktFU2VydmljZVVzZXJzIiwiYmZkN2E3NTEtYjJmNS00M2EzLWIyYjMtMGM4MmQ2ODk2YWVlXFxpbnRlcmVzdHdlYmRldiIsImJmZDdhNzUxLWIyZjUtNDNhMy1iMmIzLTBjODJkNjg5NmFlZVxcRXZlcnlvbmUiXSwidG9rZW5fY2xhc3MiOiJpZF90b2tlbiIsInRva2VuX3R5cGUiOiJCZWFyZXIiLCJleHAiOjE1MzQ1NzAyMjcsImlhdCI6MTUzNDUyNzAyNywianRpIjoiV2ZmOWUxd283Q005VTZ2eE42MmxIYkpZUXlHWmVtWXlJTDlrZXJINHZFdyIsInRlbmFudCI6ImJmZDdhNzUxLWIyZjUtNDNhMy1iMmIzLTBjODJkNjg5NmFlZSJ9.BlYeTZe8kI27eAbH_SmP6t2mXt69JM8D368R4oFodmUSu7rq9S4rfNCoq6HSBsjHmkpGvYUIdgmIYJ93bQv_XQh_wR8N8gvt4srXDX1KwMTQSNx-bP4D5CO7A0tCyqZpf_8O7-Ianjr9RHTxBlbyvpzZAGX87xSBBOtMOo6gMkzjasG-5kyiW3v75kHsyauDoh6anGp-CuXoSTSzffm6bs21c0rmiTa4Ta86Gpuftotf3FEfucKl7ATRpDptzNxWKv45nuU5e1PvyEcrn2XUgmbYkNEHNsNGRWCDxqZIUFz2pPtoB0GZcxg0qaypkgmbNGlUYA6SKHspRV2SiE3v0Q'

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

controller.hears(['Create 3 VKE Clusters called (.*)', 'Build VKE Cluster called (.*)'], 'direct_message,direct_mention,mention', function (bot, message) {
  let x = 2
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
          "folderName": "SharedFolder",
          "projectName": "SharedProject",
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

