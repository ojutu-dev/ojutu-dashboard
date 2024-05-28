"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const [username, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  const isValidEmail = (email) => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return emailRegex.test(email);
  }; 
  const isValidUsername = (userName) => {
    const userNameRegex = /^[a-zA-Z0-9]+$/ ;
    return userNameRegex.test(userName);
  }; 

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
        setError("Email is invalid");
        return;
      }

      if (!isValidUsername(username)) {
        setError("Username is invalid");
        return;
      }
  

    if (!username || !email || !password) {
      setError("All fields are necessary.");
      return;
    }

    try {
  
      const res = await fetch("api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      })
       if(res.status === 400) {
        setError("This email is already registered")
      } if (res.ok) {
        setError("");
        router.push("/");
      } 
    } catch (error) {
        setError("Error, try again");
        console.log("Error during registration: ", error);
    }
};


  return (
    <div className="grid place-items-center h-screen">
      <div className="shadow-lg p-8 rounded-lg border-t-4 border-black w-[30%]">
        <h1 className="text-xl font-bold my-4 text-center">Register</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            onChange={(e) => setName(e.target.value)}
            type="text"
            placeholder="Username"
            className="p-4 "
          />
          <input
            onChange={(e) => setEmail(e.target.value)}
            type="text"
            placeholder="Email"
            className="p-4 "
          />
          <input
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="p-4 "
          />
          <button className="bg-black text-white font-bold cursor-pointer mt-4 px-6 py-2">
            Register
          </button>

          {error && (
            <div className="bg-black text-white w-fit text-sm py-1 px-3 rounded-md mt-2">
              {error}
            </div>
          )}

          <Link className="text-sm mt-3 text-right" href={"/"}>
            <span className="underline">Login</span>
          </Link>
        </form>
      </div>
    </div>
  );
}