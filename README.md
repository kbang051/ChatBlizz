## **Project Architecture**

### **Frontend**
The frontend is built using **React**, **TypeScript**, and **Vite** for fast development and performance. It provides a responsive user interface for chat functionalities, file uploads, and user management.

#### Key Features:
- **Real-Time Messaging**: Powered by WebSocket communication.
- **File Uploads**: Users can upload and share files.
- **Search Functionality**: Search for users and conversations.
- **State Management**: Zustand is used for managing application state.

#### Folder Structure:
```
Frontend/
├── public/                # Static assets
├── src/
│   ├── components/        # React components (e.g., ChatContainer, HomePage)
│   ├── store/             # Zustand stores for state management
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # Entry point
│   ├── firebase.ts        # Firebase configuration
│   ├── index.css          # Global styles
├── vite.config.ts         # Vite configuration
├── package.json           # Dependencies and scripts
```

---

### **Backend**
The backend is built using **Node.js** and **Express**. It handles real-time communication, file uploads, and database interactions. The backend is designed to be scalable and efficient using technologies like **Redis**, **Kafka**, and **MySQL**.

#### Key Features:
- **Real-Time Communication**: Socket.IO for WebSocket-based messaging.
- **Message Queue**: Kafka for asynchronous message processing.
- **Caching and Pub/Sub**: Redis for caching and real-time message broadcasting.
- **File Uploads**: AWS S3 for secure file storage.
- **Authentication**: Firebase Authentication for user verification.

#### Folder Structure:
```
Backend/
├── src/
│   ├── app.js             # Express app setup
│   ├── index.js           # Entry point
│   ├── controllers/       # API controllers
│   ├── db/                # Database and Redis setup
│   ├── middlewares/       # Middleware functions
│   ├── models/            # Sequelize models
│   ├── routes/            # API routes
│   ├── services/          # Kafka producer/consumer
│   ├── socket/            # Socket.IO setup and Redis subscriber
│   ├── utils/             # Utility functions (e.g., S3 upload)
├── package.json           # Dependencies and scripts
```

---

## **Backend Architecture**

### **1. Database (MySQL)**
- **Purpose**: Stores persistent data such as users, messages, and files.
- **Tables**:
  - `users`: Stores user details like `id`, `username`, `email`, and `status`.
  - `messages`: Stores chat messages with fields like `sender_id`, `receiver_id`, `message`, `message_type`, and timestamps.
  - `file`: Stores metadata for uploaded files, such as `file_name`, `file_url`, and `file_type`.
  - `friends`: Tracks friendships between users.

---

### **2. Redis**
- **Purpose**: Acts as a caching layer and message broker.
- **Usage**:
  - **Pub/Sub**: Used for real-time message broadcasting.
  - **Caching**: Stores temporary data like socket mappings.

---

### **3. Kafka**
- **Purpose**: Handles asynchronous message processing.
- **Usage**:
  - **Producer**: Publishes messages to the `MESSAGES` topic.
  - **Consumer**: Processes messages from the `MESSAGES` topic and saves them to the database.

---

### **4. Socket.IO**
- **Purpose**: Enables real-time communication between the server and clients.
- **Usage**:
  - **User Connections**: Maps `userId` to `socketId` for message delivery.
  - **Events**: Handles events like `receive_message` and `receive_notification`.

---

### **5. File Uploads**
- **Purpose**: Handles file uploads and stores them in AWS S3.
- **Workflow**:
  1. Files are uploaded via a POST request.
  2. The file is stored in AWS S3.
  3. The file URL is saved in the database.

---

### **6. Authentication**
- **Firebase Authentication**:
  - Verifies users using Firebase tokens.
  - Middleware ensures secure socket connections.

---

## **Frontend Architecture**

### **1. React Components**
- **HomePage**: Main dashboard for users.
- **ChatContainer**: Displays messages and handles real-time chat.
- **SearchAllUsers**: Allows users to search for other users.

---

### **2. Zustand State Management**
- **Stores**:
  - `useChatStore`: Manages chat-related state (e.g., messages, notifications).
  - `useAuthStore`: Manages authentication state.
  - `useUserSearchStore`: Manages user search state.

---

### **3. Firebase Integration**
- **Purpose**: Handles user authentication.
- **Configuration**: Firebase SDK is initialized in `firebase.ts`.

---

## **How Components Interact**

1. **User Authentication**:
   - Users log in via Firebase.
   - The backend verifies Firebase tokens for secure communication.

2. **Real-Time Messaging**:
   - Messages are sent via Socket.IO.
   - Redis broadcasts messages to subscribers.
   - Kafka ensures reliable message delivery.

3. **File Sharing**:
   - Files are uploaded to AWS S3.
   - The file URL is sent as part of the message.

4. **Search Functionality**:
   - Users can search for other users or conversations.
   - The backend queries the database for matching results.

---

## **Instructions to Run the Project**

### **1. Clone the Repository**
```bash
git clone <repository-url>
cd ChatBlizz
```

---

### **2. Set Up Backend**

#### **Install Dependencies**
```bash
cd Backend
npm install
```

#### **Set Up Environment Variables**
Create a `.env` file in the Backend directory with the following:
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

#### **Start Redis**
Ensure Redis is running:
```bash
redis-server
```

#### **Start Kafka**
Start Zookeeper and Kafka:
```bash
zookeeper-server-start.sh config/zookeeper.properties
kafka-server-start.sh config/server.properties
```

#### **Run the Backend**
```bash
npm start
```

---

### **3. Set Up Frontend**

#### **Install Dependencies**
```bash
cd Frontend
npm install
```

#### **Set Up Environment Variables**
Create a `.env` file in the Frontend directory with the following:
```
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
VITE_FIREBASE_APP_ID=your-firebase-app-id
```

#### **Run the Frontend**
```bash
npm run dev
```

---

### **4. Access the Application**
- **Frontend**: Open `http://localhost:5173` in your browser.
- **Backend**: The backend runs on `http://localhost:8000`.

---

## **Key Features**
- Real-time messaging with Socket.IO.
- Scalable architecture with Redis and Kafka.
- Secure file uploads to AWS S3.
- Firebase Authentication for user management.

This setup ensures a robust and scalable chat application with real-time capabilities.