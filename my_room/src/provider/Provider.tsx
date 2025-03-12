import { createContext } from 'react'
import { ContextProps, IContext } from './interface'

const Context = createContext({} as IContext)

export const Provider = ({ children }: ContextProps) => {
  return <Context.Provider value={{}}>{children}</Context.Provider>
}
