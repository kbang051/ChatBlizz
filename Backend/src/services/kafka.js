// import { Kafka, Producer } from "kafkajs";
import { pool } from "../index.js";
import pkg from 'kafkajs';
const { Kafka } = pkg;

let admin = null;

const kafka = new Kafka({
    clientId: 'chatblizz-copy',
    brokers: ['localhost:9092']
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
    await consumer.subscribe({topic: "MESSAGES", fromBeginning: true});
    await consumer.run({
        autoCommit: true,
        eachMessage: async ({message, pause}) => {
            if (!message.value) return;
            console.log("New Message Received");
            const msg = JSON.parse(message.value.toString());
            try {
                await pool.query(`INSERT INTO messages (id, sender_id, receiver_id, message, created_at, delivered) 
                                  VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, FALSE)`, 
                                  [msg.id, msg.sender_id, msg.receiver_id, msg.message.trim()]);
                console.log("Message inserted successfully in the message table: ", msg.id);
            } catch (error) {
                console.log("Something went wrong while uploading msgs to database from Kafka");
                pause();
                setTimeout(() => {
                    consumer.resume([{topic: "MESSAGES"}]);
                }, 60 * 1000);
            }
        }
    })
}





