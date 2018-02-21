const line = require('@line/bot-sdk');
const express = require('express');
const fs = require('fs');

const path = require('path');
const cp = require('child_process');


var fileURL = null;
var RichMenuId = null;
var RichMenuOnOff = false;

var input_OriginalImageURL = null;
var input_PreviewImageURL = null;

var startcount = 0;

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || defaultAccessToken,
  channelSecret: process.env.CHANNEL_SECRET || defaultSecret,
};

// base URL for webhook server
const baseURL = process.env.BASE_URL || defaultbaseURL;

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// serve static and downloaded files
app.use('/static', express.static('static'));
app.use('/downloaded', express.static('downloaded'));

// webhook callback
app.post('/callback', line.middleware(config), (req, res) => {
  // req.body.events should be an array of events
  if (!Array.isArray(req.body.events)) {
    return res.status(500).end();
  }

  // handle events separately
  Promise.all(req.body.events.map(handleEvent))
    .then(() => res.end())
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
  console.log('1 webHook');
});

/*
 * client.getRichMenuList() .then((menus) => // clean existing menus
 * Promise.all(menus.map(menu => client.deleteRichMenu(menu.richMenuId))) )
 * .then(() => // create new client.createRichMenu({ size: { width: 2500,
 * height: 1686, }, selected: true, name: 'nice richmenu', chatBarText: 'touch
 * me', areas: [{ bounds: { x: 0, y: 0, width: 2500, height: 1686, }, action: {
 * type: 'message', text: 'from rich menu', }, }] }) ) .then((RMid) => {
 * console.log(RMid); console.log('2 RichMenu');
 * 
 * RichMenuId = RMid; // set image client.setRichMenuImage(RMid,
 * createReadStream('./controller_01.png')) // download image .then(() =>
 * client.getRichMenuImage(RMid)) .then((readable) =>
 * readable.pipe(createWriteStream('downloaded.png'))) });
 */


// simple reply function
const replyText = (token, texts) => {
  texts = Array.isArray(texts) ? texts : [texts];
  return client.replyMessage(
    token,
    texts.map((text) => ({ type: 'text', text }))
  );
};


// callback function to handle a single event
function handleEvent(event) {
  switch (event.type) {
    case 'message':
      const message = event.message;
      switch (message.type) {
        case 'text':
          return handleText(message, event.replyToken, event.source);
        case 'image':
          return handleImage(message, event.replyToken);
        case 'video':
          return handleVideo(message, event.replyToken);
        case 'audio':
          return handleAudio(message, event.replyToken);
        case 'location':
          return handleLocation(message, event.replyToken);
        case 'sticker':
          return handleSticker(message, event.replyToken);
        default:
          throw new Error(`Unknown message: ${JSON.stringify(message)}`);
      }

    case 'follow':
      return replyText(event.replyToken, 'Got followed event');

    case 'unfollow':
      return console.log(`Unfollowed this bot: ${JSON.stringify(event)}`);

    case 'join':
      return replyText(event.replyToken, `Joined ${event.source.type}`);

    case 'leave':
      return console.log(`Left: ${JSON.stringify(event)}`);

    case 'postback':
      let data = event.postback.data;
      if (data === 'DATE' || data === 'TIME' || data === 'DATETIME') {
        data += `(${JSON.stringify(event.postback.params)})`;
      }
      return replyText(event.replyToken, `Got postback: ${data}`);

    case 'beacon':
      return replyText(event.replyToken, `Got beacon: ${event.beacon.hwid}`);

    default:
      throw new Error(`Unknown event: ${JSON.stringify(event)}`);
  }
}

