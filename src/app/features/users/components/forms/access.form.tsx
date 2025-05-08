"use client";

import BtnLogin, { BtnSignUp } from "../buttons/btnAccess";
import {
  UserLoginInterface,
  UserSignUpInterface,
} from "../../interfaces/access.interface";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth.context";

export function FormLogin() {
  const [formLogin, setFormLogin] = useState<UserLoginInterface>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string[]>([""]);
  const { login } = useAuth();

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/login", {
        method: "POST",
        body: JSON.stringify(formLogin),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if(res.ok){
        const data = await res.json();
        
        if (data.message.length > 0) {
          setMessage([data.message]);
        }
        if (data.message === "Login successfully!") {
          login(data.metadata.user.id);
  
          localStorage.setItem("username", data.metadata.user.name);
          setTimeout(() => {
            router.push("/home");
          }, 1000);
        }
      }
      
      
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-5 text-left w-1/2 mx-auto">
        <p className="text-[var(--foreground-subTitle)]">Email</p>
        <span>
          <input
            type="text"
            name="email"
            className="border-b outline-0 w-full py-1"
            onChange={(e) =>
              setFormLogin({ ...formLogin, email: e.target.value })
            }
          />
        </span>
        <p className="text-[var(--foreground-subTitle)]">Password</p>
        <span>
          <input
            type="text"
            name="password"
            className="border-b outline-0 w-full py-1"
            onChange={(e) =>
              setFormLogin({ ...formLogin, password: e.target.value })
            }
          />
        </span>
      </div>
      <BtnLogin loading={isLoading} />
      {message.length > 0 && (
        <div className="flex flex-col mt-5">
          {message.map((mess, index) => {
            return (
              <div
                key={index}
                className={`${
                  mess === "Login successfully!"
                    ? "text-green-400"
                    : "text-red-400"
                } font-bold`}
              >
                {mess}
              </div>
            );
          })}
        </div>
      )}
    </form>
  );
}

export function FormSignUp() {
  const [formSignUp, setFormSignUp] = useState<UserSignUpInterface>({
    name: "",
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string[]>([""]);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await fetch("/api/user/sign-up", {
        method: "POST",
        body: JSON.stringify(formSignUp),
      });
      const data = await result.json();
      if (
        data.message === "Register successfully!" ||
        data.message === "User already registed!!!"
      ) {
        setMessage([data.message]);

        if (data.message === "Register successfully!") {
          localStorage.setItem("username", formSignUp.name ?? "");
          setTimeout(() => {
            router.push("/home");
          }, 1000);
        }
      }
    } catch (error) {
      console.error("SignUp failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-5 text-left w-1/2 mx-auto">
        <p className="text-[var(--foreground-subTitle)]">User name</p>
        <span>
          <input
            type="text"
            name="username"
            className="border-b outline-0 w-full py-1"
            onChange={(e) =>
              setFormSignUp({ ...formSignUp, name: e.target.value })
            }
          />
        </span>
        <p className="text-[var(--foreground-subTitle)]">Email</p>
        <span>
          <input
            type="text"
            name="email"
            className="border-b outline-0 w-full py-1"
            onChange={(e) =>
              setFormSignUp({ ...formSignUp, email: e.target.value })
            }
          />
        </span>
        <p className="text-[var(--foreground-subTitle)]">Password</p>
        <span>
          <input
            type="text"
            name="password"
            className="border-b outline-0 w-full py-1"
            onChange={(e) =>
              setFormSignUp({ ...formSignUp, password: e.target.value })
            }
          />
        </span>
      </div>
      <BtnSignUp loading={isLoading} />
      {message.length > 0 &&
        message[0] !== "Register successfully!" &&
        message[0] !== "" && (
          <p className="mt-5 text-red-400 font-bold w-1/2 mx-auto text-left">
            Error:
          </p>
        )}
      {message.length > 0 && (
        <div className="flex flex-col mt-3 mx-auto w-1/2 text-left">
          {message.map((mess, index) => {
            return (
              <div
                key={index}
                className={`${
                  mess === "Register successfully!"
                    ? "text-green-400"
                    : "text-red-400"
                } font-bold`}
              >
                {mess}
              </div>
            );
          })}
        </div>
      )}
    </form>
  );
}
