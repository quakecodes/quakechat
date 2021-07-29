import "./Message.css"
import Message from "../../interfaces/message"
import clsx from "clsx"

interface MessageProps {
  message: Message
  side: "left" | "right"
}

const ChatMessage = ({ message, side }: MessageProps) => {
  const sentAt = <p className={clsx("timestamp", side)}>{new Date(message.sentAt).toLocaleTimeString([], { timeStyle: "short" })}</p>

  return (
    <div className={clsx("message-container", side)}>
      <p>{message.author}</p>
      <div className="message-inner">
        {side === "right" && sentAt}
        <div className={clsx("message", side)}>
          <p>{message.content}</p>
        </div>
        {side === "left" && sentAt}
      </div>
    </div>
  )
}
export default ChatMessage
