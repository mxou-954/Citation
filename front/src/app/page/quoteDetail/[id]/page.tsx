"use client"; // Indique que ce composant est un Client Component

import { useParams } from "next/navigation"; // Hook pour récupérer les paramètres
import { FormEvent, useEffect, useState } from "react";
import { QuotesData } from "@/app/interface/addQuotes/addQuotes";
import Header from "../../../components/Header/Header";
import {
  CommentData,
  APIResponse,
  CommentResponse,
} from "@/app/interface/comments/comments";

const QuoteDetailPage = () => {
  const params = useParams(); // Récupérer les paramètres dynamiques depuis l'URL
  const { id } = params; // Extraire l'ID depuis les paramètres
  const [quote, setQuote] = useState<QuotesData | null>(null); // Utilisation du type Quote
  const [user, setUser] = useState<{ email: string; id: number } | null>(null);

  const [formData, setFormData] = useState<CommentData>({
    comment: "",
    date: new Date(),
  });
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [commentReplies, setCommentReplies] = useState<{
    [key: number]: CommentResponse[];
  }>({});
  const [commentsToFetch, setCommentsToFetch] = useState<number[]>([]);
  const [refresh, setRefresh] = useState(false);

  const [modif, setModif] = useState<{ [key: number]: boolean }>({});
  const [modifReply, setModifReply] = useState<{ [key: number]: boolean }>({});

  // Fetch des détails de la citation
  useEffect(() => {
    if (id) {
      fetch(`http://localhost:3000/quote/viewDetail/${id}`, {
        method: "GET",
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data && data.quotes) {
            setQuote(data.quotes); // Définit les données de la citation
          } else {
            console.log("Aucune citation !");
          }
        })
        .catch((error) => console.error("ERREUR : ", error));
    }
  }, [id]);

  // Fetch de l'utilisateur connecté
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

  // Logger les changements de l'utilisateur (optionnel)
  useEffect(() => {
    if (user) {
      console.log("User state mis à jour:", user);
    }
  }, [user]);

  useEffect(() => {
    fetch(`http://localhost:3000/comment/all/${id}`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Data from API:", data); // Pour vérifier le format exact
        if (data.success && data.comments) {
          setComments(data.comments);
        } else {
          console.log("Une erreur a été détectée");
        }
      })
      .catch((error) => console.error("ERREUR: ", error));
  }, [id]);

  useEffect(() => {
    const fetchReplies = async (parentCommentId: number) => {
      try {
        const response = await fetch(
          `http://localhost:3000/comment/replies/${parentCommentId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCommentReplies((prevReplies) => ({
              ...prevReplies,
              [parentCommentId]: data.replies,
            }));
          }
        } else {
          console.error("Erreur lors de la récupération des réponses");
        }
      } catch (err) {
        console.error("ERREUR :", err);
      }
    };

    commentsToFetch.forEach((id) => {
      if (!commentReplies[id]) {
        fetchReplies(id);
      }
    });
  }, [commentsToFetch]);

  // Fonction pour afficher les réponses et déclencher le chargement si nécessaire
  const handleShowReplies = (parentCommentId: number) => {
    setCommentsToFetch((prevFetchList) => {
      // Si l'ID du commentaire est déjà dans la liste, le supprimer (masquer les réponses)
      if (prevFetchList.includes(parentCommentId)) {
        return prevFetchList.filter((id) => id !== parentCommentId);
      } else {
        // Sinon, l'ajouter pour afficher les réponses
        return [...prevFetchList, parentCommentId];
      }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const { comment, date } = formData;

    const toSend = {
      comment,
      date,
      quoteId: id, // Utilisez l’ID de la citation actuel
    };

    if (!comment || !date) {
      alert("Vous devez remplir tous les champs !");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/comment/new", {
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
          alert("Commentaire posté avec succès !");
        } else {
          alert("ERREUR : " + data.message);
        }
      } else {
        alert("ERREUR");
      }
    } catch (err) {
      console.error("ERREUR : ", err);
    }
  };

  const handleDeleteComment = async (id: Number) => {
    try {
      const response = await fetch(`http://localhost:3000/comment/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        alert("Commentaire supprimée avec succès");
        // Mettre à jour l'état en retirant la citation supprimée
        setComments((prevComment) =>
          prevComment.filter((comment) => comment.id !== id)
        );
      } else {
        alert("Erreur lors de la suppression du commentaire");
      }
    } catch (error) {
      console.error("Erreur :", error);
      alert("Une erreur est survenue");
    }
  };

  const handleDeleteReply = async (id: number, parentCommentId: number) => {
    try {
      const response = await fetch(
        `http://localhost:3000/comment/reply/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        alert("Réponse supprimée avec succès");

        setCommentReplies((prevReplies) => {
          const updatedReplies = prevReplies[parentCommentId].filter(
            (reply) => reply.id !== id
          );
          return {
            ...prevReplies,
            [parentCommentId]: updatedReplies,
          };
        });
      } else {
        alert("Erreur lors de la suppression de la réponse");
      }
    } catch (error) {
      console.error("Erreur :", error);
      alert("Une erreur est survenue");
    }
  };

  const handleLikeComment = async (id: number) => {
    console.log("Tentative de like/unlike pour le commentaire :", id);

    try {
      const response = await fetch(`http://localhost:3000/comment/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ commentId: id }), // Envoie { commentId: id }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log("Réponse de toggleLike :", data.comment);
          // Met à jour localement pour likeCount
          setComments((prevComments) =>
            prevComments.map((comment) =>
              comment.id === id
                ? { ...comment, likeCount: data.comment.likeCount }
                : comment
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

  const handleSubmitResponse = async (
    e: React.FormEvent<HTMLFormElement>,
    parentCommentId: number
  ) => {
    e.preventDefault();

    const target = e.target as HTMLFormElement;
    const content = (
      target.elements.namedItem("responseComment") as HTMLInputElement
    ).value;

    try {
      const response = await fetch("http://localhost:3000/comment/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content, parentCommentId, date: new Date() }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCommentReplies((prevReplies) => ({
            ...prevReplies,
            [parentCommentId]: [
              ...(prevReplies[parentCommentId] || []),
              data.reply,
            ],
          }));
          alert("La réponse au commentaire a été ajoutée.");
        }
      } else {
        console.log("Erreur lors de l'ajout de la réponse");
      }
    } catch (err) {
      console.error("ERREUR :", err);
    }
  };

  const fetchReplies = async (parentCommentId: number) => {
    try {
      const response = await fetch(
        `http://localhost:3000/comment/replies/${parentCommentId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCommentReplies((prevReplies) => ({
            ...prevReplies,
            [parentCommentId]: data.replies,
          }));
        }
      } else {
        console.error("Erreur lors de la récupération des réponses");
      }
    } catch (err) {
      console.error("ERREUR :", err);
    }
  };

  // Déclenche le rafraîchissement des réponses lorsque `refresh` change
  useEffect(() => {
    Object.keys(commentReplies).forEach((id) => {
      fetchReplies(Number(id));
    });
  }, [refresh]);

  const handleLikeResponse = async (
    responseId: number,
    parentCommentId: number
  ) => {
    try {
      const response = await fetch(
        `http://localhost:3000/comment/likeResponse`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ responseId }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCommentReplies((prevReplies) => ({
            ...prevReplies,
            [parentCommentId]: (prevReplies[parentCommentId] || []).map(
              (reply) =>
                reply.id === responseId
                  ? { ...reply, likeCount: data.response.likeCount }
                  : reply
            ),
          }));

          setRefresh(!refresh); // Inverse l'état pour déclencher le `useEffect`
        }
      } else {
        console.log("Erreur lors du like de la réponse");
      }
    } catch (err) {
      console.error("ERREUR :", err);
    }
  };

  const handleModifyComment = (commentId: number) => {
    setModif((prevModif) => ({
      ...prevModif,
      [commentId]: !prevModif[commentId],
    }));
  };

  const handleSubmitModification = async (
    e: React.FormEvent<HTMLFormElement>,
    commentId: number
  ) => {
    e.preventDefault();

    const target = e.target as HTMLFormElement;
    const content = (
      target.elements.namedItem("inputModification") as HTMLInputElement
    ).value;

    try {
      const response = await fetch("http://localhost:3000/comment/modif", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content, commentId, date: new Date() }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert("Le commentaire a bien été modifié.");

          // Mise à jour de l'état `comments` avec le contenu modifié
          setComments((prevComments) =>
            prevComments.map((comment) =>
              comment.id === commentId
                ? { ...comment, content, date: new Date() }
                : comment
            )
          );
        }
      } else {
        console.log("Erreur lors de la modification du commentaire");
      }
    } catch (err) {
      console.error("ERREUR :", err);
    }
  };

  const handleModifyReply = (replyId: number) => {
    setModifReply((prevModif) => ({
      ...prevModif,
      [replyId]: !prevModif[replyId],
    }));
  };

  const handleSubmitReplyModification = async (
    e: React.FormEvent<HTMLFormElement>,
    replyId: number,
    parentCommentId: number
  ) => {
    e.preventDefault();
  
    const target = e.target as HTMLFormElement;
    const content = (
      target.elements.namedItem("inputReplyModification") as HTMLInputElement
    ).value;
  
    try {
      const response = await fetch("http://localhost:3000/comment/reply/modif", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content, replyId, date: new Date() }),
      });
  
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert("La réponse a bien été modifiée.");
  
          // Mise à jour de l'état `commentReplies` pour le `parentCommentId`
          setCommentReplies((prevReplies) => ({
            ...prevReplies,
            [parentCommentId]: prevReplies[parentCommentId].map((reply) =>
              reply.id === replyId ? { ...reply, content, date: new Date() } : reply
            ),
          }));
        }
      } else {
        console.log("Erreur lors de la modification de la réponse");
      }
    } catch (err) {
      console.error("ERREUR :", err);
    }
  };

  if (!quote) return <p>Chargement...</p>;

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center py-4">
      <Header />
      <div className="w-full max-w-3xl mx-auto bg-white p-6 shadow-lg rounded-lg mt-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Détails de la citation :
          </h1>
          <p className="text-gray-700 mb-2">"{quote.quote}"</p>
          <p className="text-sm text-gray-500">- {quote.author}</p>
          <p className="text-xs text-gray-400">
            {new Date(quote.date).toLocaleDateString()}
          </p>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mt-6">
          Commentaires :
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col space-y-3">
          <label htmlFor="comment" className="text-gray-600">
            Poster un commentaire :
          </label>
          <input
            id="comment"
            type="text"
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            placeholder="Votre commentaire"
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Envoyer
          </button>
        </form>

        <div className="mt-6 space-y-6">
          {comments.length > 0 ? (
            comments.map((comment, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg shadow-sm bg-gray-100"
              >
                <p className="text-gray-700">{comment.content}</p>
                <p className="text-sm text-gray-500">- {comment.authorName}</p>
                <p className="text-xs text-gray-400">
                  {new Date(comment.date).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-500">
                  Likes : {comment.likeCount}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <button
                    onClick={() => handleLikeComment(comment.id)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Like
                  </button>
                  <button
                    onClick={() => handleShowReplies(comment.id)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    {commentsToFetch.includes(comment.id)
                      ? "Masquer les réponses"
                      : "Afficher les réponses"}
                  </button>
                  {user.id === comment.authorId && (
                    <div>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>

                      {!modif[comment.id] ? (
                        <button
                          onClick={() => handleModifyComment(comment.id)}
                          className="text-blue-500 hover:text-blue-700 ml-3"
                        >
                          Modifier
                        </button>
                      ) : (
                        <div className="mt-2">
                          <form
                            onSubmit={(e) =>
                              handleSubmitModification(e, comment.id)
                            }
                          >
                            <label
                              htmlFor={`inputModification-${comment.id}`}
                              className="text-gray-700"
                            >
                              Modifier :
                            </label>
                            <input
                              type="text"
                              name="inputModification"
                              id={`inputModification-${comment.id}`}
                              className="border border-gray-300 rounded-md p-1 ml-2"
                            />
                            <button
                              type="submit"
                              className="text-blue-500 hover:text-blue-700 ml-3"
                            >
                              Envoyer
                            </button>
                          </form>

                          <button
                            onClick={() => handleModifyComment(comment.id)}
                            className="text-blue-500 hover:text-blue-700 ml-3"
                          >
                            Annuler
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Affiche les réponses seulement si comment.id est dans commentsToFetch */}
                {commentsToFetch.includes(comment.id) && (
                  <div className="replies mt-4 ml-4 space-y-3">
                    {commentReplies[comment.id]?.map((reply, replyIndex) => (
                      <div
                        key={replyIndex}
                        className="p-3 border rounded-md bg-white shadow"
                      >
                        <p className="text-gray-700">{reply.content}</p>
                        <p className="text-sm text-gray-500">
                          - {reply.authorName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(reply.date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          Likes : {reply.likeCount}
                        </p>

                        {/* Bouton pour liker la réponse */}
                        <button
                          onClick={() => handleLikeResponse(reply.id)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          Like
                        </button>

                        {/* Boutons pour modifier et supprimer si l'utilisateur est l'auteur */}
                        {user.id === reply.authorId && (
                          <div>
                            {!modifReply[reply.id] ? (
                              <>
                                <button
                                  onClick={() => handleModifyReply(reply.id)}
                                  className="text-blue-500 hover:text-blue-700 ml-3"
                                >
                                  Modifier
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteReply(reply.id, comment.id)
                                  }
                                  className="text-red-500 hover:text-red-700 ml-2"
                                >
                                  Delete
                                </button>
                              </>
                            ) : (
                              <div className="mt-2">
                                <form
                                  onSubmit={(e) =>
                                    handleSubmitReplyModification(
                                      e,
                                      reply.id,
                                      comment.id
                                    )
                                  }
                                >
                                  <label
                                    htmlFor={`inputReplyModification-${reply.id}`}
                                    className="text-gray-700"
                                  >
                                    Modifier :
                                  </label>
                                  <input
                                    type="text"
                                    name="inputReplyModification"
                                    id={`inputReplyModification-${reply.id}`}
                                    className="border border-gray-300 rounded-md p-1 ml-2"
                                  />
                                  <button
                                    type="submit"
                                    className="text-blue-500 hover:text-blue-700 ml-3"
                                  >
                                    Envoyer
                                  </button>
                                </form>
                                <button
                                  onClick={() => handleModifyReply(reply.id)}
                                  className="text-blue-500 hover:text-blue-700 ml-3"
                                >
                                  Annuler
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    <form
                      onSubmit={(e) => handleSubmitResponse(e, comment.id)}
                      className="mt-4 flex items-center space-x-2"
                    >
                      <input
                        id="responseComment"
                        type="text"
                        name="responseComment"
                        placeholder="Votre réponse"
                        className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600"
                      >
                        Envoyer
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>Aucun commentaire trouvé</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuoteDetailPage;
