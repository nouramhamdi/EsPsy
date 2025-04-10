const groupModel = require("../Models/GroupDiscussionModel");
const userModel = require("../Models/userModel");
const ChatNotification = require("../Models/ChatNotification");
const ReportMessage = require("../Models/ReportMessage");

const { isValidObjectId } = require("mongoose");

//get methods 
module.exports.getAllGroups = async (req, res) => {
    try {
      const groups = await groupModel.find().populate("members", "fullname username email").populate("creator", "fullname username email").populate("moderator", "fullname username email");
  
      if (!groups || groups.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No groups found.",
        });
      }
  
      res.status(200).json({
        success: true,
        message: "Group discussions fetched successfully!",
        data: groups,
      });
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch group discussions.",
        error: error.message,
      });
    }
};
  
module.exports.getGroupById = async (req, res) => {
    try {
      const { groupId } = req.params;
  
      if (!groupId) {
        return res.status(400).json({
          success: false,
          message: "Group ID is required.",
        });
      }
  
      const group = await groupModel.findById(groupId)
        .populate("members", "fullname username email")
        .populate("creator", "fullname username email")
        .populate("moderator", "fullname username email");
  
      if (!group) {
        return res.status(404).json({
          success: false,
          message: "Group not found.",
        });
      }
  
      res.status(200).json({
        success: true,
        message: "Group found successfully!",
        data: group,
      });
    } catch (error) {
      console.error("Error fetching group by ID:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch group.",
        error: error.message,
      });
    }
};

// Controller function
module.exports.getGroupByMemberId = async (req, res) => {
  try {
    const { memberId } = req.params;

    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: "Member ID is required.",
      });
    }



    const groups = await groupModel.find({
      members: memberId
    })
    .populate("members", "fullname username email")
    .populate("creator", "fullname username email")
    .populate("moderator", "fullname username email");

    if (!groups.length) {
      return res.status(404).json({
        success: false,
        message: "No groups found for this member.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Groups found successfully!",
      data: groups,
    });
  } catch (error) {
    console.error("Error fetching groups by member ID:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch groups.",
      error: error.message,
    });
  }
};
  
exports.getGroupsByCreator = async (req, res) => {
    try {
        const { creatorId } = req.params;
        const groups = await groupModel.find({ creator: creatorId })
                                        .populate("members", "fullname username email")
                                        .populate("creator", "fullname username email")
                                        .populate("moderator", "fullname username email");

        if (!groups || groups.length === 0) {
            return res.status(404).json({ message: "No groups found for this moderator." });
        }

        res.status(200).json({
            success: true,
            data: groups
        });
    } catch (error) {
        console.error("Error fetching groups by moderator:", error);
        res.status(500).json({ 
            success: false,
            message: "Internal server error"
        });
    }
};

//post methods
module.exports.addGroupDiscussion = async (req, res) => {
  try {
    const { name, theme, creator } = req.body;

    if (!name || !theme || !creator) {
      return res.status(400).json({
        success: false,
        message: "Name, theme, and creator are required fields.",
      });
    }
    const user = await userModel.findById(creator);
    if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
    }


    const newGroupDiscussion = new groupModel({
      name,
      theme,
      creator,
      members: [creator], 
      moderator: creator, 
      isLocked: false, 
      messages: [], 
    });

    await newGroupDiscussion.save();

    res.status(201).json({
      success: true,
      message: "Group discussion created successfully!",
      data: newGroupDiscussion,
    });
  } 
  catch (error) {
    console.error("Error creating group discussion:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create group discussion.",
      error: error.message,
    });
  }
};

