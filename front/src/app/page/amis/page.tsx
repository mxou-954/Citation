"use client";

import React, { FormEvent, useState, ChangeEvent, useEffect } from 'react';
import Header from '../../components/Header/Header';
import { AmisProfile } from '@/app/interface/amis/amisInterface';

export default function Page() {
  const [friendRechearch, setFriendRechearch] = useState<string>("");
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);

  

  useEffect(() => {
    // Obtenir les demandes envoyées
    fetch('http://localhost:3000/amis/sent-requests', { credentials: 'include' })
      .then((res) => res.json())
      .then(setSentRequests);

    // Obtenir les demandes reçues
    fetch('http://localhost:3000/amis/received-requests', { credentials: 'include' })
      .then((res) => res.json())
      .then(setReceivedRequests);
  }, []);
  

  // Gestion de la saisie de l'input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFriendRechearch(e.target.value);
  };

  // Envoi de la recherche au back-end
  const handleSubmitRechearchFriend = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const response = await fetch("http://localhost:3000/amis/add-friend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Envoie les cookies de session
        body: JSON.stringify({ searchTerm: friendRechearch }), // Assurez-vous que `friendRechearch` est défini et contient le terme de recherche
      });
  
      if (!response.ok) {
        throw new Error("Erreur lors de la recherche d'amis.");
      }
  
      const data = await response.json();
      console.log("Ami trouvé :", data);
    } catch (error) {
      console.error("Erreur lors de la recherche d'amis.", error);
    }
  };

  const handleUpdateStatus = (requestId, status) => {
    fetch('http://localhost:3000/amis/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ requestId, status }),
    })
      .then((res) => res.json())
      .then(() => {
        // Actualiser les demandes après la mise à jour du statut
        setReceivedRequests((prev) =>
          prev.filter((request) => request.id !== requestId)
        );
      });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <section className="flex flex-col items-center mt-10">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <form onSubmit={handleSubmitRechearchFriend} className="space-y-4">
            <label htmlFor="inputFindFriend" className="block text-gray-700 font-semibold">
              Entrez le nom ou l'email de votre ami :
            </label>
            <input
              type="text"
              name="inputFindFriend"
              id="inputFindFriend"
              placeholder="Email / Nom.."
              value={friendRechearch} // Lie l'état au champ de saisie
              onChange={handleInputChange} // Appelle handleInputChange lors de la saisie
            />
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
            >
              Chercher...
            </button>
          </form>
        </div>        
      </section>
      <div>
      <h2>Demandes envoyées</h2>
      <ul>
        {sentRequests.map((request) => (
          <li key={request.id}>
            {request.friend.nom} - Statut : {request.status}
          </li>
        ))}
      </ul>

      <h2>Demandes reçues</h2>
      <ul>
        {receivedRequests.map((request) => (
          <li key={request.id}>
            {request.friend.nom} - Statut : {request.status}
            <button onClick={() => handleUpdateStatus(request.id, 'accepted')}>
              Accepter
            </button>
            <button onClick={() => handleUpdateStatus(request.id, 'rejected')}>
              Refuser
            </button>
          </li>
        ))}
      </ul>
    </div>
    </div>
  );
}