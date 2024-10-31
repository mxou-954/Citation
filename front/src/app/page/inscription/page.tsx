"use client";
"use strict";

import React, { useState, FormEvent } from "react";
import "./styles.scss"; // Assure-toi que le chemin vers le fichier SCSS est correct
import Header from "@/app/components/Header/Header";
import { APIResponse, InscriptionData } from "@/app/interface/inscription/inscription";

export default function Inscription() {
  const [formData, setFormData] = useState<InscriptionData>({
    nom: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const { nom, email, password, confirmPassword } = formData;

    if (nom == "" || email == "" || password == ""){
      alert("Vous devez remplir les champs demandés")
      return;
    }
    
    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    const toSend = {
      nom, 
      email, 
      password, 
      confirmPassword,
    }

    if (email.includes("@")) {
      try {
        const response = await fetch("http://localhost:3000/inscription/new", {
          method: "POST",
          headers: {
            "Content-Type" : "application/json",
          },
          body : JSON.stringify(toSend)
        })
        if (response.ok) {
          const data: APIResponse = await response.json();
          if (data.success) {
            alert("Inscription terminée !")
            console.log(data)
          } else {
            alert("Une erreur a été détecté")
            console.log("ERREUR: " + data.message)
          }
        }
      } catch (err) {
        alert("Une erreur est survenu")
        console.log("ERREUR: " + err)
      }
      
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center">
    <Header />
    <div className="inscription-container w-full max-w-md mx-auto bg-white p-8 shadow-lg rounded-lg mt-6">
      <form className="inscription-form space-y-4" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-semibold text-center text-gray-800">Créer un compte</h2>
  
        <div className="form-group">
          <label htmlFor="nom" className="block text-sm font-medium text-gray-600">
            Nom
          </label>
          <input
            type="text"
            name="nom"
            id="nom"
            value={formData.nom}
            onChange={handleChange}
            placeholder="Entrez votre nom"
            required
            className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
  
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
  
        <div className="form-group">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-600">
            Confirmer mot de passe
          </label>
          <input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirmez votre mot de passe"
            required
            className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
  
        <button
          type="submit"
          className="submit-btn w-full bg-blue-500 text-white py-2 rounded-md font-semibold hover:bg-blue-600 transition duration-200"
        >
          Inscription
        </button>
  
        <div className="text-center mt-4">
          <a href="/page/connexion" className="text-blue-500 hover:underline">
            Connexion
          </a>
        </div>
      </form>
    </div>
  </div>
  );
}
