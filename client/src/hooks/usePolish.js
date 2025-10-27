// src/hooks/usePolish.js
import { useEffect, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import { io } from "socket.io-client";

export const usePolish = (handlers) => {
  const { token } = useAppContext();
  const socketRef = useRef(null);
  const savedHandlers = useRef(handlers);

  // Keep latest handlers in a ref
  useEffect(() => {
    savedHandlers.current = handlers;
  }, [handlers]);

  useEffect(() => {
    if (!token) return;

    const socket = io(import.meta.env.VITE_API_URL, { auth: { token } });
    socketRef.current = socket;

    // Attach events
    Object.keys(savedHandlers.current).forEach((event) => {
      socket.on(event, (...args) => savedHandlers.current[event](...args));
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  return socketRef.current;
};
