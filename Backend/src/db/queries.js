import { pool } from "../index.js";
import ApiResponse from "../utils/ApiResponse.js";

const saveMessage = async (sender_id, receiver_id, content) => {
  const query = `INSERT INTO messages 
                 (id, sender_id, receiver_id, message)
                 VALUES (UUID(), ?, ?, ?)`;
  try {
    const [insertMessage] = await pool.query(query, [sender_id, receiver_id, content]);
    console.log("Message inserted successfully in the message table");
  } catch (error) {
    console.error("Unable to insert message: ", error);
  }
};

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

const fetchSearchResults = async (req, res) => {
  console.log("Request received to fetch search result")
  const q = decodeURIComponent(req.params?.q); //search param
  console.log ("Request Parameter: ", q)
  const query = `SELECT id, username, email FROM users WHERE LOWER(username) LIKE LOWER(?) LIMIT 6`;
  try {
    const [getProfiles] = await pool.query( query, [`%${q}%`] );
    if (getProfiles.length > 0)
        console.log(`Profiles fetched from the backend for input like ${q}: `, getProfiles)
    else 
      console.log("No matching entries in the database for input like: ", q)
    return res.status(200).send(getProfiles);
  } catch (error) {
    console.log("Error while fetching profiles from the backend:", error)
  }
}

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

