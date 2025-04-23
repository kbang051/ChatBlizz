import React from "react";
import { useUserSearchStore } from "../../store/useUserSearchStore";

const SearchAllUsers = () => {
  const { searchAllResults } = useUserSearchStore();
  console.log("searchAllResults used in SearchAllUsers.tsx: ", searchAllResults);
  return (
    <>    
        <div className="font-bold text-xl pb-2">
            <h3 >People</h3>
        </div>
        <div className="bg-white rounded-md shadow-md mt-2">
        {searchAllResults.map((item) => (
            <div
            key={item.id}
            className="p-4 hover:bg-gray-100 cursor-pointer flex justify-between items-center overflow-y-scroll"
            >
            <div className="flex items-center gap-4">
                <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-10 h-10 text-gray-500"
                >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
                </svg>

                <div>
                    <p className="font-semibold">{item.username}</p>
                    <p className="text-sm text-gray-600">{item.email}</p>
                </div>
            </div>

            <div>
                <p className="text-sm text-gray-500">
                    {item.status === 'unknown'  && <button className='bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded cursor-pointer'> Add Friend </button>}
                    {item.status === 'accepted' && <button className='bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded cursor-pointer'> Message </button>}
                    {item.status === 'pending'  && <button className='bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded cursor-pointer'> Cancel Request </button>}
                </p>
            </div>
            </div>
        ))}
        </div>
    </>
  );
};

export default SearchAllUsers;
