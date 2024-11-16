import React, { FormEvent, useEffect, useState } from "react";
import "./styles.scss"; // Assure-toi que le chemin vers le fichier SCSS est correct

export default function Header() {
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
      console.log("User state mis à jour:", user); // Log l'état "user" après sa mise à jour
    }
  }, [user]);

  return (
    <header className="header bg-white shadow-md py-4 px-6">
      {user ? (
        <div className="header-container flex items-center justify-between max-w-6xl mx-auto">
          <div className="header-logo">
            <h1 className="text-2xl font-bold text-blue-600">
              <a href="/page/home">CitaBibli</a>
            </h1>
          </div>
          <div className="header-search flex-1 mx-4">
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="header-links space-x-6 text-gray-600">
            <a
              href="/page/connexion"
              className="hover:text-blue-600 transition duration-200"
            >
              Mes citations enregistrées
            </a>
            <a
              href="/page/amis"
              className="hover:text-blue-600 transition duration-200"
            >
              Mes Amis
            </a>
            <a
              href="/page/profile"
              className="hover:text-blue-600 transition duration-200"
            >
              Mon Profil
            </a>
          </div>
        </div>
      ) : (
        <div className="header-container flex items-center justify-between max-w-6xl mx-auto">
          <div className="header-logo">
            <h1 className="text-2xl font-bold text-blue-600">CitaBibli</h1>
          </div>
          <div className="header-search flex-1 mx-4">
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="header-links space-x-6 text-gray-600">
            <a
              href="/page/connexion"
              className="hover:text-blue-600 transition duration-200"
            >
              Connexion
            </a>
            <a
              href="/page/profile"
              className="hover:text-blue-600 transition duration-200"
            >
              Mon Profil
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
