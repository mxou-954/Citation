import React, { useState, useEffect, FormEvent } from "react";
import "./styles.scss";
import { QuotesData, APIResponse } from "@/app/interface/addQuotes/addQuotes";

export default function AddQuotes() {
  const [isClicked, setIsClicked] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [userData, setUserData] = useState<QuotesData>({
    quote: "",
    author: "",
    date: new Date(),
  });

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
      console.log("User state mis à jour:", user);
    }
  }, [user]);

  const handleClick = () => {
    setIsClicked(!isClicked);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const { quote, date, author } = userData;
    const toSend = {
      quote,
      author,
      date,
    };

    try {
      const response = await fetch("http://localhost:3000/quote/new", {
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
          alert("Votre citation a été posté");
        } else {
          alert("Un problème a eu lieu");
          console.log("ERREUR : " + data.message);
        }
      } else {
        alert("ERREUR : " + response.status);
      }
    } catch (err) {
      alert("ERREUR");
      console.log("ERREUR : " + err);
    }
  };

  return (
    <div className="">

      {/* Formulaire d'ajout de citation en modal */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center transition-opacity ${
          isClicked ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <div className="w-full max-w-md bg-white p-6 shadow-lg rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Nouvelle Citation :
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label
                htmlFor="quote"
                className="block text-sm font-medium text-gray-600"
              >
                Citation :
              </label>
              <textarea
                required
                name="quote"
                value={userData.quote}
                onChange={handleChange}
                id="quote"
                className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="form-group">
              <label
                htmlFor="author"
                className="block text-sm font-medium text-gray-600"
              >
                Auteur :
              </label>
              <input
                required
                name="author"
                value={userData.author}
                onChange={handleChange}
                id="author"
                type="text"
                className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="form-group">
              <input
                type="submit"
                value="Poster"
                className="w-full bg-blue-500 text-white py-2 rounded-md font-semibold hover:bg-blue-600 transition duration-200 cursor-pointer"
              />
            </div>
          </form>
          <button
            onClick={handleClick}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            Fermer
          </button>
        </div>
      </div>

      {/* Bouton en bas à droite pour ajouter des citations */}
      <button
        onClick={handleClick}
        className="fixed bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition duration-200"
      >
        <svg viewBox="0 0 20 20" className="w-6 h-6">
          <path d="M14.613,10c0,0.23-0.188,0.419-0.419,0.419H10.42v3.774c0,0.23-0.189,0.42-0.42,0.42s-0.419-0.189-0.419-0.42v-3.774H5.806c-0.23,0-0.419-0.189-0.419-0.419s0.189-0.419,0.419-0.419h3.775V5.806c0-0.23,0.189-0.419,0.419-0.419s0.42,0.189,0.42,0.419v3.775h3.774C14.425,9.581,14.613,9.77,14.613,10 M17.969,10c0,4.401-3.567,7.969-7.969,7.969c-4.402,0-7.969-3.567-7.969-7.969c0-4.402,3.567-7.969,7.969-7.969C14.401,2.031,17.969,5.598,17.969,10 M17.13,10c0-3.932-3.198-7.13-7.13-7.13S2.87,6.068,2.87,10c0,3.933,3.198,7.13,7.13,7.13S17.13,13.933,17.13,10"></path>
        </svg>
      </button>
    </div>
  );
}
