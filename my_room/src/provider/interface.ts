import { Dispatch, SetStateAction } from "react"

export interface ContextProps {
  children: React.ReactNode
}
export interface IContext {
  start: boolean
  setStart: (value: boolean) => void
  hovered: boolean
  setHovered: (value: boolean) => void
  isZoomed: boolean
  setIsZoomed:Dispatch<SetStateAction<boolean>>
}
