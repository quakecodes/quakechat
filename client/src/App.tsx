import "./App.css"
import Logo from "./components/Logo"
import Message from "./interfaces/message"
import ChatMessage from "./components/ChatMessage"
import Button from "./components/Button"
import { useState, useEffect, useRef } from "react"
import io from "socket.io-client"

const socket = io(`ws://${window.location.hostname}`)

const App = () => {
  const [username, setUsername] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState("")
  const [error, setError] = useState<string>("")

  const dummy = useRef<HTMLSpanElement>(document.createElement("span"))

  useEffect(() => {
    setInputText(localStorage.getItem("lastUsername") || "")

    socket.on("message", (message) => {
      setMessages((messages) => [
        ...(messages.length >= 49 ? messages.slice(1, 51) : messages),
        message
      ])
      dummy.current.scrollIntoView({ behavior: "smooth" })
    })
  }, [])

  const registerUsername = () => {
    socket.emit("username", inputText)

    socket.once("username", (res) => {
      if (res.status === "success") {
        setError("")
        setInputText("")
        setUsername(inputText)
        localStorage.setItem("lastUsername", inputText)
        socket.once("messages", setMessages)
      } else {
        setError(res.message)
      }
    })
  }

  const sendMessage = () => {
    if (inputText === "") return
    setInputText("")
    socket.emit("message", inputText)

    socket.once("messageReceive", (res) => {
      if (res.status === "success") setError("")
      else setError(res.message)
    })
  }

  return (
    <div className="App">
      <Logo />
      {username ? (
        <>
          <h2 className="username">
            Logged in as <span className="highlight">{username}</span>.
          </h2>
          <div className="main chat-container">
            {messages.map((message, count) =>
              message.type === "chat" ? (
                <ChatMessage
                  message={message}
                  key={count}
                  side={message.author === username ? "right" : "left"}
                />
              ) : (
                <div className="server-message">
                  <h2 className="highlight">{message.content}</h2>
                  <p>
                    {new Date(message.sentAt).toLocaleTimeString([], {
                      timeStyle: "short"
                    })}
                  </p>
                </div>
              )
            )}
            <span ref={dummy}></span>
          </div>
          <div className="message-input-container">
            <input
              className="message-input"
              type="text"
              onChange={(event) => setInputText(event.target.value)}
              placeholder="Type a message..."
              value={inputText}
              spellCheck={false}
              onKeyPress={(event) => {
                if (event.key === "Enter") sendMessage()
              }}
            />
            <Button onClick={sendMessage} style={{ width: "12%" }}>
              Send
            </Button>
          </div>
          <h3 className="message-error error">{error}</h3>
        </>
      ) : (
        <div className="main username-input">
          <h1>Welcome to quakechat!</h1>
          <div className="input-container">
            <input
              type="text"
              spellCheck={false}
              onChange={(event) => setInputText(event.target.value)}
              placeholder="Enter a username..."
              value={inputText}
              onKeyPress={(event) => {
                if (event.key === "Enter") registerUsername()
              }}
            />
            <Button onClick={registerUsername} style={{ width: "6rem" }}>
              Go!
            </Button>
          </div>
          {error && <h3 className="error">{error}</h3>}
        </div>
      )}
    </div>
  )
}

export default App
