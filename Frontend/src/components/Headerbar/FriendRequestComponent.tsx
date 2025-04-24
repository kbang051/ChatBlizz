import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';

interface FriendRequestResponse {
  user_id: string;
  status: string;
  created_at: Date;
  username: string;
}

const FriendRequestComponent: React.FC = () => {
  const { userId, authenticationToken } = useAuthStore();
  const [friendRequests, setFriendRequests] = useState<FriendRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/users/displayFriendRequests/${userId}`,
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

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="bg-white border rounded-md p-4 shadow-md w-64 absolute right-3 z-50 max-h-100 overflow-y-scroll">
      <h2 className="text-lg font-semibold mb-2">Friend Requests</h2>
      {friendRequests.length > 0 ? (
        friendRequests.map((req) => (
          <div key={req.user_id} className="flex justify-between items-center mb-2">
            <span>{req.username}</span>
            <span className="text-sm text-gray-500">{req.status}</span>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-500">No friend requests</p>
      )}
    </div>
  );
};

export default FriendRequestComponent;
