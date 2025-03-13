import { pool } from "../index.js";
import ApiResponse from "../utils/ApiResponse.js";

const saveMessage = async (sender_id, receiver_id, content) => {
  const query = `INSERT INTO messages 
                 (UUID(), sender_id, receiver_id, message)
                 VALUES (?, ?, ?)`;
  try {
    const [insertMessage] = await pool.query(query, [sender_id, receiver_id, content]);
    console.log("Message inserted successfully in the message table");
    console.log(insertMessage);
  } catch (error) {
    console.error("Unable to insert message: ", error);
  }
};

const getAllUsers = async (req, res) => { 
  const query = `SELECT id, username, email FROM users`;
  try {
    const [getRecords] = await pool.query(query);
    if (getRecords.length > 0)
      console.log("Records fetched from users table:", getRecords);
    else 
      console.log("No users found in the database");
    return res.status(200).send(getRecords);
  } catch (error) {
    console.log("Unable to fetch details of all users:", error);
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
  const query2 = `SELECT status FROM friends WHERE user_id = ? AND friend_id = ? LIMIT 1`
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
      pool.query(query2, [user_id, friend_id]),
    ])
  
    const user = userTableResponse[0]
    if (friendsTableResponse.length === 0 || friendsTableResponse[0].status === "pending" || friendsTableResponse[0].status === "rejected")
      user.friendStatus = false 
    else 
      user.friendStatus = true

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

export { saveMessage, getAllUsers, fetchSearchResults, getUserDetail, sendFriendRequest, acceptFriendRequest };


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