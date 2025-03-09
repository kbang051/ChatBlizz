import React from "react";
import axios from "axios";
import { auth } from "../../firebase.ts";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useForm, SubmitHandler } from "react-hook-form";

const RegisterUser = () => {
  type FormInput = {
    username: string;
    email: string;
    password: any;
  };

  const { register, handleSubmit, formState: { errors } } = useForm<FormInput>();

  const signUp = async (data): SubmitHandler<FormInput> => {
    createUserWithEmailAndPassword(auth, data.email, data.password)
      .then((userCredentials) => {
        axios.post("http://localhost:8000/api/v1/users/register", {
          username: data.username,
          email: data.email,
          fireBaseID: userCredentials.user.uid,
        });
      })
      .catch((error) => {
        if (error.code === "auth/email-already-in-use")
          console.log("Email is already in use. Please use a different email.");
        else console.error("Error registering user:", error.message);
      });
  };

  return (
    <>
      <form onSubmit={handleSubmit(signUp)}>
        <label>username</label>
        <input
          {...register("username", { required: "Username is required" })}
        />
        {errors.username && <p>{errors.username.message}</p>}
        <label>email</label>
        <input {...register("email")} />
        {errors.email && <p>{errors.email.message}</p>}
        <label>password</label>
        <input
          {...register("password", { required: "Password is required" })}
          type="password"
        />
        <input type="submit" />
      </form>
    </>
  );
};

export default RegisterUser;
