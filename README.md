## **Overview**

The backend of ChatBlizz is designed to handle real-time messaging, user management, and file uploads efficiently. It leverages modern technologies like **Redis**, **Kafka**, **MySQL**, and **Socket.IO** to ensure scalability, reliability, and low latency.

---

## **Key Components**

### 1. **Database (MySQL)**
- **Purpose**: Stores persistent data such as user information, messages, files, and friendships.
- **Tables**:
  - `users`: Stores user details like `id`, `username`, `email`, `status`, etc.
  - `messages`: Stores chat messages, including `sender_id`, `receiver_id`, `message`, `message_type`, and timestamps.
  - `file`: Stores metadata for uploaded files, such as `file_name`, `file_url`, and `file_type`.
  - `friends`: Tracks friendships between users with statuses like `pending`, `accepted`, or `rejected`.

- **ORM**: Sequelize is used for defining models and interacting with the database.

---

### 2. **Redis**
- **Purpose**: Acts as a caching layer and message broker for real-time communication.
- **Usage**:
  - **Pub/Sub**: Redis is used to publish and subscribe to messages in real-time. For example, when a user sends a message, it is published to the `MESSAGES` channel, and subscribers (like the backend) process it.
  - **Caching**: Stores temporary data like pending friend requests and socket mappings for quick access.

---

### 3. **Kafka**
- **Purpose**: Handles asynchronous message processing and ensures reliable delivery of messages.
- **Usage**:
  - **Producer**: Messages are published to the `MESSAGES` topic in Kafka for further processing.
  - **Consumer**: A Kafka consumer listens to the `MESSAGES` topic and processes messages, such as saving them to the database or delivering them to the intended recipient.

---

### 4. **Socket.IO**
- **Purpose**: Enables real-time, bidirectional communication between the server and clients.
- **Usage**:
  - **User Connections**: Each user is assigned a unique `socketId` when they connect. This is mapped to their `userId` for message delivery.
  - **Real-Time Messaging**: Messages are sent and received in real-time using events like `receive_message` and `receive_notification`.

---

### 5. **File Uploads**
- **Purpose**: Handles file uploads (e.g., images, videos, documents) and stores them in AWS S3.
- **Workflow**:
  1. Files are uploaded via a POST request.
  2. The file is stored in AWS S3 using the `@aws-sdk/client-s3` library.
  3. The file URL is saved in the database for future reference.

---

### 6. **Authentication**
- **Firebase Authentication**:
  - Users are authenticated using Firebase tokens.
  - Middleware (verifySocketConnection.middleware.js) verifies the token during socket connections.

---

## **Workflow**

### **Message Flow**
1. **User Sends a Message**:
   - The message is sent to the backend via a REST API or WebSocket event.
   - The message is published to the `MESSAGES` Redis channel.

2. **Redis Subscriber**:
   - The backend subscribes to the `MESSAGES` channel.
   - When a message is received, it is processed and delivered to the recipient via Socket.IO.

3. **Kafka**:
   - The message is also published to the Kafka `MESSAGES` topic for asynchronous processing.
   - A Kafka consumer listens to the topic and saves the message to the database.

4. **Message Delivery**:
   - If the recipient is online, the message is delivered in real-time via Socket.IO.
   - If the recipient is offline, the message is marked as undelivered and stored in the database.

---

### **Friendship Management**
1. **Send Friend Request**:
   - A user sends a friend request via the `sendFriendRequest` API.
   - The request is stored in the `friends` table with a `pending` status.

2. **Accept Friend Request**:
   - The recipient accepts the request via the `acceptFriendRequest` API.
   - The status in the `friends` table is updated to `accepted`.

---

### **File Upload Workflow**
1. The user uploads a file via the `fileUpload` API.
2. The file is stored in AWS S3, and its metadata (e.g., URL, name) is saved in the database.
3. The file URL is sent to the recipient as part of the message.

---

## **Folder Structure**

```
src/
├── app.js                 # Express app setup
├── index.js               # Entry point
├── controllers/           # API controllers
├── db/
│   ├── queries.js         # Database queries
│   ├── redisClient.js     # Redis setup
│   ├── sequelize.js       # Sequelize setup
├── middlewares/           # Middleware functions
├── models/                # Sequelize models
├── routes/                # API routes
├── services/
│   ├── kafka.js           # Kafka producer/consumer
├── socket/
│   ├── subscribe.js       # Redis subscriber
│   ├── connectUser.js     # Socket.IO user connection handling
├── utils/
│   ├── s3Upload.js        # AWS S3 file upload utility
```

---

## **Instructions to Run the Project**

### 1. **Clone the Repository**
```bash
git clone <repository-url>
cd ChatBlizz-Backend
```

### 2. **Install Dependencies**
```bash
npm install
```

### 3. **Set Up Environment Variables**
Create a `.env` file in the root directory and add the following variables:
```
PORT=8000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=chatblizz
DB_PORT=3306
AWS_BUCKET_NAME=your-bucket-name
AWS_BUCKET_REGION=your-region
ACCESS_KEY_AWS=your-access-key
SECRET_KEY_AWS=your-secret-key
```

### 4. **Start Redis**
Ensure Redis is running on `localhost:6379`. You can start Redis using:
```bash
redis-server
```

### 5. **Start Kafka**
Ensure Kafka is running locally or on a configured broker. Start Kafka using:
```bash
zookeeper-server-start.sh config/zookeeper.properties
kafka-server-start.sh config/server.properties
```

### 6. **Run the Backend**
```bash
npm start
```

### 7. **Test the APIs**
Use tools like Postman or cURL to test the APIs. The backend runs on `http://localhost:8000`.

---

## **Key Features**
- **Real-Time Messaging**: Powered by Redis and Socket.IO.
- **Scalable Architecture**: Kafka ensures reliable and asynchronous message processing.
- **File Uploads**: Files are securely stored in AWS S3.
- **Authentication**: Firebase Authentication for secure user management.

This architecture ensures a robust and scalable backend for ChatBlizz, capable of handling real-time communication and file sharing efficiently.