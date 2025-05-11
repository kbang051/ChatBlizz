// import { Kafka, Producer } from "kafkajs";
import { pool } from "../index.js";
import pkg from 'kafkajs';
const { Kafka } = pkg;

let admin = null;

const kafka = new Kafka({
    clientId: 'chatblizz-copy',
    brokers: ['host.docker.internal:9092']
})

if (admin === null)
    admin = kafka.admin();

export async function createKafkaTopic() {
  try {
    await admin.connect();
    await admin.createTopics({
      topics: [
        {
          topic: "MESSAGES",
          numPartitions: 1,
          replicationFactor: 1,
        },
      ],
      waitForLeaders: true,
    });
    console.log("Topic created or already exists.");
    await admin.disconnect();
  } catch (error) {
    console.log("Unable to create Kafka Topic - MESSAGES: ", error);
  }
}

let producer = null;
export async function createProducer() {
    if (producer)
        return producer;
    const _producer = kafka.producer();
    await _producer.connect();
    producer = _producer;
    return producer;
}

export async function produceMessage(message) {
  console.log("Message received inside Kafka produceMessage: ", message);
  const kafkaProducer = await createProducer();
  try {
    await kafkaProducer.send({
      topic: "MESSAGES",
      messages: [
        {
          key: message.id,
          value: JSON.stringify(message),
        },
      ],
    });
  } catch (error) {
    console.error("Kafka produce failed:", error);
  }
}

export async function startMessageConsumer() {
  console.log("Consumer is running....");
  const consumer = kafka.consumer({ groupId: "default" });
  await consumer.connect();
  await consumer.subscribe({ topic: "MESSAGES", fromBeginning: true });

  await consumer.run({
    autoCommit: true,
    eachMessage: async ({ message, pause }) => {
      if (!message.value) return;

      console.log("New Message Received");
      const msg = JSON.parse(message.value.toString());

      try {
        if (msg.message_type === "text") {
          await pool.query(
            `INSERT INTO messages (id, sender_id, receiver_id, message, delivered, created_at)
             VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [msg.id, msg.sender_id, msg.receiver_id, msg.message.trim(), msg.delivered]
          );
          console.log("Text message inserted: ", msg.id);
        } else if (msg.message_type === "file") {
          // Save file metadata
          await pool.query(
            `INSERT INTO file (id, user_id, receiver_id, file_name, file_url, uploaded_at)
             VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [msg.fileId, msg.sender_id, msg.receiver_id, msg.originalname, msg.fileUrl]
          );

          // Save message reference in messages table
          await pool.query(
            `INSERT INTO messages (id, sender_id, receiver_id, message, message_type, file_id, fileName, delivered, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [ msg.id, msg.sender_id, msg.receiver_id, msg.fileUrl, msg.message_type, msg.fileId, msg.originalname, msg.delivered ]
          );

          console.log("File message inserted: ", msg.id);
        }
      } catch (error) {
        console.error("Kafka DB insert failed:", error);
        pause();
        setTimeout(() => {
          consumer.resume([{ topic: "MESSAGES" }]);
        }, 60 * 1000);
      }
    }
  });
}





