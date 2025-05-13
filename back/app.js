var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var http = require('http');
const cors = require('cors');
const {connectToMongoDB} = require('./db/BD')
const bodyParser = require("body-parser");
const passport = require('./config/passport');
const axios = require('axios');
const testResponsesRoute = require("./routes/testResponses");
const fs = require('fs');
const { v4: uuidv4 } = require('uuid'); 
const Response = require('./Models/TestResponse.js');
const uploadImagesUsers = require("./middlewares/uploadrania.js");

const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); 
require("dotenv").config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var AppointmentsRouter = require('./routes/appointment');
const chatbotRoutes = require("./routes/chatbot");
const authGoogle = require('./routes/authGoogle');
const testRoutes = require('./routes/testRoutes');
const groupesRouter = require('./routes/groupes');
var resourceRouter = require('./routes/resources');
var eventsRouter = require('./routes/events');
var reservationsRouter = require('./routes/reservationRoutes');
const translateRoutes = require('./routes/translate');
const openaiRoutes = require('./routes/openai');

const { OpenAI } = require('openai');
var ExpressPeerServer = require('peer').ExpressPeerServer;


// Créer le dossier uploads et ses sous-dossiers s'ils n'existent pas
const uploadDirs = ['uploads', 'uploads/images', 'uploads/videos', 'uploads/audios', 'uploads/pdfs'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});


const groupController = require('./Controllers/groupController');



const session = require('express-session')




var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
  
  app.use(logger('dev'));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: false, limit: '10mb' }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:3000', // Your client URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(session({
  secret: "token",
  resave: false,
  saveUninitialized : true,
  cookie: { secure: false , maxAge: 6 *60 * 60 * 1000,httpOnly: true} 
}))


app.use(passport.initialize());
app.use(passport.session());





///// appel routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/appointments', AppointmentsRouter);
app.use("/api", chatbotRoutes);
app.use('/tests', testRoutes);  // This mounts your test routes
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use("/auth", authGoogle);
app.use("/grp", groupesRouter);
app.use("/resources", resourceRouter);
app.use("/api", openaiRoutes);
app.use('/events', eventsRouter);
app.use('/reservations', reservationsRouter);
const postsRouter = require('./routes/Posts.js');

app.use('/uploads', express.static('public'));
app.use('/posts', postsRouter);  
app.use('/api/translate', translateRoutes);

app.post("/test/upload-image", uploadImagesUsers.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded or invalid file type." });
  }

  // Construct the file URL
  const fileUrl = `${req.protocol}://${req.get("host")}/public/uploads/${req.file.filename}`;
  console.log("Payload being sent:", testPayload);

  // Return the file URL in the response
  return res.json({ imageUrl: fileUrl });
});
// In your Express routes

// In your Express routes
app.use('/api/responses', require('./routes/response.routes'));

// Fetch responses for a specific test
app.get('/api/responses', async (req, res) => {
  try {
    const responses = await Response.find()
      .populate('testId', 'title') // Populate testId with the title of the test
      .populate('userId', 'fullname'); // Populate userId with the name of the user
    
    res.json(responses);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching responses' });
  }
});


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Récupération de la clé API
});
app.use("/test-responses", testResponsesRoute);

