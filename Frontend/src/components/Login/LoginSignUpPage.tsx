import React, { useState } from 'react';
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore.ts";
import { auth } from "../../firebase.ts";
import { createUserWithEmailAndPassword } from "firebase/auth";
import axios from "axios";

type FormInput = {
  username?: string;
  email: string;
  password: string;
};

const LoginSignUpPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);

  const { register, handleSubmit, formState: { errors } } = useForm<FormInput>();

  const onSubmit: SubmitHandler<FormInput> = async (data) => {
    if (isLogin) {
      await login(data.email, data.password);
      navigate("/HomePage");
    } else {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            await axios.post(`${import.meta.env.VITE_BASE_URL}/users/register`, {
            username: data.username,
            email: data.email,
            fireBaseID: userCredential.user.uid,
            });
            alert("User registered successfully!");
            setIsLogin(true); 
        } catch (error: any) {
            if (error.code === "auth/email-already-in-use") {
            alert("Email is already in use. Please use a different email.");
            } else {
            console.error("Error registering user:", error.message);
            }
        }
    }
  };

  return (
    <div className='min-h-screen bg-gray-100 flex flex-col md:flex-row'>
      {/* Left Side */}
      <div className='w-full md:w-3/5 bg-gradient-to-br from-blue-800 to-blue-600 flex flex-col justify-center items-center p-8 text-white'>
        <div className='max-w-md'>
          <h1 className='text-4xl font-bold mb-2'>{isLogin ? 'Hello,' : 'Join Us,'}</h1>
          <h2 className='text-3xl font-bold mb-6'>{isLogin ? 'Welcome Back!' : 'Create Your Account'}</h2>
          <p className='text-lg mb-8 opacity-90'>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum laudantium architecto minus laborum dolor.
          </p>
          <div className='flex space-x-4'>
            <button className='px-6 py-2 border-2 border-white rounded-full text-white hover:bg-white hover:text-blue-800 transition duration-300'>
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full md:w-2/5 bg-white flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            {isLogin ? 'Login' : 'Register'}
          </h2>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  {...register("username", { required: !isLogin && "Username is required" })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="Your name"
                />
                {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                {...register("email", { required: "Email is required" })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="your@email.com"
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                {...register("password", { required: "Password is required" })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition duration-300"
            >
              {isLogin ? 'Login' : 'Register'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                <span className='cursor-pointer'> {isLogin ? "Sign up" : "Login"} </span>
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSignUpPage;