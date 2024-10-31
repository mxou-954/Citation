"use client";
"use strict";

import React, { FormEvent, useEffect, useState } from "react";
import "./styles.scss"; // Assure-toi que le chemin vers le fichier SCSS est correct
import Header from "@/app/components/Header/Header";
import {
  ConnexionData,
  APIResponse,
} from "@/app/interface/connexion/connexion";

export default function Connexion() {
  const [formData, setFormData] = useState<ConnexionData>({
    email: "",
    password: "",
  });
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    fetch("http://localhost:3000/session", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.id) {
          setUser(data);
          console.log("Utilisateur connecté", data);
        } else {
          setUser(null);
          console.log("Aucun utilisateur connecté");
        }
      })
      .catch((error) => console.error("ERREUR: ", error));
  }, []);

  useEffect(() => {
    if (user) {
      console.log('User state mis à jour:', user);  // Log l'état "user" après sa mise à jour
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const { email, password } = formData;

    const toSend = {
      email,
      password,
    };

    try {
      const response = await fetch("http://localhost:3000/connexion/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(toSend),
      });
      if (response.ok) {
        const data: APIResponse = await response.json();
        if (data.success) {
          alert("Vous etes connectés !!");
          console.log(data);
        } else {
          alert("Une erreur détecté !");
          console.log("ERREUR: " + data.message);
        }
      } else {
        alert("Une erreur a été détecté !");
      }
    } catch (err) {
      alert("Une erreur a été détecté !!");
      console.log("ERREUR : " + err);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center">
  <Header />
  {user ? (
    <div className="welcome-message text-center mt-8">
      <h2 className="text-2xl font-bold text-gray-800">Bienvenue !</h2>
      <p className="text-gray-600 mt-2">
        Vous êtes connecté avec l'email <span className="font-semibold">{user?.email}</span>.
      </p>
    </div>
  ) : (
    <div className="connexion-container w-full max-w-md mx-auto bg-white p-8 shadow-lg rounded-lg mt-6">
      <form className="connexion-form space-y-4" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-semibold text-center text-gray-800">Connexion</h2>

        <div className="form-group">
          <label htmlFor="email" className="block text-sm font-medium text-gray-600">
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Entrez votre email"
            required
            className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="block text-sm font-medium text-gray-600">
            Mot de passe
          </label>
          <input
            type="password"
            name="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Entrez votre mot de passe"
            required
            className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="submit-btn w-full bg-blue-500 text-white py-2 rounded-md font-semibold hover:bg-blue-600 transition duration-200"
        >
          Connexion
        </button>

        <div className="text-center mt-4">
          <a href="/page/inscription" className="text-blue-500 hover:underline">
            Inscription
          </a>
        </div>
      </form>
    </div>
  )}
</div>
  );
  
}
