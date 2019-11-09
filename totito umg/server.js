
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');


var users = [];




if(process.env.NODE_ENV !== 'production') {
    const webpackDevMiddleware = require('webpack-dev-middleware');
    const webpackHotMiddleware = require('webpack-hot-middleware');
    const webpack = require('webpack');
    const config = require('./webpack.config');
    const compiler = webpack(config);

    app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config.output.publicPath }));
    app.use(webpackHotMiddleware(compiler));
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, './public/index.html'));
});




io.on('connection', (socket) => {
    console:log('connection');
   
  



    if (io.engine.clientsCount < 2) {
        io.to(socket.id).emit('hey', 1);

    }
    else if (io.engine.clientsCount === 2) {
        // tell first user he is first in case he was second and opponent disconnected
        io.to(users[0]).emit('hey', 1);
        //two users in, can start game
        io.emit('play');

    }

    socket.on('move', (board) => {// broadcast to second player the board after move
        socket.broadcast.emit('getBoard', board);

    });

    socket.on('win', (board) => { // broadcast to second player that he lost
        socket.broadcast.emit('lost', board);

    });

    socket.on('draw', (board) => { // broadcast to second player that he lost
        socket.broadcast.emit('draw', board);

    });

    socket.on('playAgain', (board) => { // start another game
        socket.broadcast.emit('playAgain', board);


    });
    socket.on('message', (conversation) => { // start another game
        socket.broadcast.emit('message', conversation);


    });

    socket.on('disconnect', () => {
        users.splice(users.indexOf(socket.id), 1); // in case of disconnect
        io.emit('disconnected', 'disconnected');

    });
});


http.listen(process.env.PORT || 3000, function(){
    console.log('listening on', http.address().port);
});

