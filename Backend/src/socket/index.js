import { initHandlers } from "../socket/handlers.js";

const initSockets = (io) => {
    io.on("connection", (socket) => {
        console.log(`A user connected: ${socket.id}`)
        initHandlers(io, socket);
    })
}

export { initSockets }