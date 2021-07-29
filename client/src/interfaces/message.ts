export default interface Message {
  type: "chat" | "event"
  author: string
  content: string
  sentAt: Date
}