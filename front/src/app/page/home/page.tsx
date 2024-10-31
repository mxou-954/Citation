"use client";
"use strict";

import React, { FormEvent, useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import "./styles.scss";
import { QuotesData, APIResponse } from "@/app/interface/addQuotes/addQuotes";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter(); // Hook pour rediriger
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [quotes, setQuotes] = useState<QuotesData[]>([]); // Liste des citations avec les données
  const [likedQuotes, setLikedQuotes] = useState<number[]>([]); // Initialise `likedQuotes` comme un tableau d'IDs de citations likées

  useEffect(() => {
    const fetchLikesForQuotes = async () => {
      try {
        const updatedQuotes = await Promise.all(
          quotes.map(async (quote) => {
            const response = await fetch(
              `http://localhost:3000/quote/likes/${quote.id}`
            );
            if (response.ok) {
              const data = await response.json();
              if (data.success) {
                return { ...quote, like: data.likes }; // Met à jour le nombre de likes pour chaque citation
              }
            }
            return quote; // Retourne la citation inchangée si la requête a échoué
          })
        );
        setQuotes(updatedQuotes); // Met à jour l'état des citations avec les likes chargés
      } catch (err) {
        console.error("Erreur lors du chargement des likes :", err);
      }
    };

    fetchLikesForQuotes();
  }, [quotes.length]);

  useEffect(() => {
    const fetchLikedQuotes = async () => {
      try {
        const response = await fetch("http://localhost:3000/quote/liked", {
          credentials: "include", // Inclut les cookies de session
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            console.log(
              "Liked quotes chargées au démarrage :",
              data.likedQuoteIds
            );
            setLikedQuotes(data.likedQuoteIds);
          }
        }
      } catch (err) {
        console.error("Erreur lors du chargement des citations likées :", err);
      }
    };

    fetchLikedQuotes();
  }, []);

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

  useEffect(() => {
    fetch("http://localhost:3000/quote/viewAll", {
      method: "GET",
      credentials: "include", // Pour envoyer les cookies (session)
    })
      .then((response) => response.json())
      .then((data) => {
        if (data && data.quotes) {
          setQuotes(data.quotes); // Utilise directement le tableau des citations
          console.log("Ajout des citations !");
        } else {
          console.log("Aucune citation !");
        }
      })
      .catch((error) => console.error("ERREUR : ", error));
  }, []);

  const handleQuoteDetails = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3000/quote/${id}`, {
        method: "GET",
        credentials: "include", // Inclut les cookies si nécessaire
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data); // Ici tu peux afficher les détails de la citation
        router.push(`/page/quoteDetail/${id}`);
      } else {
        alert("Erreur lors de la récupération de la citation");
      }
    } catch (error) {
      console.error("Erreur :", error);
      alert("Une erreur est survenue");
    }
  };

  const handleLike = async (id: number) => {
    console.log("Tentative de like/unlike pour la citation :", id);

    try {
      const response = await fetch(`http://localhost:3000/quote/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ quoteId: id }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log("Réponse de toggleLike :", data.quote);
          // Met à jour localement pour vérifier l'affichage après toggle
          setQuotes((prevQuotes) =>
            prevQuotes.map((quote) =>
              quote.id === id ? { ...quote, like: data.quote.like } : quote
            )
          );
        }
      } else {
        console.log("Erreur lors de la mise à jour du like");
      }
    } catch (err) {
      console.error("ERREUR :", err);
    }
  };

  return (
    <div className="home bg-gray-50 min-h-screen flex flex-col items-center">
      <Header />
      <main className="home-content w-full max-w-3xl mx-auto p-4 space-y-6">
        <section className="intro text-center">
          <h1 className="text-4xl font-bold text-gray-800">
            Bienvenue sur CitaBibli
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Découvrez et partagez vos citations favorites. Que vous cherchiez
            l'inspiration ou que vous souhaitiez simplement réfléchir, nous
            avons de quoi vous satisfaire.
          </p>
        </section>

        <section className="featured-citations">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Citations en vedette
          </h2>
          <div className="citations-list grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quotes.length > 0 ? (
              quotes.map((quote, index) => (
                <div key={index} className="space-y-2">
                  <div
                    className="citation-card bg-white shadow rounded-lg p-4 hover:shadow-lg transition duration-200 cursor-pointer"
                    onClick={() => handleQuoteDetails(quote.id)}
                  >
                    <p className="text-gray-700">{quote.quote}</p>
                    <span className="text-gray-500 block mt-2">
                      - {quote.author}
                    </span>
                    <p className="text-sm text-gray-400">
                      {new Date(quote.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Likes: {quote.like}
                    </p>
                  </div>
                  <button
                    onClick={() => handleLike(quote.id)}
                    className="text-blue-500 font-semibold hover:text-blue-700"
                  >
                    Like
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Aucune citation trouvée</p>
            )}
          </div>
        </section>

        {!user && (
          <section className="cta-section text-center bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              Partagez vos citations
            </h2>
            <p className="text-gray-600 mt-2">
              Rejoignez-nous et contribuez à la communauté en partageant vos
              citations favorites.
            </p>
            <a
              href="/page/inscription"
              className="cta-btn inline-block mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200"
            >
              Partager une citation
            </a>
          </section>
        )}
      </main>
    </div>
  );
}