function handleText(message, replyToken, source) {
  const buttonsImageURL = `${baseURL}/static/buttons/1040.jpg`;
  const videoURL = `${baseURL}/static/video/`;
  const audioURL = `${baseURL}/static/audio/`;
  const imageURL = `${baseURL}/static/buttons/`;
  
  if(message.text.indexOf("어디") != -1) {
	  if(message.text.indexOf("화장실") != -1) {
		  return client.replyMessage(
				  replyToken,
				  {
					  "type": "text",
					  "text": "화장실 없다."
				  }
		  );
	  }
	  else if(message.text.indexOf("컴퓨터") != -1) {
		  return client.replyMessage(
				  replyToken,
				  {
					  "type": "text",
					  "text": "컴퓨터 없다."
				  }
		  );
	  }
  }
  
  switch (message.text) {
  	case '텍스트메세지':
  	case 'Textmessage':
  	case 'textmessage':
  		return client.replyMessage(
  				replyToken,
  				{
  					"type": "text",
  					"text": "Hello World!⏪"
  				}
  		);

  	case '챗봇':
  	case 'chatbot':
  	case 'Chatbot':
  		return client.replyMessage(
  				replyToken,
  				{
  					"type": "text",
  					"text": "https://line.me/R/nv/recommendOA/@asm0860f"
  				}
  		);
  		
  	case '챗봇2':
  	case 'chatbot2':
  	case 'Chatbot2':
  		return client.replyMessage(
  				replyToken,
  				{
  					"type": "text",
  					"text": "line://nv/recommendOA/@asm0860f"
  				}
  		);
  
  	case '챗봇3':
  	case 'chatbot3':
  	case 'Chatbot3':
  		return client.replyMessage(
  				replyToken,
  				{
  					"type": "text",
  					"text": "line://ti/p/@asm0860f"
  				}
  		);
  
    case '프로필':
    case 'Profile':
    case 'profile':
      if (source.userId) {
        return client.getProfile(source.userId)
          .then((profile) => replyText(
            replyToken,
            [
              `Display name: ${profile.displayName}`,
              `Status message: ${profile.statusMessage}`,
            ]
          ));
      } else {
        return replyText(replyToken, 'Bot can\'t use profile API without user ID');
      }
    case '버튼':
    case 'Buttons':
    case 'buttons':
      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'Buttons alt text',
          template: {
            type: 'buttons',
            thumbnailImageUrl: buttonsImageURL,
            title: 'My button sample',
            text: 'Hello, my button',
            actions: [
              { label: '1:1 채팅하기', type: 'uri', uri: 'line://ti/p/@asm0860f' },
              { label: 'Say hello1', type: 'postback', data: 'hello 라인' },
              { label: 'hello2', type: 'postback', data: 'hello 라인', text: 'hello 라인' },
              { label: 'Say message', type: 'message', text: 'Rice=쌀' },
            ],
          },
        }
      );

    case '버튼2':
    case 'Buttons2':
    case 'buttons2':
      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'Buttons alt text',
          template: {
            type: 'buttons',
            "thumbnailImageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Rotating_earth_%28large%29.gif/300px-Rotating_earth_%28large%29.gif",
            title: 'My button sample',
            text: 'Hello, my button',
            actions: [
              { label: 'Go to line.me', type: 'uri', uri: 'https://line.me' },
              { label: 'Say hello1', type: 'postback', data: 'hello 라인' },
              { label: 'hello2', type: 'postback', data: 'hello 라인', text: 'hello 라인' },
              { label: 'Say message', type: 'message', text: 'Rice=쌀' },
            ],
          },
        }
      );

    case '버튼3':
    case 'Buttons3':
    case 'buttons3':
      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'Buttons alt text',
          template: {
            type: 'buttons',
            "thumbnailImageUrl": "https://upload.wikimedia.org/wikiped",
            title: 'My button sample',
            text: 'Hello, my button',
            actions: [
              { label: 'Go to line.me', type: 'uri', uri: 'https://line.me' },
              { label: 'Say hello1', type: 'postback', data: 'hello 라인' },
              { label: 'hello2', type: 'postback', data: 'hello 라인', text: 'hello 라인' },
              { label: 'Say message', type: 'message', text: 'Rice=쌀' },
            ],
          },
        }
      );

    case '확인':
    case 'Confirm':
    case 'confirm':
      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'Confirm alt text',
          template: {
            type: 'confirm',
            text: 'Do it?',
            actions: [
              { label: 'Yes', type: 'message', text: 'Yes!' },
              { label: 'No', type: 'message', text: 'No!' },
            ],
          },
        }
      )
    case '카로셀':
    case 'Carousel':
    case 'carousel':
      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'Carousel alt text',
          template: {
            type: 'carousel',
            columns: [
              {
                thumbnailImageUrl: buttonsImageURL,
                title: 'hoge',
                text: 'fuga',
                actions: [
                  { label: 'Go to line.me', type: 'uri', uri: 'https://line.me' },
                  { label: 'Say hello1', type: 'postback', data: 'hello 라인' },
                ],
              },
              {
                thumbnailImageUrl: buttonsImageURL,
                title: 'hoge',
                text: 'fuga',
                actions: [
                  { label: 'hello2', type: 'postback', data: 'hello 라인', text: 'hello 라인' },
                  { label: 'Say message', type: 'message', text: 'Rice=쌀' },
                ],
              },
            ],
          },
        }
      );

    case '카로셀2':
    case 'Carousel2':
    case 'carousel2':
      return client.replyMessage(
        replyToken,
        {
  	"type": "template",
  	"altText": "Carousel alt text",

  	"template": {
  		"type": "carousel",
  		"columns": [
    	{
       	"thumbnailImageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Rotating_earth_%28large%29.gif/300px-Rotating_earth_%28large%29.gif",
        "title": "Title",
        "text": "Text",
        "actions": [
          {
            "type": "message",
            "label": "Action 1",
            "text": "Action 1"
          },
          {
            "type": "message",
            "label": "Action 2",
            "text": "Action 2"
          },
          {
            "type": "message",
            "label": "Action 3",
            "text": "Action 3"
          }
        ]
      },
      {
        "thumbnailImageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Rotating_earth_%28large%29.gif/300px-Rotating_earth_%28large%29.gif",
        "title": "Title",
        "text": "Text",
        "actions": [
          {
            "type": "message",
            "label": "Action 1",
            "text": "Action 1"
          },
          {
            "type": "message",
            "label": "Action 2",
            "text": "Action 2"
          },
          {
            "type": "message",
            "label": "Action 3",
            "text": "Action 3"
          }
        ]
      },
      {
        "thumbnailImageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Rotating_earth_%28large%29.gif/300px-Rotating_earth_%28large%29.gif",
        "title": "Title",
        "text": "Text",
        "actions": [
          {
            "type": "message",
            "label": "Action 1",
            "text": "Action 1"
          },
          {
            "type": "message",
            "label": "Action 2",
            "text": "Action 2"
          },
          {
            "type": "message",
            "label": "Action 3",
            "text": "Action 3"
          }
        ]
      },
      {
        "thumbnailImageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Rotating_earth_%28large%29.gif/300px-Rotating_earth_%28large%29.gif",
        "title": "Title",
        "text": "Text",
        "actions": [
          {
            "type": "message",
            "label": "Action 1",
            "text": "Action 1"
          },
          {
            "type": "message",
            "label": "Action 2",
            "text": "Action 2"
          },
          {
            "type": "message",
            "label": "Action 3",
            "text": "Action 3"
          }
        ]
      },
      {
        "thumbnailImageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Rotating_earth_%28large%29.gif/300px-Rotating_earth_%28large%29.gif",
        "title": "Title",
        "text": "Text",
        "actions": [
          {
            "type": "message",
            "label": "Action 1",
            "text": "Action 1"
          },
          {
            "type": "message",
            "label": "Action 2",
            "text": "Action 2"
          },
          {
            "type": "message",
            "label": "Action 3",
            "text": "Action 3"
          }
        ]
      }
    ]
  }
}      );

    case '카로셀3':
    case 'Carousel3':
    case 'carousel3':
      return client.replyMessage(
        replyToken,
        {
  "type": "template",
  "altText": "Carousel alt text",

  "template": {
    "type": "carousel",
    "columns": [
      {
        "thumbnailImageUrl": null,
        "title": "Title",
        "text": "Text",
        "actions": [
          {
            "type": "message",
            "label": "Action 1",
            "text": "Action 1"
          },
          {
            "type": "message",
            "label": "Action 2",
            "text": "Action 2"
          },
          {
            "type": "message",
            "label": "Action 3",
            "text": "Action 3"
          }
        ]
      }
    ]
  }
}      );


    case '카로셀4':
    case 'Carousel4':
    case 'carousel4':
      return client.replyMessage(
        replyToken,
        {
  "type": "template",
  "altText": "Carousel alt text",

  "template": {
    "type": "carousel",
    "columns": [
      {
        "thumbnailImageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Rotating_earth_%28large%29.gif/300px-Rotating_earth_%28large%29.gif",
        "title": "Title",
        "text": "Text",
        "actions": [
          {
            "type": "message",
            "label": "Action 1",
            "text": "Action 1"
          },
          {
            "type": "message",
            "label": "Action 2",
            "text": "Action 2"
          },
          {
            "type": "message",
            "label": "Action 3",
            "text": "Action 3"
          }
        ]
      },
      {
        "thumbnailImageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Rotating_earth_%28large%29.gif/300px-Rotating_earth_%28large%29.gif",
        "title": "Title",
        "text": "Text",
        "actions": [
          {
            "type": "message",
            "label": "Action 1",
            "text": "Action 1"
          },
          {
            "type": "message",
            "label": "Action 2",
            "text": "Action 2"
          },
          {
            "type": "message",
            "label": "Action 3",
            "text": "Action 3"
          }
        ]
      },
      {
        "thumbnailImageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Rotating_earth_%28large%29.gif/300px-Rotating_earth_%28large%29.gif",
        "title": "Title",
        "text": "Text",
        "actions": [
          {
            "type": "message",
            "label": "Action 1",
            "text": "Action 1"
          },
          {
            "type": "message",
            "label": "Action 2",
            "text": "Action 2"
          },
          {
            "type": "message",
            "label": "Action 3",
            "text": "Action 3"
          }
        ]
      },
      {
        "thumbnailImageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Rotating_earth_%28large%29.gif/300px-Rotating_earth_%28large%29.gif",
        "title": "Title",
        "text": "Text",
        "actions": [
          {
            "type": "message",
            "label": "Action 1",
            "text": "Action 1"
          },
          {
            "type": "message",
            "label": "Action 2",
            "text": "Action 2"
          },
          {
            "type": "message",
            "label": "Action 3",
            "text": "Action 3"
          }
        ]
      }
    ]
  }
}      );

    case '카로셀5':
    case 'Carousel5':
    case 'carousel5':
      return client.replyMessage(
        replyToken,
        {
  "type": "template",
  "altText": "Carousel alt text",

  "template": {
    "type": "carousel",
    "columns": [
      {
        "thumbnailImageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Rotating_earth_%28large%29.gif/300px-Rotating_earth_%28large%29.gif",
        "title": "Title",
        "text": "Text",
        "actions": [
          {
            "type": "message",
            "label": "Action 1",
            "text": "Action 1"
          },
          {
            "type": "message",
            "label": "Action 2",
            "text": "Action 2"
          },
          {
            "type": "message",
            "label": "Action 3",
            "text": "Action 3"
          }
        ]
      },
      {
        "thumbnailImageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Rotating_earth_%28large%29.gif/300px-Rotating_earth_%28large%29.gif",
        "title": "Title",
        "text": "Text",
        "actions": [
          {
            "type": "message",
            "label": "Action 1",
            "text": "Action 1"
          },
          {
            "type": "message",
            "label": "Action 2",
            "text": "Action 2"
          },
          {
            "type": "message",
            "label": "Action 3",
            "text": "Action 3"
          }
        ]
      },
      {
        "thumbnailImageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Rotating_earth_%28large%29.gif/300px-Rotating_earth_%28large%29.gif",
        "title": "Title",
        "text": "Text",
        "actions": [
          {
            "type": "message",
            "label": "Action 1",
            "text": "Action 1"
          },
          {
            "type": "message",
            "label": "Action 2",
            "text": "Action 2"
          },
          {
            "type": "message",
            "label": "Action 3",
            "text": "Action 3"
          }
        ]
      }
    ]
  }
}      );


    case '카로셀6':
    case 'Carousel6':
    case 'carousel6':
      return client.replyMessage(
        replyToken,
        {
  "type": "template",
  "altText": "Carousel alt text",

  "template": {
    "type": "carousel",
    "columns": [
      {
        "thumbnailImageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Rotating_earth_%28large%29.gif/300px-Rotating_earth_%28large%29.gif",
        "title": "Title",
        "text": "Text",
        "actions": [
          {
            "type": "message",
            "label": "Action 1",
            "text": "Action 1"
          },
          {
            "type": "message",
            "label": "Action 2",
            "text": "Action 2"
          },
          {
            "type": "message",
            "label": "Action 3",
            "text": "Action 3"
          }
        ]
      },
      {
        "thumbnailImageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Rotating_earth_%28large%29.gif/300px-Rotating_earth_%28large%29.gif",
        "title": "Title",
        "text": "Text",
        "actions": [
          {
            "type": "message",
            "label": "Action 1",
            "text": "Action 1"
          },
          {
            "type": "message",
            "label": "Action 2",
            "text": "Action 2"
          },
          {
            "type": "message",
            "label": "Action 3",
            "text": "Action 3"
          }
        ]
      }
    ]
  }
}      );

    case '카로셀7':
    case 'Carousel7':
    case 'carousel7':
      return client.replyMessage(
        replyToken,
        {
  "type": "template",
  "altText": "Carousel alt text",
  "template": {
    "type": "carousel",
    "columns": [
      {
        "thumbnailImageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Rotating_earth_%28large%29.gif/300px-Rotating_earth_%28large%29.gif",
        "title": "Title",
        "text": "Text",
        "actions": [
          {
            "type": "message",
            "label": "Action 1",
            "text": "Action 1"
          },
          {
            "type": "message",
            "label": "Action 2",
            "text": "Action 2"
          },
          {
            "type": "message",
            "label": "Action 3",
            "text": "Action 3"
          }
        ]
      }
    ]
  }
}      );

    case '카로셀8':
    case 'Carousel8':
    case 'carousel8':
      return client.replyMessage(
        replyToken,
        {
  "type": "template",
  "altText": "Carousel alt text",
  "template": {
    "type": "carousel",
    "columns": [
      {
        "thumbnailImageUrl": "https://obs.line-scdn.net/0hhhZzEuCgN0dnAxtysHBIEEdePCVUYSlMRWV8JUUDaX5MMXh_XmJwKRFWYX4dZyQTU2IrJywDYSJKO3kSHmR-KBUCaXdP/f256x256",
        "title": "Title",
        "text": "Text",
        "actions": [
          {
            "type": "message",
            "label": "Action 1",
            "text": "Action 1"
          },
          {
            "type": "message",
            "label": "Action 2",
            "text": "Action 2"
          },
          {
            "type": "message",
            "label": "Action 3",
            "text": "Action 3"
          }
        ]
      }
    ]
  }
}      );

    case '카로셀9':
    case 'Carousel9':
    case 'carousel9':
      return client.replyMessage(
        replyToken,
        {
  "type": "template",
  "altText": "Carousel alt text",
  "template": {
    "type": "carousel",
    "columns": [
      {
        "thumbnailImageUrl": null,
        "title": "Title",
        "text": "Text",
        "actions": [
          {
            "type": "message",
            "label": "Action 1",
            "text": "Action 1"
          },
          {
            "type": "message",
            "label": "Action 2",
            "text": "Action 2"
          }
        ]
      },
      {
        "thumbnailImageUrl": null,
        "title": "Title",
        "text": "Text",
        "actions": [
          {
            "type": "message",
            "label": "Action 1",
            "text": "Action 1"
          },
          {
            "type": "message",
            "label": "Action 2",
            "text": "Action 2"
          }
        ]
      }
    ]
  }
}      );


    case '카로셀10':
    case 'Carousel10':
    case 'carousel10':
      return client.replyMessage(
        replyToken,
        {
  "type": "template",
  "altText": "Carousel alt text",
  "template": {
    "type": "carousel",
    "columns": [
      {
	"thumbnailImageUrl": "",
        "title": "Title",
        "text": "Text",
        "actions": [
          {
            "type": "message",
            "label": "Action 1",
            "text": "Action 1"
          },
          {
            "type": "message",
            "label": "Action 2",
            "text": "Action 2"
          }
        ]
      },
      {
	"thumbnailImageUrl": "",
        "title": "Title",
        "text": "Text",
        "actions": [
          {
            "type": "message",
            "label": "Action 1",
            "text": "Action 1"
          },
          {
            "type": "message",
            "label": "Action 2",
            "text": "Action 2"
          }
        ]
      }
    ]
  }
}      );
      
      
    case '카로셀11':
    case 'Carousel11':
    case 'carousel11':
      return client.replyMessage(
        replyToken,
        {
  "type": "template",
  "altText": "Carousel alt text",
  "template": {
    "type": "carousel",
    "columns": [
      {
	"thumbnailImageUrl": null,
        "title": null,
        "text": "TextTextTextTextTextTextTextTextTextTextTextTextTextTextTextTextTextTextTextTextTextTextTextTextTextTextTextTextTextText",
        "actions": [
          {
            "type": "message",
            "label": "Action 1",
            "text": "Action 1"
          },
          {
            "type": "message",
            "label": "Action 2",
            "text": "Action 2"
          }
        ]
      },
      {
	"thumbnailImageUrl": null,
        "title": "Title",
        "text": "TextTextTextTextTextTextTextTextTextTextTextTextTextText",
        "actions": [
          {
            "type": "message",
            "label": "Action 1",
            "text": "Action 1"
          },
          {
            "type": "message",
            "label": "Action 2",
            "text": "Action 2"
          }
        ]
      }
    ]
  }
}      );
      
      
    case '카로셀12':
    case 'Carousel12':
    case 'carousel12':
      return client.replyMessage(
        replyToken,
        {
  "type": "template",
  "altText": "Carousel alt text",
  "template": {
    "type": "carousel",
    "columns": [
      {
	"thumbnailImageUrl": null,
        "title": "",
        "text": "TextTextTextTextTextTextTextTextTextTextTextTextTextText",
        "actions": [
          {
            "type": "message",
            "label": "Action 1",
            "text": "Action 1"
          },
          {
            "type": "message",
            "label": "Action 2",
            "text": "Action 2"
          }
        ]
      },
      {
	"thumbnailImageUrl": null,
        "title": "",
        "text": "TextTextTextTextTextTextTextTextTextTextTextTextTextText",
        "actions": [
          {
            "type": "message",
            "label": "Action 1",
            "text": "Action 1"
          },
          {
            "type": "message",
            "label": "Action 2",
            "text": "Action 2"
          }
        ]
      }
    ]
  }
}      );





    case '이미지 카로셀':
    case 'Image Carousel':
    case 'Image carousel':
    case 'image carousel':
      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'Image carousel alt text',
          template: {
            type: 'image_carousel',
            columns: [
              {
                imageUrl: buttonsImageURL,
                action: { label: 'Go to LINE', type: 'uri', uri: 'https://line.me' },
              },
              {
                imageUrl: buttonsImageURL,
                action: { label: 'Say hello1', type: 'postback', data: 'hello라인' },
              },
              {
                imageUrl: buttonsImageURL,
                action: { label: 'Say message', type: 'message', text: 'Rice=쌀' },
              },
              {
                imageUrl: buttonsImageURL,
                action: {
                  label: 'datetime',
                  type: 'datetimepicker',
                  data: 'DATETIME',
                  mode: 'datetime',
                },
              },
            ]
          },
        }
      );



    case '날짜':
    case 'Datetime':
    case 'datetime':
      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'Datetime pickers alt text',
          template: {
            type: 'buttons',
            text: 'Select date / time !',
            actions: [
              { type: 'datetimepicker', label: 'date', data: 'DATE', mode: 'date' },
              { type: 'datetimepicker', label: 'time', data: 'TIME', mode: 'time' },
              { type: 'datetimepicker', label: 'datetime', data: 'DATETIME', mode: 'datetime' },
            ],
          },
        }
      );
      
 //     baseUrl: `${baseURL}/static/rich`,
    case '이미지맵':
    case 'Imagemap':
    case 'imagemap':
      return client.replyMessage(
        replyToken,
        {
          type: 'imagemap',
          baseUrl: `${baseURL}/static/rich`,
          altText: 'Imagemap alt text',
          baseSize: { width: 1040, height: 1040 },
          actions: [
            { area: { x: 0, y: 0, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/manga/en' },
            { area: { x: 520, y: 0, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/music/en' },
            { area: { x: 0, y: 520, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/play/en' },
            { area: { x: 520, y: 520, width: 520, height: 520 }, type: 'message', text: 'URANAI!' },
          ],
        }
      );
      
    case '이미지맵2':
    case 'Imagemap2':
    case 'imagemap2':
      return client.replyMessage(
        replyToken,
        {
          type: 'imagemap',
          baseUrl: `${baseURL}/static/rich`,
          altText: 'Imagemap alt text',
          baseSize: { width: 700, height: 700 },
          actions: [
            { area: { x: 0, y: 0, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/manga/en' },
            { area: { x: 520, y: 0, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/music/en' },
            { area: { x: 0, y: 520, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/play/en' },
            { area: { x: 520, y: 520, width: 520, height: 520 }, type: 'message', text: 'URANAI!' },
          ],
        }
      );
      
    case '이미지맵3':
    case 'Imagemap3':
    case 'imagemap3':
      return client.replyMessage(
        replyToken,
        {
          type: 'imagemap',
          baseUrl: `${baseURL}/static/rich`,
          altText: 'Imagemap alt text',
          baseSize: { width: 460, height: 460 },
          actions: [
            { area: { x: 0, y: 0, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/manga/en' },
            { area: { x: 520, y: 0, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/music/en' },
            { area: { x: 0, y: 520, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/play/en' },
            { area: { x: 520, y: 520, width: 520, height: 520 }, type: 'message', text: 'URANAI!' },
          ],
        }
      );
     
    case '이미지맵4':
    case 'Imagemap4':
    case 'imagemap4':
      return client.replyMessage(
        replyToken,
        {
          type: 'imagemap',
          baseUrl: `${baseURL}/static/rich`,
          altText: 'Imagemap alt text',
          baseSize: { width: 300, height: 300 },
          actions: [
            { area: { x: 0, y: 0, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/manga/en' },
            { area: { x: 520, y: 0, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/music/en' },
            { area: { x: 0, y: 520, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/play/en' },
            { area: { x: 520, y: 520, width: 520, height: 520 }, type: 'message', text: 'URANAI!' },
          ],
        }
      );
      
    case '이미지맵5':
    case 'Imagemap5':
    case 'imagemap5':
      return client.replyMessage(
        replyToken,
        {
          type: 'imagemap',
          baseUrl: `${baseURL}/static/rich`,
          altText: 'Imagemap alt text',
          baseSize: { width: 1040, height: 520 },
          actions: [
            { area: { x: 0, y: 0, width: 520, height: 260 }, type: 'uri', linkUri: 'https://store.line.me/family/manga/en' },
            { area: { x: 520, y: 0, width: 520, height: 260 }, type: 'uri', linkUri: 'https://store.line.me/family/music/en' },
            { area: { x: 0, y: 260, width: 520, height: 260 }, type: 'uri', linkUri: 'https://store.line.me/family/play/en' },
            { area: { x: 520, y: 260, width: 520, height: 260 }, type: 'message', text: 'URANAI!' },
          ],
        }
      );
      
    case '이미지맵6':
    case 'Imagemap6':
    case 'imagemap6':
      return client.replyMessage(
        replyToken,
        {
          type: 'imagemap',
          baseUrl: `${baseURL}/static/rich`,
          altText: 'Imagemap alt text',
          baseSize: { width: 1040, height: 10400 },
          actions: [
            { area: { x: 0, y: 0, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/manga/en' },
            { area: { x: 520, y: 0, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/music/en' },
            { area: { x: 0, y: 520, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/play/en' },
            { area: { x: 520, y: 520, width: 520, height: 520 }, type: 'message', text: 'URANAI!' },
          ],
        }
      );
    
    case '이미지맵7':
    case 'Imagemap7':
    case 'imagemap7':
      return client.replyMessage(
        replyToken,
        {
          type: 'imagemap',
          baseUrl: `${baseURL}/static/rich`,
          altText: 'Imagemap alt text',
          baseSize: { width: 1040, height: 16384 },
          actions: [
            { area: { x: 0, y: 0, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/manga/en' },
            { area: { x: 520, y: 0, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/music/en' },
            { area: { x: 0, y: 520, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/play/en' },
            { area: { x: 520, y: 520, width: 520, height: 520 }, type: 'message', text: 'URANAI!' },
          ],
        }
      );
      
    case '이미지맵8':
    case 'Imagemap8':
    case 'imagemap8':
      return client.replyMessage(
        replyToken,
        {
          type: 'imagemap',
          baseUrl: `${baseURL}/static/rich`,
          altText: 'Imagemap alt text',
          baseSize: { width: 1040, height: 16385 },
          actions: [
            { area: { x: 0, y: 0, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/manga/en' },
            { area: { x: 520, y: 0, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/music/en' },
            { area: { x: 0, y: 520, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/play/en' },
            { area: { x: 520, y: 520, width: 520, height: 520 }, type: 'message', text: 'URANAI!' },
          ],
        }
      );
      
    case '이미지맵9':
    case 'Imagemap9':
    case 'imagemap9':
      return client.replyMessage(
        replyToken,
        {
          type: 'imagemap',
          baseUrl: `${baseURL}/static/rich`,
          altText: 'Imagemap alt text',
          baseSize: { width: 1040, height: 25206 },
          actions: [
            { area: { x: 0, y: 0, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/manga/en' },
            { area: { x: 520, y: 0, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/music/en' },
            { area: { x: 0, y: 520, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/play/en' },
            { area: { x: 520, y: 520, width: 520, height: 520 }, type: 'message', text: 'URANAI!' },
          ],
        }
      );
      
    case '이미지맵10':
    case 'Imagemap10':
    case 'imagemap10':
      return client.replyMessage(
        replyToken,
        {
          type: 'imagemap',
          baseUrl: `${baseURL}/static/rich`,
          altText: 'Imagemap alt text',
          baseSize: { width: 1040, height: 25207 },
          actions: [
            { area: { x: 0, y: 0, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/manga/en' },
            { area: { x: 520, y: 0, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/music/en' },
            { area: { x: 0, y: 520, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/play/en' },
            { area: { x: 520, y: 520, width: 520, height: 520 }, type: 'message', text: 'URANAI!' },
          ],
        }
      );
      
      
    case '이미지맵11':
    case 'Imagemap11':
    case 'imagemap11':
      return client.replyMessage(
        replyToken,
        {
          type: 'imagemap',
          baseUrl: `${baseURL}/static/buttons/rich2`,
          altText: 'Imagemap alt text',
          baseSize: { width: 1040, height: 1040 },
          actions: [
            { area: { x: 0, y: 0, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/manga/en' },
            { area: { x: 520, y: 0, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/music/en' },
            { area: { x: 0, y: 520, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/play/en' },
            { area: { x: 520, y: 520, width: 520, height: 520 }, type: 'message', text: 'URANAI!' },
          ],
        }
      );
     	
    case '토이스토리비디오':
	fileURL = 'http://www.html5videoplayer.net/videos/toystory.mp4';
	return client.replyMessage(
		replyToken, 
		{
			type: 'video',
			originalContentUrl: fileURL,
			previewImageUrl: 'https://obs.line-scdn.net/0hhhZzEuCgN0dnAxtysHBIEEdePCVUYSlMRWV8JUUDaX5MMXh_XmJwKRFWYX4dZyQTU2IrJywDYSJKO3kSHmR-KBUCaXdP/f256x256',	
		}
	);


    case '토이스토리오디오':
	fileURL = "http://www.html5videoplayer.net/videos/toystory.mp4";
	return client.replyMessage(
		replyToken, 
		{
  			"type": "audio",
 			"originalContentUrl": fileURL,
  			"duration": "1000",
		}
	);


    case '비디오1':
		  fileURL = videoURL + 'video.mp4';
		  return client.replyMessage(
			  replyToken,
			  {
				  "type": 'video',
				  "originalContentUrl": fileURL,
				  "previewImageUrl": 'https://obs.line-scdn.net/0hhhZzEuCgN0dnAxtysHBIEEdePCVUYSlMRWV8JUUDaX5MMXh_XmJwKRFWYX4dZyQTU2IrJywDYSJKO3kSHmR-KBUCaXdP/f256x256',	
			  }
		  );


    case '비디오2':
		  fileURL =  audioURL + 'audio.m4a';
		  client.replyMessage(
			replyToken,
			{
  				"type": "text",
 				"text": fileURL
			}
		  );

		  return client.replyMessage(
			  replyToken,
			  {
				  "type": 'video',
				  "originalContentUrl": fileURL,
				  "previewImageUrl": 'https://obs.line-scdn.net/0hhhZzEuCgN0dnAxtysHBIEEdePCVUYSlMRWV8JUUDaX5MMXh_XmJwKRFWYX4dZyQTU2IrJywDYSJKO3kSHmR-KBUCaXdP/f256x256',	
			  }
		  );

    case '비디오3':
		  fileURL = videoURL + 'sample.mp4';
		  return client.replyMessage(
			  replyToken,
			  {
				  "type": 'video',
				  "originalContentUrl": fileURL,
				  "previewImageUrl": 'https://obs.line-scdn.net/0hhhZzEuCgN0dnAxtysHBIEEdePCVUYSlMRWV8JUUDaX5MMXh_XmJwKRFWYX4dZyQTU2IrJywDYSJKO3kSHmR-KBUCaXdP/f256x256',	
			  }
		  );



    case '비디오4':
		  fileURL = videoURL + 'sample2mb.mp4';
		  return client.replyMessage(
			  replyToken,
			  {
				  "type": 'video',
				  "originalContentUrl": fileURL,
				  "previewImageUrl": 'https://obs.line-scdn.net/0hhhZzEuCgN0dnAxtysHBIEEdePCVUYSlMRWV8JUUDaX5MMXh_XmJwKRFWYX4dZyQTU2IrJywDYSJKO3kSHmR-KBUCaXdP/f256x256',	
			  }
		  );


    case '비디오5':
		  fileURL = videoURL + 'sample5mb.mp4';
		  return client.replyMessage(
			  replyToken,
			  {
				  "type": 'video',
				  "originalContentUrl": fileURL,
				  "previewImageUrl": 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Rotating_earth_%28large%29.gif/300px-Rotating_earth_%28large%29.gif',	
			  }
		  );


    case '비디오6':
		  fileURL = "https://line-bot.protopie.io/static/sample.m4a";
		  return client.replyMessage(
			  replyToken,
			  {
				"type": 'video',
				"originalContentUrl": fileURL,
				"previewImageUrl": 'https://obs.line-scdn.net/0hhhZzEuCgN0dnAxtysHBIEEdePCVUYSlMRWV8JUUDaX5MMXh_XmJwKRFWYX4dZyQTU2IrJywDYSJKO3kSHmR-KBUCaXdP/f256x256',
			  }
		  );


    case '오디오1':
	fileURL = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
	return client.replyMessage(
		replyToken,
		{
			 "type": "audio",
 			 "originalContentUrl": fileURL,
			 "duration": "2147483647",

		}
	);

    case 'audio2':
    case 'Audio2':
    case '오디오2':
	fileURL = "https://line-bot.protopie.io/static/sample.m4a";
	return client.replyMessage(
		replyToken,
		{
  			"type": "audio",
 			"originalContentUrl": fileURL,
  			"duration": "2147483647",
		}
	);


    case '오디오3':
	fileURL = audioURL + 'sample.m4a';
	return client.replyMessage(
		replyToken,
		{
  			"type": "audio",
 			"originalContentUrl": fileURL,
  			"duration": "40000",
		}
	);


    case '오디오4':
	fileURL = videoURL + 'sample.mp4';
	return client.replyMessage(
		replyToken,
		{
  			"type": "audio",
 			"originalContentUrl": fileURL,
  			"duration": "1000",
		}
	);


    case '오디오5':
	fileURL = videoURL + 'sample2mb.mp4';
	return client.replyMessage(
		replyToken,
		{
  			"type": "audio",
 			"originalContentUrl": fileURL,
  			"duration": "1000",
		}
	);


    case '오디오6':
	fileURL = videoURL + 'sample5mb.mp4';
	return client.replyMessage(
		replyToken,
		{
  			"type": "audio",
 			"originalContentUrl": fileURL,
  			"duration": "1000",
		}
	);


    case '오디오7':
	fileURL = "http://techslides.com/demos/samples/sample.m4a";
	return client.replyMessage(
		replyToken,
		{
  			"type": "audio",
 			"originalContentUrl": fileURL,
  			"duration": "1000",
		}
	);
	
    case '오디오8':
    case 'audio8':
    	fileURL = audioURL + 'ngfile.m4a';
    	return client.replyMessage(
    		replyToken,
    		{
      			"type": "audio",
     			"originalContentUrl": fileURL,
      			"duration": "1000",
    		}
    	);

    case '파일주소':
	if (fileURL != null) { 
		return client.replyMessage(
			replyToken,
			{
				"type" : "text",
				"text" : fileURL,
			}
		);
	} else return;
	
    case '이미지주소':
    	if(input_OriginalImageURL != null && input_PreviewImageURL != null) {
    		client.pushMessage(source.userId,{
    	       	  "type": "text",
    	       	  "text": "OriginalImageURL : " + input_OriginalImageURL,
    	    });
    		client.pushMessage(source.userId,{
  	       	  "type": "text",
  	       	  "text": "PreviewImageURL : " + input_PreviewImageURL,
  	    });
    		return;
    	} else return;

    case '도움말':
    case 'Help':
    case 'help':
	return replyText(replyToken, '"프로필", "Profile", "profile" 입력 시 내 프로필을 텍스트로 보여줌,\n\n "버튼", "Button", "button", 버튼2, 버튼3 입력 시 Button Template Message를 보여줌,\n\n "확인", "Confirm", "confirm" 입력 시 "Confirm" Template Message를 보여줌,\n\n "카로셀", "Carousel", "carousel", 카로셀2 ~ 10 입력 시 Carousel Template Message를 보여줌,\n\n"이미지 카로셀", "Image Carousel", "Image carousel", image carousel 입력 시 Image가 들어간 Carousel Template Message를 보여줌,\n\n "이미지맵", "Imagemap", "imagemap" 입력 시 Image Map Message를 보여줌,\n\n 비디오1, 비디오2, 비디오3, 비디오4, 비디오5 입력 시 heroku웹서버에 올려놓은 동영상을 보내줌,\n\n 오디오1, 오디오2, 오디오3, 오디오4, 오디오5, 오디오6, 오디오7 입력 시 heroku웹서버에 올려놓은 오디오를 보내줌\n\n"파일주소" 라고 입력하면 BOT에서 직전에 보내준 파일의 URL주소를 출력해줌\n\n"이미지주소" 라고 입력하면 BOT에서 직전에 보내준 이미지의 URL주소를 출력해줌.\n\n"리치메뉴","Richmenu","richmenu" 입력 시 리치메뉴를 생성(한번더 입력하면 제거), 1:1 대화방에만 생성됩니다.\n\n이미지메세지,이미지메세지2,이미지메세지3,~이미지메세지9 입력 시 이미지메세지를 보여줍니다.\n\n스티커메세지, Stickermessage, stickermessage 입력 시 스티커메세지를 보여줍니다.\n\n위치메세지, Locationmessage, locationmessage 입력 시 위치메세지를 보여줍니다.\n\n나가, Bye, bye를 입력하면 Chat Bot을 내보냅니다. (1:1 대화 시 내보내기 불가능)');

    case '리치메뉴':
    case 'Richmenu':
    case 'richmenu':
     if(RichMenuOnOff == false){
    client.getRichMenuList()
    .then((menus) =>
    // clean existing menus
    Promise.all(menus.map(menu => client.deleteRichMenu(menu.richMenuId)))
   )
   .then(() =>
   // create new
   client.createRichMenu({
    "size": {
      "width": 2500,
      "height": 1686
    },
    "selected": false,
    "name": "Rich Menu 1",
    "chatBarText": "Bulletin",
    "areas": [
    {
     "bounds": {
      "x": 512,
      "y": 313,
      "width": 391,
      "height": 309
     },
     "action": {
       "type": "message",
       "text": "Up Button"
     }
    },
    {
      "bounds": {
        "x": 211,
        "y": 627,
        "width": 322,
        "height": 363
      },
      "action": {
        "type": "message",
        "text": "Left Button"
      }
    },
    {
      "bounds": {
        "x": 886,
        "y": 622,
        "width": 317,
        "height": 409
      },
      "action": {
        "type": "message",
        "text": "Right Button"
      }
    },
    {
      "bounds": {
        "x": 515,
        "y": 998,
        "width": 371,
        "height": 321
      },
      "action": {
        "type": "message",
        "text": "Down Button"
      }
    },
    {
      "bounds": {
        "x": 1423,
        "y": 648,
        "width": 384,
        "height": 375
      },
      "action": {
        "type": "message",
        "text": "A Button"
      }
    },
    {
      "bounds": {
        "x": 1902,
        "y": 656,
        "width": 379,
        "height": 379
      },
      "action": {
        "type": "message",
        "text": "B Button"
      }
    }
   ]
  })
  )
  .then((RMid) => {
    console.log(RMid);
    console.log('2 RichMenu');
    RichMenuId = RMid;
    // set image
    client.setRichMenuImage(RMid, createReadStream('./controller_01.png'))
      // link richmenu to user
      .then(() => 
        client.linkRichMenuToUser(source.userId,RMid)
      )
    client.pushMessage(source.userId,{
    	  "type": "text",
    	  "text": "리치메뉴가 생성됩니다."
    	});
  });
	RichMenuOnOff = true;
     } else {
    	 client.getRichMenuList()
    	    .then((menus) => {
    	    // clean existing menus
    	    	Promise.all(menus.map(menu => client.unlinkRichMenuFromUser(source.userId,menu.richMenuId)));
    	    Promise.all(menus.map(menu => client.deleteRichMenu(menu.richMenuId)));
    	    client.pushMessage(source.userId,{
       	  "type": "text",
       	  "text": "리치메뉴가 사라집니다.\n\n방에 재입장시 적용됩니다."
       	});
    	    })
	RichMenuOnOff = false;
    } return;
    
    case '이미지메세지':
    case 'Imagemessage':
    case 'ImageMessage':
    case 'Image Message':
    case 'imagemessage':
    case 'image message':
    	input_OriginalImageURL = 'https://obs.line-scdn.net/0hhhZzEuCgN0dnAxtysHBIEEdePCVUYSlMRWV8JUUDaX5MMXh_XmJwKRFWYX4dZyQTU2IrJywDYSJKO3kSHmR-KBUCaXdP/f256x256';
    	input_PreviewImageURL = 'https://obs.line-scdn.net/0hhhZzEuCgN0dnAxtysHBIEEdePCVUYSlMRWV8JUUDaX5MMXh_XmJwKRFWYX4dZyQTU2IrJywDYSJKO3kSHmR-KBUCaXdP/f256x256';
    	return client.replyMessage(
    			replyToken,
    	        {
    	          type: 'image',
    	          originalContentUrl: input_OriginalImageURL,
    	          previewImageUrl: input_PreviewImageURL,
    	        }
    	);
    case '이미지메세지2':
    case 'Imagemessage2':
    case 'ImageMessage2':
    case 'Image Message2':
    case 'imagemessage2':
    case 'image message2':
    	input_OriginalImageURL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Rotating_earth_%28large%29.gif/300px-Rotating_earth_%28large%29.gif';
    	input_PreviewImageURL = 'https://obs.line-scdn.net/0hhhZzEuCgN0dnAxtysHBIEEdePCVUYSlMRWV8JUUDaX5MMXh_XmJwKRFWYX4dZyQTU2IrJywDYSJKO3kSHmR-KBUCaXdP/f256x256';
    	return client.replyMessage(
    			replyToken,
    	        {
    	          type: 'image',
    	          originalContentUrl: input_OriginalImageURL,
    	          previewImageUrl: input_PreviewImageURL,
    	        }
    	);
    	
    case '이미지메세지3':
    case 'Imagemessage3':
    case 'ImageMessage3':
    case 'Image Message3':
    case 'imagemessage3':
    case 'image message3':
    	input_OriginalImageURL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Rotating_earth_%28large%29.gif/300px-Rotating_earth_%28large%29.gif';
    	input_PreviewImageURL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Rotating_earth_%28large%29.gif/300px-Rotating_earth_%28large%29.gif';
    	return client.replyMessage(
    			replyToken,
    	        {
    	          type: 'image',
    	          originalContentUrl: input_OriginalImageURL,
    	          previewImageUrl: 	input_PreviewImageURL,
    	        }
    	);
    	
    case '이미지메세지4':
    case 'Imagemessage4':
    case 'ImageMessage4':
    case 'Image Message4':
    case 'imagemessage4':
    case 'image message4':
    	input_OriginalImageURL = 'https://obs.line-scdn.net/0hhhZzEuCgN0dnAxtysHBIEEdePCVUYSlMRWV8JUUDaX5MMXh_XmJwKRFWYX4dZyQTU2IrJywDYSJKO3kSHmR-KBUCaXdP/f256x256';
    	input_PreviewImageURL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Rotating_earth_%28large%29.gif/300px-Rotating_earth_%28large%29.gif';
    	return client.replyMessage(
    			replyToken,
    	        {
    	          type: 'image',
    	          originalContentUrl: input_OriginalImageURL,
    	          previewImageUrl: input_PreviewImageURL,
    	        }
    	);
    	
    	
    case '이미지메세지5':
    case 'Imagemessage5':
    case 'ImageMessage5':
    case 'Image Message5':
    case 'imagemessage5':
    case 'image message5':
    	input_OriginalImageURL = imageURL + 'download.jpg';
    	input_PreviewImageURL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Rotating_earth_%28large%29.gif/300px-Rotating_earth_%28large%29.gif';
    	return client.replyMessage(
    			replyToken,
    	        {
    	          type: 'image',
    	          originalContentUrl: input_OriginalImageURL,
    	          previewImageUrl: input_PreviewImageURL,
    	        }
    	);
    	
    	
    case '이미지메세지6':
    case 'Imagemessage6':
    case 'ImageMessage6':
    case 'Image Message6':
    case 'imagemessage6':
    case 'image message6':
    	input_OriginalImageURL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Rotating_earth_%28large%29.gif/300px-Rotating_earth_%28large%29.gif';
    	input_PreviewImageURL = imageURL + 'download.jpg';
    	return client.replyMessage(
    			replyToken,
    	        {
    	          type: 'image',
    	          originalContentUrl: input_OriginalImageURL,
    	          previewImageUrl: input_PreviewImageURL,
    	        }
    	);
    	
    case '이미지메세지7':
    case 'Imagemessage7':
    case 'ImageMessage7':
    case 'Image Message7':
    case 'imagemessage7':
    case 'image message7':
    	input_OriginalImageURL = 'https://kimjinlinebot.herokuapp.com/static/buttons/download.jpg';
    	input_PreviewImageURL = 'https://kimjinlinebot.herokuapp.';
    	return client.replyMessage(
    			replyToken,
    	        {
    	          type: 'image',
    	          originalContentUrl: input_OriginalImageURL,
    	          previewImageUrl: input_PreviewImageURL,
    	        }
    	);
    	
    case '이미지메세지8':
    case 'Imagemessage8':
    case 'ImageMessage8':
    case 'Image Message8':
    case 'imagemessage8':
    case 'image message8':
    	input_OriginalImageURL = 'https://kimjinlinebot.herokuapp.';
    	input_PreviewImageURL = buttonsImageURL;
    	return client.replyMessage(
    			replyToken,
    	        {
    	          type: 'image',
    	          originalContentUrl: input_OriginalImageURL,
    	          previewImageUrl: input_PreviewImageURL,
    	        }
    	);
    	
    case '이미지메세지9':
    case 'Imagemessage9':
    case 'ImageMessage9':
    case 'Image Message9':
    case 'imagemessage9':
    case 'image message9':
    	input_OriginalImageURL = 'https://kimjinlinebot.herokuapp.';
    	input_PreviewImageURL = 'https://kimjinlinebot.herokuapp.';
    	return client.replyMessage(
    			replyToken,
    	        {
    	          type: 'image',
    	          originalContentUrl: input_OriginalImageURL,
    	          previewImageUrl: input_PreviewImageURL,
    	        }
    	);
    	

    case '이미지메세지10':
    case 'Imagemessage10':
    case 'ImageMessage10':
    case 'Image Message10':
    case 'imagemessage10':
    case 'image message10':
    	input_OriginalImageURL = 'https://kimjinlinebot.herokuapp.com/static/buttons/vertical.jpg';
    	input_PreviewImageURL = 'https://kimjinlinebot.herokuapp.com/static/buttons/vertical.jpg';
    	return client.replyMessage(
    			replyToken,
    	        {
    	          type: 'image',
    	          originalContentUrl: input_OriginalImageURL,
    	          previewImageUrl: input_PreviewImageURL,
    	        }
    	);
    	
    case '스티커메세지':
    case 'Stickermessage':
    case 'stickermessage':
    case 'Sticker Message':
    case 'sticker message':
    	return client.replyMessage(
    			replyToken,
    			{
    				  "type": "sticker",
    				  "packageId": "1",
    				  "stickerId": "2560"
    			}
    	);
    
    	
    case '위치메세지':
    case 'Locationmessage':
    case 'locaitonmessage':
    	return client.replyMessage(
    			replyToken,
    			{
    				  "type": "location",
    				  "title": "라인위치",
    				  "address": "경기도 성남시 분당구 황새울로 360번길 42분당스퀘어 11층 라인플러스(주)우편번호 13591",
    				  "latitude": 37.407359,
    				  "longitude": 127.120397
    			}
    	);

    case '나가':
    case 'Bye':
    case 'bye':
      switch (source.type) {
        case 'user':
          return replyText(replyToken, 'Bot can\'t leave from 1:1 chat');
        case 'group':
          return replyText(replyToken, 'Leaving group')
            .then(() => client.leaveGroup(source.groupId));
        case 'room':
          return replyText(replyToken, 'Leaving room')
            .then(() => client.leaveRoom(source.roomId));
      }
       default:
      console.log(`Echo message to ${replyToken}: ${message.text}`);
      return replyText(replyToken, message.text);
  }
}

function handleImage(message, replyToken) {
  const downloadPath = path.join(__dirname, 'downloaded', `${message.id}.jpg`);
  const previewPath = path.join(__dirname, 'downloaded', `${message.id}-preview.jpg`);

  return downloadContent(message.id, downloadPath)
    .then((downloadPath) => {
      // ImageMagick is needed here to run 'convert'
      // Please consider about security and performance by yourself
      cp.execSync(`convert -resize 240x jpeg:${downloadPath} jpeg:${previewPath}`);

      return client.replyMessage(
        replyToken,
        {
          type: 'image',
          originalContentUrl: baseURL + '/downloaded/' + path.basename(downloadPath),
          previewImageUrl: baseURL + '/downloaded/' + path.basename(previewPath),
        }
      );
    });
}

function handleVideo(message, replyToken) {
  const downloadPath = path.join(__dirname, 'downloaded', `${message.id}.mp4`);
  const previewPath = path.join(__dirname, 'downloaded', `${message.id}-preview.jpg`);

  return downloadContent(message.id, downloadPath)
    .then((downloadPath) => {
      // FFmpeg and ImageMagick is needed here to run 'convert'
      // Please consider about security and performance by yourself
      cp.execSync(`convert mp4:${downloadPath}[0] jpeg:${previewPath}`);

      return client.replyMessage(
        replyToken,
        {
          type: 'video',
          originalContentUrl: baseURL + '/downloaded/' + path.basename(downloadPath),
          previewImageUrl: baseURL + '/downloaded/' + path.basename(previewPath),
        }
      );
    });
}

function handleAudio(message, replyToken) {
  const downloadPath = path.join(__dirname, 'downloaded', `${message.id}.m4a`);

  return downloadContent(message.id, downloadPath)
    .then((downloadPath) => {
      return client.replyMessage(
        replyToken,
        {
          type: 'audio',
          originalContentUrl: baseURL + '/downloaded/' + path.basename(downloadPath),
          duration: 1000,
        }
      );
    });
}

function downloadContent(messageId, downloadPath) {
  return client.getMessageContent(messageId)
    .then((stream) => new Promise((resolve, reject) => {
      const writable = fs.createWriteStream(downloadPath);
      stream.pipe(writable);
      stream.on('end', () => resolve(downloadPath));
      stream.on('error', reject);
    }));
}

function handleLocation(message, replyToken) {
  return client.replyMessage(
    replyToken,
    {
      type: 'location',
      title: message.title,
      address: message.address,
      latitude: message.latitude,
      longitude: message.longitude,
    }
  );
}

function handleSticker(message, replyToken) {
  return client.replyMessage(
    replyToken,
    {
      type: 'sticker',
      packageId: message.packageId,
      stickerId: message.stickerId,
    }
  );
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
