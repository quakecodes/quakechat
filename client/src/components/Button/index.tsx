import { ButtonHTMLAttributes } from "react"
import clsx from "clsx"
import "./Button.css"

const Button = ({
  children,
  className,
  style,
  onClick = () => undefined
}: ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      onClick={onClick}
      className={clsx("button", className)}
      style={style}
    >
      {children}
    </button>
  )
}

export default Button
