const express = require("express")
const http = require("http")
const filter = require("leo-profanity")

const app = express()
const server = http.createServer(app)
const port = 5000

app.use(express.static("client/build"))

const io = require("socket.io")(server, {
  cors: { origin: "*" }
})

var users = []
var messageCache = []

filter.remove(["butt"])
filter.add(["retard", "retarded"])

app.get("/", (req, res) => {
  res.sendFile("index.html")
})

io.on("connection", (socket) => {
  socket.on("username", (username) => {
    if (users.includes(username.toLowerCase())) {
      socket.emit("username", {
        status: "error",
        message: "Username is taken."
      })
      return
    } else if (username.length < 3 || username.length > 18) {
      socket.emit("username", {
        status: "error",
        message: "Username must be between 3 and 20 characters long."
      })
      return
    } else if (username.includes(" ")) {
      socket.emit("username", {
        status: "error",
        message: "Username must not contain spaces."
      })
      return
    } else if (username.toLowerCase().includes("server")) {
      socket.emit("username", {
        status: "error",
        message: "That username is not allowed."
      })
    }

    socket.emit("username", {
      status: "success",
      message: "Connected to the room."
    })
    socket.emit("messages", messageCache)
    users.push(username.toLowerCase())

    io.emit("message", {
      type: "event",
      content: `${username} joined the chat.`,
      sentAt: new Date(Date.now()),
      author: "server"
    })

    socket.on("message", (message) => {
      if (message.length > 200) {
        socket.emit("messageReceive", {
          status: "error",
          message: "Message must be max 200 characters."
        })
        return
      } else if (message.length === 0) {
        socket.emit("messageReceive", {
          status: "error",
          message: "Message must not be empty."
        })
        return
      }

      const messagePayload = {
        type: "chat",
        content: filter.clean(message),
        sentAt: new Date(Date.now()),
        author: username
      }

      io.emit("message", messagePayload)
      socket.emit("messageReceive", {
        status: "success",
        message: "Message sent."
      })

      if (messageCache.length > 20) messageCache.splice(0, 1)

      messageCache.push(messagePayload)
    })
    socket.once("disconnect", () => {
      io.emit("message", {
        type: "event",
        content: `${username} left the chat.`,
        sentAt: new Date(Date.now()),
        author: "server"
      })
      users = users.filter(
        (user) => user.toLowerCase() !== username.toLowerCase()
      )
    })
  })
})

server.listen(port, () => console.log(`Server is running on port ${port}.`))
