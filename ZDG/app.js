const TG  = require('telegram-bot-api/lib/index.js');
const fs = require('fs');
const path = require('path');
const { Client, MessageMedia } = require('whatsapp-web.js');
const express = require('express');
const socketIO = require('socket.io');
const qrcode = require('qrcode');
const http = require('http');
const { phoneNumberFormatter } = require('./helpers/formatter');
const axios = require('axios');
const port = process.env.PORT || 8000;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

const BOT_TOKEN = process.env.BOT_TOKEN
if (!BOT_TOKEN) {
    console.log('Opps, you need to define your TG BOT_TOKEN')
}

const api = new TG({
    token: '1923286427:AAEAoy7E3bDhom3nJ3U5IFqCGqFbekpSwVk'
})

api.setMessageProvider(new TG.GetUpdateMessageProvider())
api.start()
.then(() => {
    console.log('TG API is started')
})
.catch(console.err)

app.get('/', (req, res) => {
  res.sendFile('index-multiple-device.html', {
    root: __dirname
  });
});

const sessions = [];
const SESSIONS_FILE = './whatsapp-sessions.json';

const createSessionsFileIfNotExists = function() {
  if (!fs.existsSync(SESSIONS_FILE)) {
    try {
      fs.writeFileSync(SESSIONS_FILE, JSON.stringify([]));
      console.log('Sessions file created successfully.');
    } catch(err) {
      console.log('Failed to create sessions file: ', err);
    }
  }
}

createSessionsFileIfNotExists();

const setSessionsFile = function(sessions) {
  fs.writeFile(SESSIONS_FILE, JSON.stringify(sessions), function(err) {
    if (err) {
      console.log(err);
    }
  });
}

const getSessionsFile = function() {
  return JSON.parse(fs.readFileSync(SESSIONS_FILE));
}

