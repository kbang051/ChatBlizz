import { v4 as uuidv4 } from 'uuid';
import { fileTypeFromBuffer } from 'file-type';
import { pool, io, getReceiverSocketId } from "../index.js";
import { uploadToS3 } from '../utils/s3Upload.js';
import { redis, pub } from './redisClient.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);


const fileUpload = async (req, res) => {
  try {
    const files = req.files;
    const { receiver_id, sender_id } = req.body;

    if (!files || !sender_id || !receiver_id) {
      console.log("Missing data:", files, sender_id, receiver_id);
      return res.status(400).json({ message: "Missing file or sender_id or receiver_id" });
    }

    const messages = await Promise.all(
      files.map(async (file) => {
        const fileType = await fileTypeFromBuffer(file.buffer);
        if (!fileType)
          return res.status(400).json({ message: "Unsupported or unknown file type" });

        const fileUrl = await uploadToS3(file.buffer, fileType.mime, fileType.ext);

        const messageId = uuidv4();
        const fileId = uuidv4();

        const messageToPublish = {
          id: messageId,
          sender_id,
          receiver_id,
          message: fileUrl,
          fileName: file.originalname,
          message_type: "file",
          fileId,
          fileUrl,
          originalname: file.originalname,
          created_at: new Date().toISOString(),
          delivered: false
        };

        await pub.publish("MESSAGES", JSON.stringify(messageToPublish));

        return messageToPublish;
      })
    );

    return res.status(200).json({ messages });
  } catch (error) {
    console.error("File upload error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// const fileUpload = async (req, res) => {
//   console.log("Request received in fileUpload");
//   const files = req.files;
//   const { receiver_id, sender_id } = req.body;
//   if (!files || !sender_id || !receiver_id) {
//     console.log("File or sender_id or receiver_id is missing:", `files - ${files}`, `sender_id - ${sender_id}`, `receiver_id - ${receiver_id}`);
//     return res.status(400).json({ message: "Missing file or sender_id or receiver_id" });
//   }
//   const FileTableQuery = `INSERT INTO file (id, user_id, receiver_id, file_name, file_url, uploaded_at) 
//                           VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`;

//   const MessageTableQuery = `INSERT INTO messages (id, sender_id, receiver_id, file_id, message, fileName, message_type, created_at) 
//                              VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`;
//   try {
//     //     Frontend sends a form-data POST request with a file under file.
//     //     multer.memoryStorage() stores that file in RAM.
//     //     req.file holds:
//     //     Metadata like originalname, mimetype, size
//     //     The actual file in buffer
//     //     You send buffer to AWS S3 using the AWS SDK.
//     //     You get a public URL or object key from S3 in return.

//     const messages = await Promise.all(
//       files.map(async (file) => {
//         const fileType = await fileTypeFromBuffer(file.buffer);
//         if (!fileType)
//           return res.status(400).json({ message: "Unsupported or unknown file type" });

//         const fileUrl = await uploadToS3(file.buffer, fileType.mime, fileType.ext);
//         // console.log("File URL: ", fileUrl);

//         const fileId = uuidv4();
//         const messageId = uuidv4();

//         await pool.query(FileTableQuery, [fileId, sender_id, receiver_id, file.originalname, fileUrl]);
//         //console.log("File inserted successfully in the file table");

//         await pool.query(MessageTableQuery, [ messageId, sender_id, receiver_id, fileId, fileUrl, file.originalname, "file"]);
//         //console.log("Message successfully inserted in the message table");

//         const messageToSend = {
//           id: messageId,
//           sender_id,
//           receiver_id,
//           message: fileUrl,
//           message_type: "file",
//           fileName: file.originalname,
//           delivered: true,
//           created_at: new Date().toISOString(),
//         };

//         const notification = {
//           sender_id: sender_id,
//           id: messageId,
//           message: fileUrl,
//           fileName: file.originalname,
//           created_at: new Date().toISOString(),
//         }

//         const receiverSocketId = getReceiverSocketId(receiver_id);

//         if (receiverSocketId) {
//           io.to(receiverSocketId).emit("receive_message", messageToSend);
          
//           //new addition --- notifications
//           io.to(receiverSocketId).emit("receive_notification", notification);

//           await pool.query(`UPDATE messages SET delivered = TRUE, delivered_at = CURRENT_TIMESTAMP WHERE receiver_id = ? AND delivered = FALSE`, [receiver_id]);
//         } // Mark as delivered

//         return messageToSend;
//       })
//     );

//     return res.status(200).json({ messages });
//   } catch (error) {
//     console.error("Failed to upload or save file: ", error);
//     return res.status(500).json({ message: "Failed to upload or save file" });
//   }
// };

const saveMessage = async (req, res) => {
  try {
    const { sender_id, receiver_id, content } = req.body;
    console.log("Request received at saveMessage: sender_id: ", sender_id, " receiver_id: ", receiver_id, " content: ", content);
    if (!sender_id || !receiver_id || !content || content.trim() === "") {
      console.log(`sender_id or receiver_id or content is missing --- sender_id: ${sender_id}, receiver_id: ${receiver_id}, content: ${content}`);
      return res.status(400).json({message: `sender_id or receiver_id or content is missing --- sender_id: ${sender_id}, receiver_id: ${receiver_id}, content: ${content}`});
    }
    //1. Store message in DB
    const messageId = uuidv4();
    
    const messagePayload = {
      id: messageId,
      sender_id,
      receiver_id,
      message: content,
      message_type: "text", //newly added
      fileName: null, //newly added
      delivered: false,
      created_at: new Date().toISOString()
    };
    await pub.publish("MESSAGES", JSON.stringify(messagePayload));
    return res.status(200).send(messagePayload);
    //return res.status(200).json({ message: "Message published successfully" });
  } catch (error) {
    console.error("Failed to publish message: ", error);
    return res.status(500).json({message: 'Failed to save message'});
  }
};

// const saveMessage = async (req, res) => {
//   const query = `INSERT INTO messages (id, sender_id, receiver_id, message, created_at, delivered) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, FALSE)`;
//   try {
//     const { sender_id, receiver_id, content } = req.body;
//     if (!sender_id || !receiver_id || !content || content.trim() === "") {
//       console.log(`sender_id or receiver_id or content is missing --- sender_id: ${sender_id}, receiver_id: ${receiver_id}, content: ${content}`);
//       return res.status(400).json({message: `sender_id or receiver_id or content is missing --- sender_id: ${sender_id}, receiver_id: ${receiver_id}, content: ${content}`});
//     }
//     //1. Store message in DB
//     const messageId = uuidv4();
//     const [insertMessage] = await pool.query(query, [messageId, sender_id, receiver_id, content.trim()]);
//     console.log("Message inserted successfully in the message table");

//     //2. Attempt real-time delivery
//     const receiverSocketId = getReceiverSocketId(receiver_id);
    
//     //person is offline
//     if (!receiverSocketId)
//       console.log("The receiver is offline so maybe we are unable to read receiverSocketId in saveMessage controller or there is some problem in the controller")
    
//     const messageToSend = {
//       id: messageId,
//       sender_id,
//       receiver_id,
//       message: content,
//       message_type: "text", //newly added
//       fileName: null, //newly added
//       delivered: true,
//       created_at: new Date().toISOString()
//     };
    
//     const notification = {
//       sender_id: sender_id,
//       id: messageId,
//       message: content,
//       fileName: null,
//       created_at: new Date().toISOString(),
//     }

//     if (receiverSocketId) {
//       io.to(receiverSocketId).emit("receive_message", messageToSend);

//       //new addition --- notifications
//       io.to(receiverSocketId).emit("receive_notification", notification);
      
//       console.log("Message sent to the receiver successfully from backend as the user is online: ", content);
//       await pool.query(`UPDATE messages SET delivered = TRUE, delivered_at = CURRENT_TIMESTAMP WHERE receiver_id = ? AND delivered = FALSE`, [receiver_id]);
//     } // Mark as delivered

//     return res.status(200).send(messageToSend)
//   } catch (error) {
//     console.error("Unable to insert message: ", error);
//     return res.status(500).json({message: 'Failed to save message'});
//   }
// };

const getAllUsers = async (req, res) => { 
  const q = decodeURIComponent(req.params?.q);
  const query = ` SELECT users.id, users.username, users.email
                  FROM users
                  JOIN friends ON (users.id = friends.user_id OR users.id = friends.friend_id)
                  WHERE (friends.user_id = ? OR friends.friend_id = ?) 
                  AND friends.status = 'accepted'
                  AND users.id != ?;`;
  try {
    const [getRecords] = await pool.query(query, [q, q, q]);
    if (getRecords.length > 0) {
      console.log("Records fetched from users table:", getRecords);
      return res.status(200).send(getRecords)
    }
    else {
      console.log("No users found in the database");
      return res.status(201).send(getRecords)
    }
  } catch (error) {
    console.log("Unable to fetch details of all users:", error);
    return res.status(500).send({ message: "Internal server error" });
  }
};

const fetchRecommendation = async (req, res) => {
  console.log("Request received to fetch search result");

  const userId = req.user?.uid;
  const q = decodeURIComponent(req.params?.q); // search param
  console.log("Request Parameter: ", q);
  if (!q || q === "")
    return res.status(404).json({ message: "Empty Search Parameter" });

  const query1 = `SELECT id, username, email FROM users WHERE LOWER(username) LIKE LOWER(?) AND id != ? LIMIT 6`;
  const query2 = `SELECT user_id, friend_id, status FROM friends WHERE (user_id = ? AND friend_id IN (?)) OR (friend_id = ? AND user_id IN (?))`;

  try {
    const [getProfiles] = await pool.query(query1, [`%${q}%`, userId]);
    if (getProfiles.length === 0) {
      console.log("No matching entries in the database for input like:", q);
      return res.status(200).send([]);
    }
    const suggestionIds = getProfiles.map(u => u.id);
    const [friendList] = await pool.query(query2, [userId, suggestionIds, userId, suggestionIds]);
    const friendMap = new Map();
    for (let row of friendList) {
      const friendId = row.user_id === userId ? row.friend_id : row.user_id;
      friendMap.set(friendId, row.status || 'unknown');
    }

    const result = getProfiles.map(user => ({
      ...user,
      status: friendMap.has(user.id) ? friendMap.get(user.id) : 'unknown'
    }));

    console.log("Final search results with friendStatus: ", result);
    return res.status(200).send(result);
  } catch (error) {
    console.log("Error while fetching profiles from the backend:", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

const fetchSearchAll = async (req, res) => {
  console.log("Request received to fetch search result at fetchSearchAll");

  const userId = req.user?.uid;
  const q = decodeURIComponent(req.params?.q); // search param
  console.log("Request Parameter: ", q);
  if (!q || q === "")
      return res.status(404).json({ message: "Empty Search Parameter" });

  const query1 = `SELECT id, username, email FROM users WHERE LOWER(username) LIKE LOWER(?) AND id != ?`;
  const query2 = `SELECT user_id, friend_id, status FROM friends WHERE (user_id = ? AND friend_id IN (?)) OR (friend_id = ? AND user_id IN (?))`;

  try {
    const [getProfiles] = await pool.query(query1, [`%${q}%`, userId]);
    if (getProfiles.length === 0) {
      console.log("No matching entries in the database for input like:", q);
      return res.status(200).send([]);
    }
    const suggestionIds = getProfiles.map(u => u.id);
    let [friendList] = await pool.query(query2, [userId, suggestionIds, userId, suggestionIds]);
    friendList = friendList.map((item) => {
      if (item.status === "pending") {
        if (item.friend_id === userId) {
          item.status = 'ToBeAccepted';
        }
      }
      return item;
    })
    console.log("There's a problem in map");
    const friendMap = new Map();
    for (let row of friendList) {
      const friendId = row.user_id === userId ? row.friend_id : row.user_id;
      friendMap.set(friendId, row.status || 'unknown');
    }

    const result = getProfiles.map(user => ({
      ...user,
      status: friendMap.has(user.id) ? friendMap.get(user.id) : 'unknown'
    }));

    console.log("Final search results with friendStatus: ", result);
    return res.status(200).send(result);
  } catch (error) {
    console.log("Error while fetching profiles from the backend:", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

//detail of a particular user
const getUserDetail = async (req, res) => {
  console.log("Request received to fetch user info")
  const query1 = `SELECT id, username, email, avatar, created_at FROM users WHERE id = ? LIMIT 1`
  const query2 = `SELECT status FROM friends WHERE (user_id = ? AND friend_id = ?) OR (friend_id = ? AND user_id = ?) LIMIT 1`
  try {
    const user_id   = decodeURIComponent(req.params?.userId) 
    const friend_id = decodeURIComponent(req.params?.friendId) 
    if (!user_id || user_id.trim().length === 0) {
      console.log("Empty user_id:", user_id);
      return res.status(400).json({ message: "Empty user_id" });
    }
    if (!friend_id || friend_id.trim().length === 0) {
      console.log("Empty friend_id:", friend_id);
      return res.status(400).json({ message: "Empty friend_id" });
    }

    const [[userTableResponse], [friendsTableResponse]] = await Promise.all([ //destructuring to remove meta data
      pool.query(query1, [friend_id]),
      pool.query(query2, [user_id, friend_id, user_id, friend_id]),
    ])
  
    const user = userTableResponse[0]
    user.friendStatus = (friendsTableResponse?.length === 0) ? "unknown" : friendsTableResponse[0].status
    console.log("Response sent by getuserDetail: ", user)
    return res.status(200).send(user)
  } catch (error) {
    console.error("Failed to get user detail from the backend: ", error)
    return res.status(500).json({ message: "Failed to get user detail from the backend" })
  }
}

// Key: `friendship:${user_id}:${friend_id}`
// Value: JSON.stringify({ exists: true, timestamp: Date.now() })
// TTL: Optional, based on how long you trust the cache
const sendFriendRequest = async (req, res) => {
  const { user_id, friend_id } = req.body;
  console.log(`Request received at sendFriendRequest with following: user_id -- ${user_id}, friend_id : ${friend_id}`)

  if (!user_id || user_id.trim().length === 0) {
    console.log("Empty user_id:", user_id);
    return res.status(400).json({ message: "Empty user_id" });
  }
  if (!friend_id || friend_id.trim().length === 0) {
    console.log("Empty friend_id:", friend_id);
    return res.status(400).json({ message: "Empty friend_id" });
  }

  try {
    const insertQuery = `INSERT INTO friends (id, user_id, friend_id, status) VALUES (UUID(), ?, ?, "pending")`;
    const [result] = await pool.query(insertQuery, [user_id, friend_id]);

    if (result.affectedRows > 0) {
      console.log("Friend record inserted successfully");
      //redis 
      const redisHash = `pending_requests:${friend_id}`;
      await redis.hset(redisHash, user_id, Date.now());  // user_id --- person who sends friend request
      await redis.set(`pending_requests_updated:${friend_id}`, Date.now());
      console.log("Redis updated with timestamp of friend_request")

      return res.status(200).json({ message: "Friend request sent successfully" });
    } else {
      console.log("No rows were inserted");
      return res.status(500).json({ message: "Failed to insert friend record" });
    }
  } catch (error) {
    console.error("Unable to add records in friends table:", error);
    if (error.code === "ER_DUP_ENTRY") 
      return res.status(400).json({ message: "Friendship already exists" });
    return res.status(500).json({ message: "Internal server error" });
  }
};

const acceptFriendRequest = async (req, res) => {
  const { user_id, friend_id } = req.body;
  if (!user_id || user_id.trim().length === 0) {
    console.log("Empty user_id:", user_id);
    return res.status(400).json({ message: "Empty user_id" });
  }
  if (!friend_id || friend_id.trim().length === 0) {
    console.log("Empty friend_id:", friend_id);
    return res.status(400).json({ message: "Empty friend_id" });
  }
  const query = `UPDATE friends SET status = "accepted" WHERE (user_id = ? AND friend_id = ?)`;  
  try {
    const [result] = await pool.query(query, [friend_id, user_id])
    if (result.affectedRows > 0) {
      console.log("Friend request accepted");
      //redis
      const redisHash = `pending_requests:${user_id}`;
      await redis.hdel(redisHash, friend_id);
      await redis.set(`accepted_requests_updated:${user_id}`, Date.now());

      console.log("Redis updated with timestamp of accepted_request")
      return res.status(200).json({ message: "Friend request accepted" });
    } else {
      return res.status(400).json({ message: "No pending friend request to accept" });
    }
  } catch (error) {
    console.error("Error accepting friend request:", error);
    return res.status(500).json({ message: "Couldn't accept friend request" });
  }
}

const displayFriendRequests = async (req, res) => {
  const start = Date.now();
  const accountHoldersId = decodeURIComponent(req.params?.userId);
  console.log("AccountHoldersId: ", accountHoldersId)
  if (!accountHoldersId || accountHoldersId === "") {
    console.log("Empty AccountHolders ID");
    return res.status(400).json({ error: "Account Holder's ID is required" });
  }
  const query = `SELECT friends.user_id, friends.status, friends.created_at, users.username, users.email
                 FROM friends 
                 JOIN users ON friends.user_id = users.id 
                 WHERE friends.friend_id = ? AND friends.status = "pending"`;

  //user_id corresponds to the person who sent the friend request in this case and friend_id is the account holder's id
  try {
    const pendingUpdated = await redis.get(`pending_requests_updated:${accountHoldersId}`);
    const acceptedUpdated = await redis.get(`accepted_requests_updated:${accountHoldersId}`);
    const cached = await redis.get(`cached_display_requests:${accountHoldersId}`);
    console.log("PendingUpdated: ", pendingUpdated);
    console.log("AcceptedUpdated: ", acceptedUpdated);
    console.log("Cached: ", cached)
    let latestUpdate = Math.max(pendingUpdated || 0, acceptedUpdated || 0);
    const isCacheValid = cached && (JSON.parse(cached).lastFetched >= latestUpdate);

    if (isCacheValid) {
      const data = JSON.parse(cached).data;
      const end = Date.now();
      console.log(`✅ Cache hit while returning friend requests - Time taken: ${end - start} ms`);
      return res.status(200).send(data);
    }

    const [results] = await pool.query(query, [ accountHoldersId ]);
    const response = { data: results, lastFetched: Date.now() };
    await redis.set(`cached_display_requests:${accountHoldersId}`, JSON.stringify(response));
    if (results.length === 0) {
      const end = Date.now();
      console.log(`🛢️ Cache miss (DB fetch) - Time taken: ${end - start} ms`);
      console.log("No Pending Requests");  
      return res.status(201).json({message: "No Pending Requests"});
    } else if (results.length > 0) {
      const end = Date.now();
      console.log(`🛢️ Cache miss (DB fetch) - Time taken: ${end - start} ms`);
      return res.status(200).send(results);
    }
  } catch (error) {
    console.error("Unable to fetch friend requests:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

const showConversation = async (req, res) => {
  const { userId1, userId2, timestamp, messageId } = req.query;

  console.log(`Request received at showConversation -- userId1: ${userId1}, userId2: ${userId2}, timestamp: ${timestamp}, messageId: ${messageId}`);

  if (!userId1 || !userId2) {
    return res.status(400).json({ message: 'Both userId1 and userId2 are required' });
  }

  let localConvertedTime = "";
  if (timestamp !== undefined) {
    localConvertedTime = dayjs.utc(timestamp).tz('America/Toronto').format('YYYY-MM-DD HH:mm:ss.SSS'); // converting utc time to local time for database operations (date comparisons)
    console.log("Converted local time: ", localConvertedTime);
  }

  const queryWithoutTimeStamp = `
    SELECT * FROM messages 
    WHERE ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
    ORDER BY created_at DESC, id DESC
    LIMIT 15
  `;

  const queryWithTimeStamp = `
    SELECT * FROM messages 
    WHERE ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
      AND (created_at < ? OR (created_at = ? AND id < ?))
    ORDER BY created_at DESC, id DESC
    LIMIT 15
  `;

  const updateQuery = `
    UPDATE messages 
    SET delivered = TRUE, delivered_at = CURRENT_TIMESTAMP 
    WHERE receiver_id = ? 
      AND sender_id = ? 
      AND delivered = FALSE
  `;

  const paramsQueryWithoutTimeStamp = [userId1, userId2, userId2, userId1];
  const paramsQueryWithTimeStamp = [userId1, userId2, userId2, userId1, localConvertedTime, localConvertedTime, messageId];

  const query = (localConvertedTime === undefined || messageId === undefined) ? queryWithoutTimeStamp : queryWithTimeStamp;

  const params = (query === queryWithoutTimeStamp) ? paramsQueryWithoutTimeStamp : paramsQueryWithTimeStamp;

  try {
    const [messages] = await pool.query(query, params);
    console.log("Response sent by showConversation: ", messages);
    
    res.status(200).send(messages);

    // Background update: set delivered = true for unseen messages
    await pool.query(updateQuery, [userId1, userId2]);

  } catch (error) {
    console.error("Database error:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

const showUnreadMessages = async (req, res) => {
  const { userId } = req.query;
  if (!userId || userId === undefined)
      return res.status(400).json({ message: "userId is required to fetch messages" });
  const query = `SELECT sender_id, COUNT(*) AS unread_count 
                 FROM messages 
                 WHERE receiver_id = ? AND delivered = FALSE 
                 GROUP BY sender_id`;
  try {
    const [result] = await pool.query(query, [userId]);
    console.log("Unread messages:")
    console.log(result);
    return res.status(200).send(result);
  } catch (error) {
    console.log("Error while fetching unread messages: ", error);
    return res.status(500).json({error: error})
  }
}

export { 
  fileUpload, 
  saveMessage, 
  getAllUsers, 
  fetchRecommendation, 
  fetchSearchAll, 
  getUserDetail, 
  sendFriendRequest, 
  acceptFriendRequest, 
  displayFriendRequests, 
  showConversation,
  showUnreadMessages 
};
