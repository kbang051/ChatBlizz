import { initHandlers } from "../socket/handlers.js";

const initSockets = (io) => {
    io.on("connection", (socket) => {
        console.log(`A user connected: ${socket.id}`)
        try {
            initHandlers(io, socket);
        } catch (error) {
            console.error("Error initializing socket handlers: ", error);
            socket.disconnect(true);
        }
    })
}

export { initSockets }





