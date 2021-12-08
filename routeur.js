const express = require("express");
const mongoose = require("mongoose");
const routeur = express.Router();
const twig = require("twig");
const livreSchema = require("./models/livres.modele");

routeur.get("/", (requete, reponse) => {
    reponse.render("accueil.html.twig");
})
routeur.get("/livres", (requete, reponse) => {
    livreSchema.find()
        .exec()
        .then(livres => {
            reponse.render("livres/liste.html.twig", {liste : livres, message : reponse.locals.message});
        })
        .catch();
})

routeur.post("/livres", (requete, reponse) => {
    const livre = new livreSchema({
        _id: new mongoose.Types.ObjectId(),
        nom: requete.body.titre,
        auteur: requete.body.auteur,
        pages: requete.body.pages,
        description: requete.body.description
    });
    livre.save()
        .then(resultat => {
            console.log(resultat);
            reponse.redirect("/livres");
        })
        .catch(error => {
            console.log(error);
        })
})

routeur.get("/livres/:id", (requete, reponse) => {
    console.log(requete.params.id);
    livreSchema.findById(requete.params.id)
        .exec()
        .then(livre => {
            reponse.render("livres/livre.html.twig", {livre : livre});
        })
        .catch(error => {
            console.log(error);
        })
})

routeur.post("/livres/delete/:id", (requete, reponse) => {
    livreSchema.remove({_id: requete.params.id})
        .exec()
        .then(resultat => {
            requete.session.message = {
                type : 'success',
                contenu : 'Suppression effectuée'
            }
            reponse.redirect("/livres");
        })
        .catch(error => {
            console.log(error);
        })
})


routeur.use((requete, reponse, suite) => {
    const error = new Error("Page non trouvée");
    error.status = 404;
    suite(error);
})

routeur.use((error, requete, reponse) => {
    reponse.status(error.status || 500);
    reponse.end(error.message);
})

module.exports = routeur;