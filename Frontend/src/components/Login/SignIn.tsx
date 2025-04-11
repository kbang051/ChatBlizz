import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore.ts";

type FormInput = {
  email: string;
  password: string;
};

const SignIn = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm<FormInput>();
  
  const Login: SubmitHandler<FormInput> = async (data) => {
    await login(data.email, data.password);
    navigate("/HomePage");
  };

  return (
    <>
      <form onSubmit={handleSubmit(Login)}>
        <label>Email</label>
        <input {...register("email", { required: "Email is required" })} />
        {errors.email && <p>{errors.email.message}</p>}

        <label>Password</label>
        <input {...register("password", { required: "Password is required" })} type="password" />
        {errors.password && <p>{errors.password.message}</p>}

        <input type="submit" value="Sign In" />
      </form>
    </>
  );
};

export default SignIn;