module.exports.addMemberToGroup = async (req, res) => 
{
  try {
        const { groupId } = req.params; 
        const { userId } = req.body; 

        if (!groupId || !userId) {
        return res.status(400).json({
            success: false,
            message: "Group ID and user ID are required.",
        });
        }

        const groupDiscussion = await groupModel.findById(groupId);

        if (!groupDiscussion) {
        return res.status(404).json({
            success: false,
            message: "Group discussion not found.",
        });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        if (groupDiscussion.members.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: "User is already a member of this group.",
            });
        }

        groupDiscussion.members.push(userId);

        await groupDiscussion.save();

        const notification = new ChatNotification({
          userId: userId,
          groupId: groupId,
          content: "joined the group",
        });
            await notification.save();

        res.status(200).json({
        success: true,
        message: "Member added successfully!",
        data: groupDiscussion,
        });
    } catch (error) {
        console.error("Error adding member to group discussion:", error);
        res.status(500).json({
        success: false,
        message: "Failed to add member to group discussion.",
        error: error.message,
        });
    }
};


module.exports.toggleLockGroup = async (req, res) => {
    try {
      const { groupId } = req.params; 
  
      if (!groupId) {
        return res.status(400).json({
          success: false,
          message: "Group ID is required.",
        });
      }
  
      const groupDiscussion = await groupModel.findById(groupId);
  
      if (!groupDiscussion) {
        return res.status(404).json({
          success: false,
          message: "Group discussion not found.",
        });
      }
  
      groupDiscussion.isLocked = !groupDiscussion.isLocked;
  
      await groupDiscussion.save();
  
      const lockStatus = groupDiscussion.isLocked ? "locked" : "unlocked";
  
      res.status(200).json({
        success: true,
        message: `Group discussion ${lockStatus} successfully!`,
        data: groupDiscussion,
      });
    } catch (error) {
      console.error("Error toggling lock status:", error);
      res.status(500).json({
        success: false,
        message: "Failed to toggle group lock status.",
        error: error.message,
      });
    }
};

