import { createContext, useState } from 'react';
import { ContextProps, IContext } from './interface';

export const Context = createContext({} as IContext);

export const Provider = ({ children }: ContextProps) => {
  const [start, setStart] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <Context.Provider value={{ start, setStart, hovered, setHovered, isZoomed, setIsZoomed }}>
      {children}
    </Context.Provider>
  );
};
