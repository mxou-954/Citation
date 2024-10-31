"use client";
"use strict";

import React, { FormEvent, useEffect, useState } from "react";
import "./styles.scss";
import Header from "../../components/Header/Header";
import AddQuotes from "@/app/components/AddQuotes/AddQuotes";
import { QuotesData, APIResponse } from "@/app/interface/addQuotes/addQuotes";
import Image from "next/image";
import profilePicture from "../../Untitledsuisse.png";
import { useRouter } from "next/navigation";

export default function Profile() {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [quotes, setQuotes] = useState<QuotesData[]>([]);
  const [name, setName] = useState<string>("");
  const [newName, setNewName] = useState(name);
  const router = useRouter(); // Hook pour rediriger
  type HowLikesIs = {
    success: boolean;
    message: string;
    likes: number;
  };
  type HowCommentsIs = {
    success: boolean;
    message: string;
    comments: number;
  };

  const [howLikesIs, setHowLikesIs] = useState<HowLikesIs | null>(null);
  const [howCommentsIs, setHowCommentsIs] = useState<HowCommentsIs | null>(
    null
  );
  const howQuoteIs = quotes.length;

  const handleInputChange = (e) => {
    setNewName(e.target.value);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    setIsEditing(false); // Sortir du mode édition

    try {
      const response = await fetch(
        "http://localhost:3000/inscription/modificationName",
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newName }), // Envoyer sous forme d'objet
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert("Votre nom a été changé");
          setName(data.user.nom);
        } else {
          console.log("Erreur : " + data.message);
          alert("ERREUR");
        }
      } else {
        alert("Erreur");
      }
    } catch (err) {
      alert("ERREUR");
      console.log("ERREUR : " + err);
    }
  };

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
    fetch("http://localhost:3000/inscription/name", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data && data.name) {
          // Utiliser "data.name" maintenant
          setName(data.name);
          console.log("NAME bien trouvé : " + data.name);
        } else {
          console.log("ANOMALIE : pas de name a ce profile");
        }
      })
      .catch((error) => console.error("ERREUR"));
  }, []);

  useEffect(() => {
    if (user) {
      console.log("User state mis à jour:", user);
    }
  }, [user]);

  useEffect(() => {
    fetch("http://localhost:3000/quote/viewAllMy", {
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

  useEffect(() => {
    fetch("http://localhost:3000/profile/countLikes", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setHowLikesIs(data);
          console.log("Nombre de likes totaux : ", data);
        } else {
          setHowLikesIs(null);
          console.log("Une erreur a été détectée");
        }
      })
      .catch((error) => console.error("ERREUR: ", error));
  }, []);

  useEffect(() => {
    fetch("http://localhost:3000/profile/countComments", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setHowCommentsIs(data);
        } else {
          setHowCommentsIs(null);
          console.log("ERREUR : ", data.message);
        }
      })
      .catch((err) => console.error("ERREUR : ", err));
  }, []);

  const handleDeleteQuote = async (id: number) => {
    // Spécifier le type de 'id'
    try {
      const response = await fetch(`http://localhost:3000/quote/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        alert("Citation supprimée avec succès");
        // Mettre à jour l'état en retirant la citation supprimée
        setQuotes((prevQuotes) =>
          prevQuotes.filter((quote) => quote.id !== id)
        );
      } else {
        alert("Erreur lors de la suppression de la citation");
      }
    } catch (error) {
      console.error("Erreur :", error);
      alert("Une erreur est survenue");
    }
  };

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

  const handleDéconnexion = async () => {
    // Affiche la fenêtre de confirmation
    const confirmation = window.confirm(
      "Êtes-vous sûr de vouloir vous déconnecter ?"
    );

    if (confirmation) {
      try {
        const response = await fetch(`http://localhost:3000/session/delete`, {
          method: "DELETE",
          credentials: "include", // Inclut les cookies de session
        });

        if (response.ok) {
          alert("Vous êtes déconnecté");
          // Tu peux rediriger l'utilisateur après la déconnexion
          // window.location.href = '/';
        } else {
          alert("Erreur lors de la déconnexion");
        }
      } catch (error) {
        console.error("Erreur :", error);
        alert("Une erreur est survenue");
      }
    } else {
      // L'utilisateur a annulé la déconnexion, ne rien faire
      console.log("Déconnexion annulée");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center">
  <Header />

  <div className="profile-container w-full max-w-3xl mx-auto p-4 bg-white shadow-md rounded-lg mt-6">
    <div className="profile-header flex items-center space-x-4 mb-6">
      <Image
        src={profilePicture} // Utiliser l'importation de l'image
        alt="Profile"
        width={100} // Largeur de l'image de profil
        height={100} // Hauteur de l'image de profil
        className="profile-picture w-24 h-24 rounded-full border border-gray-300 object-cover"
      />
      <div className="profile-info flex-1">
        {isEditing ? (
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newName}
              onChange={handleInputChange}
              className="border border-gray-300 p-2 rounded-md"
            />
            <button
              onClick={handleSaveClick}
              className="bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600"
            >
              Enregistrer
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold">{name}</h2>
            <strong
              onClick={handleEditClick}
              className="text-blue-500 cursor-pointer"
            >
              (modifier)
            </strong>
          </div>
        )}
        <p className="text-gray-500">Email : {user?.email}</p>
      </div>
    </div>

    <div className="profile-stats flex space-x-6 text-center border-t border-b py-4">
      <p className="flex-1">
        <span className="font-bold text-lg">{howQuoteIs}</span> <br /> Citations postées
      </p>
      <p className="flex-1">
        <span className="font-bold text-lg">
          {howLikesIs ? howLikesIs.likes : "Chargement..."}
        </span> <br /> Likes totaux
      </p>
      <p className="flex-1">
        <span className="font-bold text-lg">
          {howCommentsIs ? howCommentsIs.comments : "Chargement..."}
        </span> <br /> Commentaires totaux
      </p>
    </div>

    <AddQuotes />

    <div className="quotes-section mt-6">
      <h3 className="text-lg font-semibold mb-4">Ses citations</h3>
      <ul className="space-y-4">
        {quotes.length > 0 ? (
          quotes.map((quote, index) => (
            <div key={index} className="border rounded-lg p-4 shadow-sm hover:shadow-md">
              <p className="text-gray-700 mb-2">"{quote.quote}"</p>
              <p className="text-sm text-gray-500">- {quote.author}</p>
              <p className="text-xs text-gray-400">
                {new Date(quote.date).toLocaleDateString()}
              </p>
              <button
                onClick={() => handleDeleteQuote(quote.id)}
                className="text-red-500 font-semibold mt-2 hover:text-red-700"
              >
                Supprimer
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Aucune citation trouvée</p>
        )}
      </ul>
    </div>

    <button
      onClick={handleDéconnexion}
      className="w-full mt-6 bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition duration-200"
    >
      Me déconnecter
    </button>
  </div>
</div>
  );
}