app.post("/test/generate-image", async (req, res) => {
  try {
      const { prompt } = req.body;
      if (!prompt) {
          return res.status(400).json({ error: "Prompt is required" });
      }

      const response = await axios.post("https://rania-m920fpt8-swedencentral.openai.azure.com/openai/deployments/dall-e-3/images/generations?api-version=2023-12-01-preview", {
          prompt: prompt,
          n: 1,
          size: "1024x1024"
      }, {
          headers: {
              "Content-Type": "application/json",
              "api-key": "A1PlifrWYCAjPm6jxhhHI6Ht5agRx5YJwLYMrkKe0MGQnLmhe31oJQQJ99BDACfhMk5XJ3w3AAAAACOGe69e"
          }
      });

      res.json(response.data);
  } catch (error) {
      console.error("Erreur serveur :", error.response?.data || error.message);
      res.status(500).json({ error: "Erreur lors de la génération de l'image" });
  }
});
// Ensure the uploads directory exists
const uploadDirectory = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Function to download and save the image
async function downloadImage(imageUrl) {
  const response = await axios.get(imageUrl, { responseType: 'stream' });

  const ext = path.extname(imageUrl).split('?')[0] || '.jpg'; // Handle cases with query parameters
  const fileName = uuidv4() + ext; // Generate unique filename
  const uploadPath = path.join(uploadDirectory, fileName); // Save to uploads folder

  const writer = fs.createWriteStream(uploadPath);

  return new Promise((resolve, reject) => {
    response.data.pipe(writer);
    writer.on('finish', () => resolve(fileName)); // Return the filename after the download is complete
    writer.on('error', reject);
  });
}
app.post('/save-generated-image', async (req, res) => {
  try {
    const imageUrl = req.body.url;

    const fileName = await downloadImage(imageUrl);

    // Save `fileName` to your DB as if it were an uploaded file
    // Example: await ImageModel.create({ file: fileName });

    res.status(200).json({ message: 'Image saved', fileName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to save image' });
  }
});

app.post('/repost/:postId', async (req, res) => {
  const { userId } = req.body; // Assuming you send the userId as part of the request
  const postId = req.params.postId;

  try {
    // Find the post to be reposted
    const originalPost = await Post.findById(postId);
    if (!originalPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Create a new repost document
    const repostedPost = new Post({
      content: originalPost.content,
      media: originalPost.media,
      author: userId, // The user who is reposting
      repostedFrom: originalPost._id, // Reference to the original post
      createdAt: new Date(),
    });

    // Save the reposted post
    await repostedPost.save();

    return res.status(200).json(repostedPost); // Send the reposted post back to the client
  } catch (error) {
    console.error('Error reposting post:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json('error');
});



var server =http.createServer(app); 


const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Your client URL
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  }
});


const activePeers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  // Join group room
  socket.on('joinGroup', (groupId) => {
    groupController.joinGroup(socket, groupId);
  });

  // Send message handler
  socket.on('sendMessage', (data) => {
    groupController.sendMessage(socket, data);
  });

  // Get messages handler
  socket.on('getMessages', (groupId) => {
    groupController.getMessages(socket, groupId);
  });

  socket.on('deleteMessage', (data) => {
    groupController.deleteMessage(socket, data);
  });

  socket.on('editMessage', (data) => {
    groupController.editMessage(socket, data);
  });

  socket.on('sendMediaMessage', async (data) => {
    groupController.sendMediaMessage(socket, data);
  });



 
 socket.on("newNotification", (notification) => {
  console.log("New notification received:", notification);
 });

 socket.on('getNotifications', async (userId) => {
    try {
      await groupController.getGroupNotifications(socket, userId);
    } catch (error) {
      socket.emit('error', 'Failed to fetch notifications');
    }
  });


  socket.on("register-peer", (peerId) => {
    console.log("Peer registered:",peerId )
    activePeers.set(socket.id, { peerId, socketId: socket.id });
    socket.broadcast.emit("peer-registered", { socketId: socket.id, peerId });
  });

  socket.on("join-video-call", (groupId) => {
    console.log("User joined video call:", groupId);
    socket.join(groupId);
    const currentPeers = Array.from(activePeers.values()).filter(
      (peer) => peer.socketId !== socket.id
    );
    
    // Notify existing peers
    socket.to(groupId).emit("user-connected", {
      peerId: activePeers.get(socket.id)?.peerId,
      groupId
    });

    // Send existing peers to new user
    socket.emit("existing-peers", currentPeers.map((peer) => peer.peerId));
  });





  socket.on('sendAiMessage', (data) => {
    if (data.content.startsWith('@EsPsy_AI')) {
      // Extract AI prompt and handle specially
      const prompt = data.content.replace('@EsPsy_AI', '').trim();
      groupController.handleAIMessage(socket, {...data, prompt});
      console.log("Sending AiMessage to group:", data);
    } else {
      console.log("Sending AiMessage to group fails:", data);
    }
  });


  socket.on("disconnect", () => {
    const peerInfo = activePeers.get(socket.id);
    if (peerInfo) {
      socket.broadcast.emit("user-disconnected", peerInfo.peerId);
      activePeers.delete(socket.id);
    }
  });

});


const peerApp = express();
const peerServer = http.createServer(peerApp);

// PeerJS Configuration
peerApp.use(
  "/peerjs",
  ExpressPeerServer(peerServer, {
    debug: true,
    path: "/",
    allow_discovery: true,
    timeout: 20000,
    config: {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        {
          urls: "turn:numb.viagenie.ca",
          username: "your_username",
          credential: "your_password"
        }
      ]
    }
  })
);

peerServer.listen(9000, () => {
  console.log(`PeerJS server running on port ${9000}`);
});
server.listen(process.env.PORT,() => {connectToMongoDB(),console.log("app is running on port ",process.env.PORT)});

module.exports = app;
