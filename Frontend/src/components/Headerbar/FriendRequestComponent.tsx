import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore.ts';
import { useChatStore } from '../../store/useChatStore.ts';

interface FriendRequestResponse {
  user_id: string;
  status: string;
  created_at: Date;
  username: string;
  email: string;
}

const FriendRequestComponent: React.FC = () => {
  const { userId, authenticationToken } = useAuthStore();
  const { setUsers } = useChatStore();
  const [friendRequests, setFriendRequests] = useState<FriendRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/users/displayFriendRequests/${userId}`,
          { headers: { Authorization: `Bearer ${authenticationToken}` } }
        );
        setFriendRequests(res.data);
      } catch (error) {
        console.error('Unable to fetch friend requests', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFriendRequests();
  }, [userId, authenticationToken]);

  useEffect(() => {
    console.log("Friend Requests", friendRequests)
  },[friendRequests])

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="bg-white border rounded-md p-2 shadow-md w-64 absolute right-3 z-50 max-h-100 overflow-y-scroll">
      <h2 className="text-lg font-semibold mb-2">Friend Requests</h2>
      {friendRequests.length > 0 ? (
        friendRequests.map((req) => (
          <div
            key={req.user_id}
            className="flex justify-between items-center mb-2 gap-3"
          >
            <span className="hover:underline hover:text-blue-500 hover:cursor-pointer">
              {req.username}
            </span>
            <div className="flex gap-1">
              <button
                className="btn bg-blue-500 font-semibold px-2 py-1 rounded-lg hover:cursor-pointer hover:bg-blue-600"
                onClick={async () => {
                  console.log(`Ids sent to backend to acceptRequest ----------- user_id: ${userId}, friend_id: ${req.user_id}`);
                  await axios
                    .post(
                      `${import.meta.env.VITE_BASE_URL}/users/acceptFriendRequest`,
                      { user_id: userId, friend_id: req.user_id },
                      { headers: {Authorization: `Bearer ${authenticationToken}`}}
                    )
                    .then(() => {
                      setFriendRequests((prev) => prev.filter((item) => item.user_id !== req.user_id));
                      setUsers(req.user_id, req.username, req.email);
                    })
                    .catch((error) => {
                      console.log("An error occured while accepting friend request: ",error);
                      return;
                    });
                }}
              >
                Accept
              </button>
              <button className="btn bg-red-500 font-semibold px-2 py-1 rounded-lg hover:cursor-pointer hover:bg-red-600">
                Reject
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-500">No Friend Requests</p>
      )}
    </div>
  );
};

export default FriendRequestComponent;
