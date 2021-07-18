const http = require('http')
const express = require('express')
const path = require('path')
const socketio = require('socket.io')
const { emit } = require('process')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUSer, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT
const publicDir = path.join(__dirname, '../public')
app.use(express.static(publicDir))

io.on('connection', (socket) => {
    console.log('New Websocket connection')    
    
    socket.on('join', (options, callback ) => {
        const {error, user} = addUser({ id: socket.id, ...options})
        
        if(error) {
            return callback(error)
        } 
        
        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage', (message, callback) => {   
        const user = getUser(socket.id)    
        const filter = new Filter()
        if(filter.isProfane(message)) {
            return callback('Profanity is not allowed.')
        }
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback('Delivered!')
    })

    socket.on('sendLocation', (coords, callback) => {  
        const user = getUser(socket.id)      
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.longitude},${coords.latitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUSer(socket.id)
        
        if(user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }        
    })
})

server.listen(port, () => {
    console.log('Server is up on port: '+ port)
})