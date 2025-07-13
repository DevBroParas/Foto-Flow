import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { register } from "@/app/authSlice";
import { useNavigate } from "react-router-dom";

const RegisterPageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterPageFormData = z.infer<typeof RegisterPageSchema>;

const RegisterPage = () => {
  const {
    register: formRegister, // rename to avoid clash with redux register
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterPageFormData>({
    resolver: zodResolver(RegisterPageSchema),
  });

  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { error } = useAppSelector((state) => state.auth);

  const onSubmit = async (data: RegisterPageFormData) => {
    try {
      setLoading(true);
      const res = await dispatch(register(data)).unwrap();
      if (res) {
        navigate("/media"); // navigate on success like login page
      }
    } catch (error) {
      console.error("Register failed:", error);
      // Optional: show UI error state here if you want
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <h1 className="text-3xl font-bold mb-4">Register</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <Input type="text" placeholder="Name" {...formRegister("name")} />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Input type="email" placeholder="Email" {...formRegister("email")} />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Input
            type="password"
            placeholder="Password"
            {...formRegister("password")}
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </Button>
      </form>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      <p className="mt-4">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-500 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