const sendFriendRequest = async (req, res) => {
  const { user_id, friend_id } = req.body;

  if (!user_id || user_id.trim().length === 0) {
    console.log("Empty user_id:", user_id);
    return res.status(400).json({ message: "Empty user_id" });
  }
  if (!friend_id || friend_id.trim().length === 0) {
    console.log("Empty friend_id:", friend_id);
    return res.status(400).json({ message: "Empty friend_id" });
  }

  const checkQuery = `SELECT * FROM friends WHERE user_id = ? AND friend_id = ? LIMIT 1`;

  try {
    const [existingRecord] = await pool.query(checkQuery, [user_id, friend_id]);
    if (existingRecord.length > 0) {
      console.log("A record already exists in the friends database");
      return res.status(400).json({ message: "Friendship already exists" });
    }

    const insertQuery = `INSERT INTO friends (id, user_id, friend_id, status) VALUES (UUID(), ?, ?, "pending")`;
    const [result] = await pool.query(insertQuery, [user_id, friend_id]);

    if (result.affectedRows > 0) {
      console.log("Friend record inserted successfully");
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
  const query = `UPDATE friends SET status = "accepted" WHERE (user_id = ? AND friend_id = ?) 
                 OR (user_id = ? AND friend_id = ?)`;  
  try {
    const [result] = await pool.query(query, [user_id, friend_id, friend_id, user_id])
    if (result.affectedRows > 0) {
      console.log("Friend request accepted");
      return res.status(200).json({ message: "Friend request accepted" });
    } else {
      console.log("Couldn't accept friend request");
      return res.status(500).json({ message: "Couldn't accept friend request" });
    }
  } catch (error) {
    console.error("Error accepting friend request:", error);
    return res.status(500).json({ message: "Couldn't accept friend request" });
  }
}

const displayFriendRequests = async (req, res) => {
  const accountHoldersId = decodeURIComponent(req.params?.userId);
  console.log("AccountHoldersId: ", accountHoldersId)
  if (!accountHoldersId || accountHoldersId === "") {
    console.log("Empty AccountHolders ID");
    return res.status(400).json({ error: "Account Holder's ID is required" });
  }
  const query = `SELECT friends.user_id, friends.status, friends.created_at, users.username 
                 FROM friends 
                 JOIN users ON friends.user_id = users.id 
                 WHERE friends.friend_id = ? AND friends.status = "pending"`;
  //user_id corresponds to the person who sent the friend request in this case and friend_id is the account holder's id
  try {
    const [response] = await pool.query(query, [ accountHoldersId ]);
    if (response.length === 0) {
      console.log("No Pending Requests"); 
      return res.status(201).json({message: "No Pending Requests"});
    } else if (response.length > 0) {
      return res.status(200).send(response);
    }
  } catch (error) {
    console.error("Unable to fetch friend requests:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

const showConversation = async (req, res) => {
  // userId1: cbtkFasu9yVa2VI6VFlDREoiBvi2, userId2: nazVGdU3B3UCuz1c3HvqPBc6H722, cursor: undefined, limit: 20
  const { userId1, userId2, cursor, limit = 15 } = req.query
  console.log(`Request received at showConversation -- userId1: ${userId1}, userId2: ${userId2}, cursor: ${cursor}, limit: ${limit}`)
  if (!userId1 || !userId2) {
    return res.status(400).json({ message: 'Both userId1 and userId2 are required' });
  }
  const query = ` SELECT * FROM messages 
                  WHERE ((sender_id = ? AND receiver_id = ?) 
                  OR (sender_id = ? AND receiver_id = ?))
                  ${cursor ? "AND created_at < ?" : ""}
                  ORDER BY created_at DESC
                  LIMIT ? `;
  
  const params = cursor ? [userId1, userId2, userId2, userId1, cursor, parseInt(limit)] : [userId1, userId2, userId2, userId1, parseInt(limit)];

  try {
    const [messages] = await pool.query(query, params);
    console.log("Response sent by showConversations: ", messages)
    if (messages.length === 0) {
      return res.status(200).json([]); 
    }
    return res.status(200).json(messages);
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export { saveMessage, getAllUsers, fetchSearchResults, getUserDetail, sendFriendRequest, acceptFriendRequest, displayFriendRequests, showConversation };


// {
//   "data": [
//     {
//       "id": "18081ab2-fa21-11ef-9670-c894028360ae",
//       "username": "dummyUser1",
//       "email": "dummy1@gmail.com"
//     },
//     {
//       "id": "28abdb7f-fa21-11ef-9670-c894028360ae",
//       "username": "dummyUser3",
//       "email": "dummy3@gmail.com"
//     },
//     {
//       "id": "2e59f16c-fa21-11ef-9670-c894028360ae",
//       "username": "dummyUser5",
//       "email": "dummy5@gmail.com"
//     },
//     {
//       "id": "33d16282-fa21-11ef-9670-c894028360ae",
//       "username": "dummyUser8",
//       "email": "dummy8@gmail.com"
//     },
//     {
//       "id": "3a6f99a1-fa21-11ef-9670-c894028360ae",
//       "username": "dummyUser10",
//       "email": "dummy10@gmail.com"
//     },
//     {
//       "id": "3ebc5f74-fa21-11ef-9670-c894028360ae",
//       "username": "dummyUser13",
//       "email": "dummy13@gmail.com"
//     },
//     {
//       "id": "454d63ae-fa21-11ef-9670-c894028360ae",
//       "username": "dummyUser18",
//       "email": "dummy18@gmail.com"
//     },
//     {
//       "id": "4aff5f7e-fa21-11ef-9670-c894028360ae",
//       "username": "dummyUser25",
//       "email": "dummy25@gmail.com"
//     },
//     {
//       "id": "50e15729-fa21-11ef-9670-c894028360ae",
//       "username": "dummyUser30",
//       "email": "dummy30@gmail.com"
//     },
//     {
//       "id": "55a13bc4-fa21-11ef-9670-c894028360ae",
//       "username": "dummyUser32",
//       "email": "dummy32@gmail.com"
//     },
//     {
//       "id": "5a8b66a4-fa21-11ef-9670-c894028360ae",
//       "username": "dummyUser35",
//       "email": "dummy35@gmail.com"
//     },
//     {
//       "id": "60022f49-fa21-11ef-9670-c894028360ae",
//       "username": "dummyUser36",
//       "email": "dummy36@gmail.com"
//     },
//     {
//       "id": "65faeffd-fa21-11ef-9670-c894028360ae",
//       "username": "dummyUser40",
//       "email": "dummy40@gmail.com"
//     },
//     {
//       "id": "6a478eef-fa21-11ef-9670-c894028360ae",
//       "username": "dummyUser42",
//       "email": "dummy42@gmail.com"
//     },
//     {
//       "id": "6e9d0e96-fa21-11ef-9670-c894028360ae",
//       "username": "dummyUser45",
//       "email": "dummy45@gmail.com"
//     },
//     {
//       "id": "7334f60a-fa21-11ef-9670-c894028360ae",
//       "username": "dummyUser48",
//       "email": "dummy48@gmail.com"
//     },
//     {
//       "id": "78296f59-fa21-11ef-9670-c894028360ae",
//       "username": "dummyUser50",
//       "email": "dummy50@gmail.com"
//     },
//     {
//       "id": "d8228936-f962-11ef-9d69-c894028360ae",
//       "username": "kartikbanga",
//       "email": "kartikbanga@gmail.com"
//     }
//   ],
//   "status": 200,
//   "statusText": "OK",
//   "headers": {
//     "content-length": "1779",
//     "content-type": "application/json; charset=utf-8"
//   },
//   "config": {
//     "transitional": {
//       "silentJSONParsing": true,
//       "forcedJSONParsing": true,
//       "clarifyTimeoutError": false
//     },
//     "adapter": [
//       "xhr",
//       "http",
//       "fetch"
//     ],
//     "transformRequest": [
//       null
//     ],
//     "transformResponse": [
//       null
//     ],
//     "timeout": 0,
//     "xsrfCookieName": "XSRF-TOKEN",
//     "xsrfHeaderName": "X-XSRF-TOKEN",
//     "maxContentLength": -1,
//     "maxBodyLength": -1,
//     "env": {},
//     "headers": {
//       "Accept": "application/json, text/plain, */*"
//     },
//     "method": "get",
//     "url": "http://localhost:8000/api/v1/users/getAllUsers",
//     "allowAbsoluteUrls": true
//   },
//   "request": {}
//}