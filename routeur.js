const express = require("express");
const mongoose = require("mongoose");
const routeur = express.Router();
const twig = require("twig");
const livreSchema = require("./models/livres.modele");
const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
    destination : (requete, file, cb)=> {
        cb(null, "./public/images/")
    },
    filename : (requete, file, cb)=> {
        var date = new Date().toLocaleDateString().replace(/\//g, '-');
        // console.log(date);
        cb(null, date+"-"+Math.round(Math.random() * 10000)+"-"+file.originalname)
    }
});
const fileFilter = (requete, file, cb) =>{
    if(file.mimetype === "image/jpeg" || file.mimetype === "image/png"){
        cb(null, true)
    } else {
        cb(new Error("l'image n'est pas acceptée"),false)
    }
}

const upload = multer({
    storage : storage,
    limits : {
        fileSize : 1024 * 1024 * 5
    },
    fileFilter : fileFilter
})

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

routeur.post("/livres", upload.single("image"), (requete, reponse) => {
    const livre = new livreSchema({
        _id: new mongoose.Types.ObjectId(),
        nom: requete.body.titre,
        auteur: requete.body.auteur,
        pages: requete.body.pages,
        description: requete.body.description,
        image : requete.file.path.substring(14)
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

// Affichage détaillé d'un livre
routeur.get("/livres/:id", (requete, reponse) => {
    console.log(requete.params.id);
    livreSchema.findById(requete.params.id)
        .exec()
        .then(livre => {
            reponse.render("livres/livre.html.twig", {livre : livre, isModification: false});
        })
        .catch(error => {
            console.log(error);
        })
})

// Modification d'un livre (formulaire)
routeur.get("/livres/modification/:id", (requete, reponse) => {
    console.log(requete.params.id);
    livreSchema.findById(requete.params.id)
        .exec()
        .then(livre => {
            reponse.render("livres/livre.html.twig", {livre : livre, isModification: true});
        })
        .catch(error => {
            console.log(error);
        })
})

routeur.post("/livres/modificationServer", (requete, reponse) => {
    const livreUpdate = {
        nom : requete.body.titre,
        auteur : requete.body.auteur,
        pages : requete.body.pages,
        description : requete.body.description
    }
    livreSchema.updateOne({_id:requete.body.identifiant}, livreUpdate)
        .exec()
        .then(resultat =>{
            if(resultat.modifiedCount < 1) throw new Error("Requete de modification échouée");
            requete.session.message = {
                type : 'success',
                contenu : 'Modification effectuée'
            }
            reponse.redirect("/livres");
        })
        .catch(error => {
            requete.session.message = {
                type : 'danger',
                contenu : error.message
            }
            reponse.redirect("/livres");
        })
})


//suppression d'un livre
routeur.post("/livres/delete/:id", (requete, reponse) => {
    var livre = livreSchema.findById(requete.params.id)
        .select("image")
        .exec()
        .then(livre => {
            fs.unlink("./public/images/"+ livre.image, error => {
                console.log(error);
            })
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