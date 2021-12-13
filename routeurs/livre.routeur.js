const express = require("express");
const routeur = express.Router();
const twig = require("twig");
const multer = require("multer");
const livreController = require("../controllers/livre.controller")

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

routeur.get("/", livreController.livres_affichage);
routeur.post("/", upload.single("image"), livreController.livres_ajout);
routeur.get("/:id", livreController.livre_affichage);
routeur.get("/modification/:id", livreController.livre_modification);
routeur.post("/modificationServer", livreController.livre_modification_validation);
routeur.post("/updateImage", upload.single("image"), livreController.livre_modification_image);
routeur.post("/delete/:id", livreController.livre_suppression);


module.exports = routeur;