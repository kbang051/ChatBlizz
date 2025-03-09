import React from "react";
import { auth } from "../../firebase.ts";
import { useForm, SubmitHandler } from "react-hook-form";
import { signInWithEmailAndPassword } from "firebase/auth";

const SignIn = () => {
  type FormInput = {
    email: string;
    password: any;
  };

  const { register, handleSubmit, formState: { errors } } = useForm<FormInput>();

  const Login = async (data): SubmitHandler<FormInput> => {
    try {
      const userCredential = await signInWithEmailAndPassword( auth, data.email, data.password );
      const user = userCredential.user;
      const idToken = await user.getIdToken();
      console.log(idToken);
      console.log("LoggedIn Successfully");
    } catch (error) {
      console.error("Error Signing In", error.message);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(Login)}>
        <label>email</label>
        <input {...register("email", { required: "Email is required" })} />
        {errors.email && <p>{errors.email.message}</p>}
        <label>password</label>
        <input {...register("password", { required: "Password is required" })} type="password"/>
        <input type="submit" />
      </form>
    </>
  );
};

export default SignIn;
