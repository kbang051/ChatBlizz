import { io, getReceiverSocketId } from "../index.js";
import { sub } from "../db/redisClient.js";
import { produceMessage } from "../services/kafka.js";

const startSubscriber = async () => {
  await sub.subscribe("MESSAGES");
  console.log("Subscribed to MESSAGES channel");

  sub.on("message", async (channel, message) => {
    if (channel === "MESSAGES") {
        try {
          console.log("Message received inside startSubscriber (MESSAGES): ", message);
          const parsedMessage = JSON.parse(message);
          const { receiver_id, sender_id } = parsedMessage;
          const receiverSocketId = getReceiverSocketId(receiver_id);
          if (receiverSocketId) {
            io.to(receiverSocketId).emit("receive_message", {
              ...parsedMessage,
              delivered: true,
            });
    
            io.to(receiverSocketId).emit("receive_notification", {
              sender_id,
              id: parsedMessage.id,
              message:  (parsedMessage.message_type === "file") ? parsedMessage.fileUrl : parsedMessage.message,
              fileName: (parsedMessage.message_type === "file") ? parsedMessage.originalname : parsedMessage.fileName,
              created_at: parsedMessage.created_at,
            });
    
            console.log("Message sent to receiver via socket:", parsedMessage.message);
            parsedMessage.delivered = true;
            parsedMessage.delivered_at = new Date().toISOString();
          } else {
            console.log("The receiver is offline so maybe we are unable to read receiverSocketId in saveMessage controller or there is some problem in the controller");
          }
          
          await produceMessage(parsedMessage);
        } catch (error) {
          console.error("Error processing redis messages: ", error);
        }
    } 
  });
};

export default startSubscriber;
