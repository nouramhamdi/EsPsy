
var express = require('express');
var router = express.Router();
const upload = require("../middlewares/uploadFile")
const groupController = require("../Controllers/groupController");
const groupModel = require("../Models/GroupDiscussionModel");
const ChatNotification = require("../Models/ChatNotification");

// routes/groupes.js
const ffmpeg = require('fluent-ffmpeg'); // ✅ Use require instead of import
const { path: ffprobePath } = require('@ffprobe-installer/ffprobe'); // Correct import

ffmpeg.setFfprobePath(ffprobePath);

router.get('/getAllGroups', groupController.getAllGroups);
router.get('/getGroupById/:groupId', groupController.getGroupById);
router.get('/getGroupByIdMember/:memberId', groupController.getGroupByMemberId);
router.get('/getGroupsByCreator/:creatorId', groupController.getGroupsByCreator);

router.post('/addGroup',groupController.addGroupDiscussion);
router.post('/addMember/:groupId',groupController.addMemberToGroup);
// File upload endpoint
router.post('/upload', upload.single('file'), async (req, res) => { // Add async
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  
      const filePath = req.file.path;
      let duration = null;
  
      if (req.file.mimetype.startsWith('audio/')) {
        duration = await new Promise((resolve, reject) => {
          ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) reject(err);
            const durationValue = parseFloat(metadata.format?.duration);
            resolve(isNaN(durationValue) ? null : durationValue);
          });
        });
      }
  
      console.log('duration = '+duration)
      res.json({
        url: `/${req.file.filename}`, // Fix URL path
        mediaType: req.file.mimetype,
        duration: duration|| null,
      });
    } catch (error) {
      console.error('Error processing file:', error);
      res.status(500).json({ error: 'Failed to process file' });
    }
});


router.put('/toggleLock/:groupId', groupController.toggleLockGroup);
router.put('/changeModerator/:groupId', groupController.changeModerator);
router.put('/deleteMember/:groupId', groupController.deleteMemberFromGroup);

router.delete('/deleteGroup/:groupId', groupController.deleteGroupDiscussion);


//report message 
router.post("/addReportMessage", groupController.addReportMessage);
router.get("/getReportMessageList", groupController.getReportMessageList);
router.get("/getReportMessageById/:id", groupController.getReportMessageById);
router.put("/handleReportMessage/:id", groupController.handleReportMessage);
router.post("/getMessage", groupController.getMessageById);
router.delete("/deleteReport/:id", groupController.deleteReportMessage);

// Example route to check notifications




module.exports = router;