const createSession = function(id, description) {
  console.log('Creating session: ' + id);
  const SESSION_FILE_PATH = `./whatsapp-session-${id}.json`;
  let sessionCfg;
  if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionCfg = require(SESSION_FILE_PATH);
  }

  const client = new Client({
    restartOnAuthFail: true,
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process', // <- this one doesn't works in Windows
        '--disable-gpu'
      ],
    },
    session: sessionCfg
  });

  client.on('message', async msg => {
    if (msg.body.startsWith('!tgimagem ' )) {
      const args = msg.body.slice(10).split(' ');
      const tgId = args[0].includes('@') ? args[0] : `@${args[0]}`;
      msg.reply('Enviando imagem para o canal: ' + tgId + ' ' + args[1]);
       //Send photo
       api.sendPhoto({
        chat_id: tgId,
        caption: tgId,
        photo: args[1]
 
    })

    } if (msg.body.startsWith('!tgassunto ' )) {
      //msg.reply('enviando mensagem para o canal @pedrinhodanasa');
      let tgId = msg.body.split(' ')[1];
      let messageIndex = msg.body.indexOf(tgId) + tgId.length;
      let message = msg.body.slice(messageIndex, msg.body.length);
      tgId = tgId.includes('@') ? tgId : `@${tgId}`;
      msg.reply('Trocando título do Telegram: ' + tgId);
      //Send photo
      api.setChatTitle({
        chat_id: tgId,
        title: message
    })

    } if (msg.body.startsWith('!tgmsg ' )) {
      //msg.reply('enviando mensagem para o canal @pedrinhodanasa');
      let tgId = msg.body.split(' ')[1];
      let messageIndex = msg.body.indexOf(tgId) + tgId.length;
      let message = msg.body.slice(messageIndex, msg.body.length);
      tgId = tgId.includes('@') ? tgId : `@${tgId}`;
      msg.reply('Enviando mensagem para o canal: ' + tgId);

      // Send text message
      api.sendMessage({
          chat_id: tgId,
          text: message,
          parse_mode: 'Markdown'
          // reply_markup: {
          //     inline_keyboard: [
          //         [
          //             {
          //                 text: 'Comando enviado via WhatsApp',
          //                 url: 'https://zapdasgaláxias.com.br'}
          //         ]
          //     ]
          // }
      })

    } else if (msg.body == 'tt') {
      const chat = await msg.getChat();
      msg.reply("Mentioning everyone! (hidden)", null, {
        mentions: chat.participants.map(chat => chat.id._serialized)
      });
      msg.reply("Mentioning everyone! (not hidden)\n\n"+chat.participants.map(a => `@${a.id.user}`).join(""), null, {
        mentions: chat.participants.map(chat => chat.id._serialized)
      });
      } else if (msg.body.startsWith('!gr ')) {
        let number = msg.body.split(' ')[1];
        let messageIndex = msg.body.indexOf(number) + number.length;
        let message = msg.body.slice(messageIndex, msg.body.length);
        number = number.includes('@c.us') ? number : `${number}@c.us`;
        client.createGroup(message,[number]);
        // let chat = await msg.getChat();
        // let media = MessageMedia.fromFilePath("./image.png");
        // client.setProfilePicture(chat.id._serialized, media);
    } else if (msg.body.startsWith('!descricao ')) {
      // Change the group subject
      let newDescription = msg.body.slice(11);
      client.getChats().then(chats => {
          const groups = chats.filter(chat => chat.isGroup);
          if (groups.length == 0) {
            msg.reply('You have no group yet.');
          } else {
            groups.forEach((group, i) => {
              setTimeout(function() {
                  group.setDescription(newDescription);
                  },1000 + Math.floor(Math.random() * 4000) * (i+1) )    
            });
          }
        });
        } else if (msg.body.startsWith('!nasa ')) {
           // Change the group subject
           let newMsgZDG = msg.body.slice(6);
           client.getChats().then(chats => {
               const groups = chats.filter(chat => chat.isGroup);
               if (groups.length == 0) {
                 msg.reply('You have no group yet.');
               } else {
                 groups.forEach((group, i) => {
                   const participants = group.participants;
                       participants.forEach((participant, i) => {
                           const user = `${participant.id.user}@c.us`//.replace(/\D/g, '');
                           setTimeout(function() {
                           client.sendMessage(user,newMsgZDG);
                       },1000 + Math.floor(Math.random() * 4000) * (i+1)  )
                       });
                 });
               }
             });
      } else if (msg.body.startsWith('!enviarpara ')) {
          // Direct send a new message to specific id
          let number = msg.body.split(' ')[1];
          let messageIndex = msg.body.indexOf(number) + number.length;
          let message = msg.body.slice(messageIndex, msg.body.length);
          number = number.includes('@c.us') ? number : `${number}@c.us`;
          let chat = await msg.getChat();
          chat.sendSeen();
          client.sendMessage(number, message);
      } else if (msg.body.startsWith('!assunto ')) {
          // Change the group subject
          let newSubject = msg.body.slice(9);
          client.getChats().then(chats => {
              const groups = chats.filter(chat => chat.isGroup);
              if (groups.length == 0) {
                msg.reply('You have no group yet.');
              } else {
                groups.forEach((group, i) => {
                  setTimeout(function() {
                      group.setSubject(newSubject);
                      },1000 + Math.floor(Math.random() * 4000) * (i+1) ) 
                });
              }
            });
      }  else if (msg.body.includes('http')) {
        // Change the group subject
        const contact = await msg.getContact();
        msg.reply(`@${contact.number}` + ', ação não permitida. Você será removido de todos os grupos. Caso haja reincidência,você será banido do WhatsApp.');
        client.getChats().then(chats => {
            const groups = chats.filter(chat => chat.isGroup);
            if (groups.length == 0) {
              msg.reply('You have no group yet.');
            } else {
              groups.forEach((group, i) => {
                setTimeout(function() {
                    group.removeParticipants([`${contact.number}@c.us`]);
                    //group.setSubject(newSubject);
                    //msg.reply('Proibido' + msg.from);
                    //group.removeParticipants([msg.from]);
                    },1000 + Math.floor(Math.random() * 4000) * (i+1) ) 
              });
            }
          });
      } else if (msg.body.startsWith('!descricao ')) {
        // Change the group subject
        let newDescription = msg.body.slice(9);
        client.getChats().then(chats => {
            const groups = chats.filter(chat => chat.isGroup);
            if (groups.length == 0) {
              msg.reply('You have no group yet.');
            } else {
              groups.forEach((group, i) => {
                setTimeout(function() {
                    group.setDescription(newDescription);
                    },1000 + Math.floor(Math.random() * 1000) * (i+1) )    
              });
            }
          });
    } else if (msg.body.startsWith('!mensagem ')) {
          // Change the group subject
          let newMsgGroup = msg.body.slice(9);
          client.getChats().then(chats => {
              const groups = chats.filter(chat => chat.isGroup);
              if (groups.length == 0) {
                msg.reply('You have no group yet.');
              } else {
                groups.forEach((group, i) => {
                  setTimeout(function() {
                  group.sendMessage(newMsgGroup);
                  },1000 + Math.floor(Math.random() * 4000) * (i+1) )
                });
              }
            });
    } else if (msg.body.startsWith('!zdg ')) {
          // Change the group subject
          let newMsgZDG = msg.body.slice(5);
          client.getChats().then(chats => {
              const groups = chats.filter(chat => chat.isGroup);
              if (groups.length == 0) {
                msg.reply('You have no group yet.');
              } else {
                groups.forEach((group, i) => {
                  //setTimeout(function() {
                      const startt = async function(user) {
                          for(let participant of group.participants) {
                              const user = `${participant.id.user}@c.us`//.replace(/\D/g, '');
                              client.sendMessage(user,newMsgZDG);
                              }  
                          } 
                          startt();
                  //group.sendMessage(newMsgGroup);
                  //},5000 * (i+1) )
                });
              }
            });
      } else if (msg.body.startsWith('!fechargrupo')) {
          // Change the group subject
          client.getChats().then(chats => {
              const groups = chats.filter(chat => chat.isGroup);
              if (groups.length == 0) {
                msg.reply('You have no group yet.');
              } else {
                groups.forEach((group, i) => {
                  setTimeout(function() {
                      group.setMessagesAdminsOnly(true);  
                      },1000 + Math.floor(Math.random() * 10000) * (i+1) )
                });
              }
            });
      } else if (msg.body.startsWith('!abrirgrupo')) {
          // Change the group subject
          //let newDescription = msg.body.slice(9);
          client.getChats().then(chats => {
              const groups = chats.filter(chat => chat.isGroup);
              if (groups.length == 0) {
                msg.reply('You have no group yet.');
              } else {
                groups.forEach((group, i) => {
                  setTimeout(function() {
                      group.setMessagesAdminsOnly(false);
                      },1000 + Math.floor(Math.random() * 10000) * (i+1) )             
                });
              }
            });
    } else if (msg.body == 'good morning') {
      msg.reply('selamat pagi');
    } else if (msg.body == '!groups') {
      client.getChats().then(chats => {
        const groups = chats.filter(chat => chat.isGroup);
        if (groups.length == 0) {
          msg.reply('You have no group yet.');
        } else {
          let replyMsg = '*YOUR GROUPS*\n\n';
          groups.forEach((group, i) => {
            //let newDescription = msg.body.slice(6);
            group.setSubject("FIMMMM");
            replyMsg += `ID: ${group.id._serialized}\nName: ${group.name}\n\n`;
            group.sendMessage(msg.from, 'pong');
            group.setDescription("FIMMMM");
          });
          replyMsg += '_You can use the group id to send a message to the group._'
          msg.reply(replyMsg);
        }
      });
  } else if (msg.body.startsWith('!subject ')) {
      // Change the group subject
      let chat = await msg.getChat();
      if (chat.isGroup) {
          let newSubject = msg.body.slice(9);
          chat.setSubject(newSubject);
      } else {
          msg.reply('This command can only be used in a group!');
      }
  } else if (msg.body.startsWith('!desc ')) {
    // Change the group description
    let chat = await msg.getChat();
    if (chat.isGroup) {
        let newDescription = msg.body.slice(6);
        chat.setDescription(newDescription);
    } else {
        msg.reply('This command can only be used in a group!');
    }
  } 
  });

  client.initialize();

  client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.toDataURL(qr, (err, url) => {
      io.emit('qr', { id: id, src: url });
      io.emit('message', { id: id, text: 'QR Code received, scan please!' });
    });
  });

  client.on('ready', () => {
    io.emit('ready', { id: id });
    io.emit('message', { id: id, text: 'Whatsapp is ready!' });

    const savedSessions = getSessionsFile();
    const sessionIndex = savedSessions.findIndex(sess => sess.id == id);
    savedSessions[sessionIndex].ready = true;
    setSessionsFile(savedSessions);
  });

  client.on('authenticated', (session) => {
    io.emit('authenticated', { id: id });
    io.emit('message', { id: id, text: 'Whatsapp is authenticated!' });
    sessionCfg = session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function(err) {
      if (err) {
        console.error(err);
      }
    });
  });

  client.on('auth_failure', function(session) {
    io.emit('message', { id: id, text: 'Auth failure, restarting...' });
  });

  client.on('disconnected', (reason) => {
    io.emit('message', { id: id, text: 'Whatsapp is disconnected!' });
    fs.unlinkSync(SESSION_FILE_PATH, function(err) {
        if(err) return console.log(err);
        console.log('Session file deleted!');
    });
    client.destroy();
    client.initialize();

    // Menghapus pada file sessions
    const savedSessions = getSessionsFile();
    const sessionIndex = savedSessions.findIndex(sess => sess.id == id);
    savedSessions.splice(sessionIndex, 1);
    setSessionsFile(savedSessions);

    io.emit('remove-session', id);
  });

  // Tambahkan client ke sessions
  sessions.push({
    id: id,
    description: description,
    client: client
  });

  // Menambahkan session ke file
  const savedSessions = getSessionsFile();
  const sessionIndex = savedSessions.findIndex(sess => sess.id == id);

  if (sessionIndex == -1) {
    savedSessions.push({
      id: id,
      description: description,
      ready: false,
    });
    setSessionsFile(savedSessions);
  }
}

