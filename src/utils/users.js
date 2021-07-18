const users = []

// add user
const addUser = ({ id, username, room }) => {
    // clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // validate data
    if(!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    // check for the existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // validate existing user
    if(existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    // store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUSer = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })
    if(index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUSer,
    getUser,
    getUsersInRoom
}