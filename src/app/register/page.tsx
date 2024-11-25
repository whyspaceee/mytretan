"use client"
import { useState } from "react";
import {  useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod"
import { api } from "~/trpc/react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form} from "~/components/ui/form";
import { Input } from "~/components/ui/input"


// Define Zod schema for validation
const RegisterSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Register() {
  const [error, setError] = useState<string | null>(null);
  const registerUser = api.auth.register.useMutation({
    onSuccess: () => {
      alert("User registered successfully!");
    },
    onError: (error) => {
      setError(error.message);
    }
  });

  const form = useForm({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: '',
      name: '',
      password: '',
    },
  });


  const onSubmit = (data: {
    email: string;
    name: string;
    password: string;
  }) => {
    registerUser.mutate(data);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-md space-y-6">
          <h1 className="text-2xl font-bold">Register</h1>

          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email" {...field} />
                </FormControl>
                <FormMessage>{form.formState.errors.email?.message}</FormMessage>
              </FormItem>
            )}
          />

          {/* Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your name" {...field} />
                </FormControl>
                <FormMessage>{form.formState.errors.name?.message}</FormMessage>
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Enter your password" {...field} />
                </FormControl>
                <FormMessage>{form.formState.errors.password?.message}</FormMessage>
              </FormItem>
            )}
          />

          {/* Display error if any */}
          {error && <p className="text-red-600">{error}</p>}

          {/* Register Button */}
          <Button type="submit" className="w-full">Register</Button>
        </form>
      </Form>
    </div>
  );

}