const init = function(socket) {
  const savedSessions = getSessionsFile();

  if (savedSessions.length > 0) {
    if (socket) {
      socket.emit('init', savedSessions);
    } else {
      savedSessions.forEach(sess => {
        createSession(sess.id, sess.description);
      });
    }
  }
}

init();

// Socket IO
io.on('connection', function(socket) {
  init(socket);

  socket.on('create-session', function(data) {
    console.log('Create session: ' + data.id);
    createSession(data.id, data.description);
  });
});

// io.on('connection', function(socket) {
//   socket.emit('message', 'Connecting...');

//   client.on('qr', (qr) => {
//     console.log('QR RECEIVED', qr);
//     qrcode.toDataURL(qr, (err, url) => {
//       socket.emit('qr', url);
//       socket.emit('message', 'QR Code received, scan please!');
//     });
//   });

//   client.on('ready', () => {
//     socket.emit('ready', 'Whatsapp is ready!');
//     socket.emit('message', 'Whatsapp is ready!');
//   });

//   client.on('authenticated', (session) => {
//     socket.emit('authenticated', 'Whatsapp is authenticated!');
//     socket.emit('message', 'Whatsapp is authenticated!');
//     console.log('AUTHENTICATED', session);
//     sessionCfg = session;
//     fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function(err) {
//       if (err) {
//         console.error(err);
//       }
//     });
//   });

