const express = require('express');
const router = express.Router();
const testController = require('../Controllers/testController');
const upload = require("../middlewares/uploadrania");

router.get('/', testController.getAllTests);
router.get('/:id', testController.getTestById);

router.post('/', upload.single("image"), (req, res, next) => {
    let test = {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        duration: req.body.duration,
        image: req.file?.filename || req.body.image,
    };

    try {
        // Si c'est un formulaire (image uploadée), req.body.questions est une string JSON
        if (typeof req.body.questions === "string") {
            test.questions = JSON.parse(req.body.questions);
        } else {
            // Sinon, c'est déjà un tableau (JSON body pur)
            test.questions = req.body.questions;
        }
    } catch (err) {
        return res.status(400).json({ error: "Invalid questions format." });
    }

    // Si aucune image (ni fichier, ni champ), refuser
    if (!test.image) {
        return res.status(400).json({ error: "Image is required (upload or AI-generated)." });
    }

    req.body = test;
    next();
}, testController.createTest);

router.put('/:id', testController.updateTest);
router.delete('/:id', testController.deleteTest);

module.exports = router;
