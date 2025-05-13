const express = require("express");
const router = express.Router();
const responseController = require("../Controllers/ResponseController");


router.put('/add-result/:id', responseController.addResult);


router.get('/:userId/:testId', responseController.getTestResponse); 


router.get('/responses', responseController.getAllResponses);

router.post("/", responseController.submitResponse);


module.exports = router
