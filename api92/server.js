const express = require('express');
const cors = require('cors');
const app = express();
const expressWs = require('express-ws')(app);

const port = 8000;

app.use(cors());
let pictArray = [];

const clients = {};
app.ws('/canvas', (ws, req) => {
    const id = req.get('sec-websocket-key');
    clients[id] = ws;
    console.log('client connect');


    const sendAll = () => {

        Object.values(clients).forEach(clients => {


            const oneArray = JSON.stringify({
                type: 'NEW_LINE',
                array: pictArray
            });
            clients.send(oneArray)
        });
    };
    sendAll();

    ws.on('message', (pix) => {
            let decodeMessage;

            try {
                decodeMessage = JSON.parse(pix)
            }
            catch (e) {
                return ws.send(JSON.stringify({message: 'Message is not JSON', type: 'Message is not JSON'}))
            }
            switch (decodeMessage.type) {
                case 'SET_LINE':
                    pictArray.push({
                        pixelArray: decodeMessage.pixelArray,
                        rgb: decodeMessage.rgb
                    });
                    sendAll();

                    break;
                default:
                    return ws.send(JSON.stringify({
                        type: 'ERROR',
                        message: 'Unknown  type'
                    }))

            }


        }
    );

    ws.on('close', () => {
        delete clients[id];
        console.log('Client disconnection', Object.values(clients).length);
    })

});
app.listen(port, () => {
    console.log("Server was run");
});