module.exports.changeModerator = async (req, res) => {
    try {
        const { groupId } = req.params; 
        const { newModeratorId } = req.body; 

        if (!groupId || !newModeratorId) {
        return res.status(400).json({
            success: false,
            message: "Group ID and new moderator ID are required.",
        });
        }

        const groupDiscussion = await groupModel.findById(groupId);

        if (!groupDiscussion) {
        return res.status(404).json({
            success: false,
            message: "Group discussion not found.",
        });
        }

        const user = await userModel.findById(newModeratorId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        if (!groupDiscussion.members.includes(newModeratorId)) {
        return res.status(400).json({
            success: false,
            message: "User is not a member of this group.",
        });
        }

        groupDiscussion.moderator = newModeratorId;

        await groupDiscussion.save();

        res.status(200).json({
        success: true,
        message: "Moderator changed successfully!",
        data: groupDiscussion,
        });

    } catch (error) {
        console.error("Error changing moderator:", error);
        res.status(500).json({
        success: false,
        message: "Failed to change moderator.",
        error: error.message,
        });
    }
};
  
module.exports.deleteMemberFromGroup = async (req, res) => {
    try {
        const { groupId } = req.params; 
        const { userId } = req.body; 

        if (!groupId || !userId) {
        return res.status(400).json({
            success: false,
            message: "Group ID and user ID are required.",
        });
        }

        const groupDiscussion = await groupModel.findById(groupId);

        
        const notification = new ChatNotification({
          userId: userId,
          groupId: groupId,
          content: "left the group",
        });
            await notification.save();
        if (!groupDiscussion) {
        return res.status(404).json({
            success: false,
            message: "Group discussion not found.",
        });
        }

        if (!groupDiscussion.members.includes(userId)) {
        return res.status(400).json({
            success: false,
            message: "User is not a member of this group.",
        });
        }

        groupDiscussion.members = groupDiscussion.members.filter(
        (member) => member.toString() !== userId.toString()
        );

        await groupDiscussion.save();

        res.status(200).json({
        success: true,
        message: "Member removed successfully!",
        data: groupDiscussion,
        });
    } catch (error) {
        console.error("Error deleting member from group discussion:", error);
        res.status(500).json({
        success: false,
        message: "Failed to remove member from group discussion.",
        error: error.message,
        });
    }
};

module.exports.deleteGroupDiscussion = async (req, res) => {
    try {
      const { groupId } = req.params; 
      if (!groupId) {
        return res.status(400).json({
          success: false,
          message: "Group ID is required.",
        });
      }
  
      const groupDiscussion = await groupModel.findByIdAndDelete(groupId);
  
      if (!groupDiscussion) {
        return res.status(404).json({
          success: false,
          message: "Group discussion not found.",
        });
      }
  
      res.status(200).json({
        success: true,
        message: "Group discussion deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting group discussion:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete group discussion.",
        error: error.message,
      });
    }
};





//chat messages 
exports.joinGroup = (socket, groupId) => {
  socket.join(groupId);
};

exports.sendMessage = async (socket, data) => {
  const { groupId, userId, content } = data;

  try {
    const group = await groupModel.findById(groupId);
    if (!group || !group.members.includes(userId)) {
      return socket.emit('error', 'Unauthorized');
    }

    const newMessage = {
      sender: userId,
      content,
      messageType: 'text',
    };

    const senderObj = await userModel.findById(userId);
    const newMessageU = {
      sender: { _id: senderObj._id , fullname: senderObj.fullname , username: senderObj.username , email: senderObj.email },
      content,
      messageType: 'text',
    };
    socket.to(groupId).emit('newMessage', newMessageU);
    socket.emit('newMessage', newMessageU); // To sender

    const notification = new ChatNotification({
      userId: userId,
      groupId: groupId,
      content: "sent a message",
    });

    socket.to(groupId).emit("newNotification", notification);
    await notification.save();

    group.messages.push(newMessage);
    await group.save();
    await group.populate('messages.sender').execPopulate();

  } catch (error) {
    socket.emit('error', 'Message failed');
  }
};

exports.getMessages = async (socket, groupId) => {
  try {
    const group = await groupModel.findById(groupId)
      .populate({
        path: 'messages.sender', 
        model: 'User', 
        select: 'fullname username email' 
      })
      .sort({ 'messages.timestamp': 1 })
      .lean();
      
    if (!group) return socket.emit('error', 'Group not found');

    const sanitizedMessages = group.messages.map(msg => ({
      ...msg,
      sender: {
        _id: msg.sender._id,
        fullname: msg.sender.fullname,
        username: msg.sender.username,
        email: msg.sender.email
      }
    }));
    socket.emit('messages', sanitizedMessages);
  } catch (error) {
    socket.emit('error', 'Failed to load messages');
  }
};


exports.deleteMessage = async (socket, data) => {
  const { groupId, messageId } = data;
  try {
    const group = await groupModel.findById(groupId);
    group.messages = group.messages.filter(msg => msg._id != messageId);
    
    await group.save();

  } catch (error) {
    socket.emit('error', 'Delete failed');
  }
};


exports.editMessage = async (socket, data) => {

  try {
    const { groupId, userId, messageId, newContent } = data;

    const group = await groupModel.findById(groupId);
    if (!group) return socket.emit('error', 'Group not found');

    // Find message in group's messages array
    const message = group.messages.id(messageId);
    if (!message) return socket.emit('error', 'Message not found');

    // Check authorization
    if (message.sender.toString() !== userId) {
      return socket.emit('error', 'Unauthorized');
    }
  
    // Update message
    message.content = newContent;
    message.isEdited = true;
    await group.save();

    // Broadcast update to all group members

    const senderObj = await userModel.findById(userId);
    const newMessageU = {
      _id:message._id,
      sender: { _id: senderObj._id , fullname: senderObj.fullname , username: senderObj.username , email: senderObj.email },
      content:newContent,
      messageType: 'text',
    };
    
    socket.to(groupId).emit('messageEdited', newMessageU);
    socket.emit('messageEdited', newMessageU); 

    const notification = new ChatNotification({
      userId: userId,
      groupId: groupId,
      content: "edited a message",
    });

    socket.to(groupId).emit("newNotification", notification);
    await notification.save();
  } catch (error) {
    console.log('Error editing message:', error);
  }
};

exports.sendMediaMessage = async (socket, data) => {
  const { groupId, userId, url, mediaType , duration } = data;

  try {
    const group = await groupModel.findById(groupId);
    if (!group || !group.members.includes(userId)) {
      return socket.emit('error', 'Unauthorized');
    }

    const senderObj = await userModel.findById(userId);
    const newMessage = {
      sender: { _id: senderObj._id , fullname: senderObj.fullname , username: senderObj.username , email: senderObj.email },
      media: {
        type: mediaType,
        url,
        duration,
      },
      messageType: 'media',
      content: '' // Optional caption
    };
    socket.to(groupId).emit('newMessage', newMessage);
    socket.emit('newMessage', newMessage);

    const notification = new ChatNotification({
      userId: userId,
      groupId: groupId,
      content: "uploaded a media message",
    });

    socket.to(groupId).emit("newNotification", notification);
    await notification.save();
    group.messages.push(newMessage);
    await group.save();


  } catch (error) {
    console.log("error send media message", error);
  }
};



//notofication 


// Create a notification
exports.createNotification = async (req, res) => {
  try {
    const { userId, groupId, content } = req.body;

    // Validate input
    if (!userId || !groupId || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create the notification
    const notification = new ChatNotification({
      userId,
      groupId,
      content,
    });

    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getGroupNotifications = async (socket, userId) => {
  try {
    const groups = await groupModel.find({ members: userId });
    const groupIds = groups.map(g => g._id);

    const notifications = await ChatNotification.find({
      groupId: { $in: groupIds },
      userId: { $ne: userId }
    })
      .populate("userId", "username")
      .populate("groupId", "name")
      .sort({ timestamp: -1 });

    socket.emit("initialNotifications", notifications);
  } catch (error) {
    // Emit error via Socket.IO
    console.log("error", error.message);
  }
};
exports.getMessageById = async (req, res) => {
  try {
    const { groupId, messageId } = req.body;

    // Validate IDs
    if (!isValidObjectId(groupId) ){
      return res.status(400).json({ message: "Invalid group ID format" });
    }
    if (!isValidObjectId(messageId)) {
      return res.status(400).json({ message: "Invalid message ID format" });
    }

    // Find the group and message
    const group = await groupModel.findOne(
      { _id: groupId, "messages._id": messageId },
      { messages: { $elemMatch: { _id: messageId } } }
    );

    if (!group) {
      return res.status(404).json({ message: "Group or message not found" });
    }

    if (!group.messages || group.messages.length === 0) {
      return res.status(404).json({ message: "Message not found in group" });
    }

    const message = group.messages[0];
    res.json(message);

  } catch (error) {
    console.error("Error fetching message:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//report messages 


exports.addReportMessage = async (req, res) => {
  try {
    const { reporter, reportedUser, content, group, message } = req.body;

    if (![reporter, reportedUser, group, message].every(isValidObjectId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const newReport = new ReportMessage({
      reporter,
      reportedUser,
      content,
      group,
      message
    });

    await newReport.save();
    res.status(201).json(newReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

exports.getReportMessageList = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    
    if (['in progress', 'handled'].includes(status)) {
      query.status = status;
    }

    const reports = await ReportMessage.find(query)
      .populate("reporter", "username email")
      .populate("reportedUser", "username email")
      .populate("group", "name");
      
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReportMessageById = async (req, res) => {
  try {
    const report = await ReportMessage.findById(req.params.id)
      .populate("reporter", "username email")
      .populate("reportedUser", "username email")
      .populate("group", "name");

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.handleReportMessage = async (req, res) => {
  try {
    const report = await ReportMessage.findByIdAndUpdate(
      req.params.id,
      { status: "handled" },
      { new: true }
    ).populate("reporter reportedUser group");

    if (!report) {
      return res.status(403).json({ message: "Report not found" });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteReportMessage = async (req, res) => {
  try {
    const report = await ReportMessage.findByIdAndDelete(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    res.json({ message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};