//   client.on('auth_failure', function(session) {
//     socket.emit('message', 'Auth failure, restarting...');
//   });

//   client.on('disconnected', (reason) => {
//     socket.emit('message', 'Whatsapp is disconnected!');
//     fs.unlinkSync(SESSION_FILE_PATH, function(err) {
//         if(err) return console.log(err);
//         console.log('Session file deleted!');
//     });
//     client.destroy();
//     client.initialize();
//   });
// });

// Send message
app.post('/send-message', (req, res) => {
  const sender = req.body.sender;
  const number = phoneNumberFormatter(req.body.number);
  const message = req.body.message;

  const client = sessions.find(sess => sess.id == sender).client;

  client.sendMessage(number, message).then(response => {
    res.status(200).json({
      status: true,
      response: response
    });
  }).catch(err => {
    res.status(500).json({
      status: false,
      response: err
    });
  });
});


// Send media
app.post('/send-media', async (req, res) => {
  const sender = req.body.sender;
  const number = phoneNumberFormatter(req.body.number);
  const caption = req.body.caption;
  const fileUrl = req.body.file;

  let mimetype;
  const attachment = await axios.get(fileUrl, {
    responseType: 'arraybuffer'
  }).then(response => {
    mimetype = response.headers['content-type'];
    return response.data.toString('base64');
  });

  const media = new MessageMedia(mimetype, attachment, 'Media');
  
  const client = sessions.find(sess => sess.id == sender).client;

  client.sendMessage(number, media, {
    caption: caption
  }).then(response => {
    res.status(200).json({
      status: true,
      response: response
    });
  }).catch(err => {
    res.status(500).json({
      status: false,
      response: err
    });
  });
});

server.listen(port, function() {
  console.log('WP API running on *: ' + port);
});
