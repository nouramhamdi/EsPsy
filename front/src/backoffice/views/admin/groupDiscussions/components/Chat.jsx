import React, { useEffect, useRef, useState } from "react";
import { IoMdClose } from "react-icons/io"; // Close icon
import { MdFileUpload, MdMic, MdCall, MdVideoCall } from "react-icons/md";
import { FaFilePdf, FaFileAlt } from "react-icons/fa"; // Import icons
import img from "../../../../assets/img/avatars/avatar1.png"
import { io } from "socket.io-client";
import groupServices from "../../../../../Services/groupService"; // Adjust the import path
import axios from "axios";
//import '../../../../assets/css/chat.css'
import { useNavigate } from "react-router-dom";
import ReportFormCard from "./ReportFormCard";
const Chat = ({GroupId,openChat,toggleChat}) => {
  const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));  
  const socket = useRef();
  const [messages, setMessages] = useState([
    { sender: "AI", text: "Hi, how can I help you todayyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy?" },
  ]);
  const [input, setInput] = useState("");
  const [group, setGroup] = useState(null);
  const [activeMessageId, setActiveMessageId] = useState(null);
  const [reportActiveMessageId, setReportActiveMessageId] = useState(null);

  const [activeEditBtn, setActiveEditBtn] = useState(false);
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
  const navigate = useNavigate();
  const [showReportForm, setShowReportForm] = useState(false);

  const [selectedReportDetails, setSelectedReportDetails] = useState({
    reporter: loggedUser._id,
    reportedUser: null,
    groupId: null,
    messageId: null,
    content:"",
  });

  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');


  // Format time (e.g., seconds → MM:SS)
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }


  useEffect(() => {
    const fetchGroup = async () => {
      try {
        console.log('Fetching group with ID:', GroupId); // Debug log [[9]]
        const dataGroup = await groupServices.getGroupById(GroupId);
        setGroup(dataGroup.data); // Ensure API returns { data: group }
      } catch (error) {
        console.error("Failed to fetch group:", error);
        setGroup(null); // Handle error state
      }
    };
    fetchGroup();
  }, [GroupId]); 


  useEffect(() => {
    // Initialize socket and assign to ref
    socket.current = io("https://espsy.onrender.com", {
      transports: ['websocket']
    });
  
    if (GroupId) {
      // Wait for connection before emitting events
      socket.current.on('connect', () => {
        socket.current.emit("joinGroup", GroupId);
        socket.current.emit("getMessages", GroupId);
      });
    } 
  
    // Event listeners
    socket.current.on("messages", (msgs) => {
      setMessages(msgs);

    });
  
    socket.current.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, msg]); 
    });
  
    socket.current.on('messageEdited', (updatedMessage) => {
      console.log(updatedMessage);
      console.log(messages);
      setMessages(prev => 
        prev.map(msg => 
          msg._id === updatedMessage._id ? updatedMessage : msg
        )
      );
    });

    return () => {
      socket.current.off("messages", (msgs) => {
        setMessages(msgs);
      });
    
      socket.current.off("newMessage", (msg) => {
        setMessages((prev) => [...prev, msg]); 
      });
      socket.current.disconnect();
    };
  }, [GroupId]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;



    socket.current.emit("sendMessage", {
      groupId: GroupId,
      userId: loggedUser._id,
      content: input,
    });


    if (input.startsWith('@EsPsy_AI')) {
      socket.current.emit("sendAiMessage", {
        groupId: GroupId,
        content: input,
      });
    }


    setInput("");
  };

  // Delete message handler
  const handleDelete = (messageId) => {
    socket.current.emit("deleteMessage", { groupId: GroupId, messageId });
    setMessages(messages.filter(msg => msg._id !== messageId));
  };

  // Edit message handler
  const handleEdit = (message) => {
    setInput(message.content);
    setActiveEditBtn(true);
  };
  const sendMessageEdited = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    console.log('sendMessageEdited');
    socket.current.emit("editMessage", {
      groupId: GroupId,
      userId: loggedUser._id,
      messageId: activeMessageId,
      newContent: input,
    });
    setActiveMessageId(null); 
    setInput("");
  };



  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('https://espsy.onrender.com/grp/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      let mediaType;
      let duration = null;
      if (file.type.startsWith('image/')) {
        mediaType = 'image';
      } else if (file.type.startsWith('video/')) {
        mediaType = 'video';
      } else if (file.type.startsWith('audio/')) {
        mediaType = 'audio';
        duration = response.data.duration
      } else if (file.type === 'application/pdf') {
        mediaType = 'pdf';
      } else if (file.type === 'text/plain') {
        mediaType = 'txt';
      } else {
        return socket.emit('error', 'Unsupported file type');
      }
      socket.current.emit('sendMediaMessage', {
        groupId: GroupId,
        userId: loggedUser._id,
        url: response.data.url,
        mediaType: mediaType,
        duration: duration
      });

      setSelectedFile(null);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  //upload logic
  const handleFileSelect = () => {
    fileInputRef.current.click();
  };

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks = [];
    
    recorder.ondataavailable = (e) => {
      chunks.push(e.data);
      console.log('ondataavailable check test');

    };
    
    recorder.onstop = async () => {
      const audioBlob = new Blob(chunks, { type: 'audio/wav' });
      setAudioBlob(audioBlob);
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(audioUrl);
      console.log('recorder.onstop check test ',audioBlob);

      // Automatically send after recording stops
      await handleSendAudio();
    };
    
    recorder.start();
    setMediaRecorder(recorder);
    setAudioChunks(chunks);
    setIsRecording(true);
  } catch (error) {
    console.error('Error starting recording:', error);
  }

};

const stopRecording = () => {
  if (mediaRecorder) {
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
    setIsRecording(false);
  }
};

const handleSendAudio = async () => {
  if (!audioBlob) return;
   
  try {
    console.log('handleSendAudio check test ',audioBlob);
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.wav');
    
    const response = await axios.post('https://espsy.onrender.com/grp/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    


    console.log("response audio ",response.data);
    socket.current.emit('sendMediaMessage', {
      groupId: GroupId,
      userId: loggedUser._id,
      url: response.data.url,
      mediaType: 'audio',
      duration: 1
    });
    
    // Reset recording state
    setAudioBlob(null);
    setAudioUrl('');
  } catch (error) {
    console.error('Error sending audio:', error);
  }
};

const toggleRecording = () => {
  if (isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
};





  return (
    <div className="">
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 text-[#1977cc] bg-[#1977cc] "
            onClick={toggleChat}
          />
      {/* messages Header */}      

          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg border border-gray-300 w-[640px] h-[634px] shadow-lg z-50  ">
            <div className="flex justify-between items-center pb-4 border-b">
              <div>
                <h2 className="font-semibold text-lg">{group ? group.name : "Loading..."}</h2>
                <p className="text-sm text-gray-500">{group ? group.theme : "Loading..."}</p>
              </div>
              <div className="flex ">
                    <button
                        className="mx-2 inline-flex  items-center justify-center rounded-full text-sm font-medium text-white bg-[#1977cc] hover:bg-[#1763a7]  h-8 px-4 py-2"
                        >
                            <MdVideoCall 
                            className="text-white" 
                            size={16} 
                            title="Voice recording"
                            onClick={() => navigate(`/call/${GroupId}`)}
                            />
                    </button>
                    <button onClick={toggleChat} className="text-gray-600 hover:text-gray-900">
                        <IoMdClose size={24} />
                    </button>
              </div>
            </div>

         {/* Messages List */}
         <div className="h-[474px] overflow-y-auto p-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`rounded-lg flex ${
                msg.sender._id === loggedUser._id ? "justify-end" : "justify-start"
              } mb-1`}
              onClick={() => {
                if (msg.sender._id === loggedUser._id) {
                  setActiveMessageId(activeMessageId === msg._id ? null : msg._id);
                }
              else{
                setReportActiveMessageId(reportActiveMessageId===msg._id ? null : msg._id);
              }}}
            >
              <div
                className={`relative max-w-[75%]rounded-lg p-3 rounded-xl ${
                  msg.sender._id === loggedUser._id
                    ? "bg-[#1977cc] text-white  "
                    : "bg-gray-100"
                }`}
              >
                <div className="flex items-start space-x-2 min-w-36">
                  {msg.sender._id !== loggedUser._id && (
                    <img
                      src={`https://espsy.onrender.com/uploads/${loggedUser.image_user}`}
                      alt="avatar"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-semibold">
                      {msg.sender._id !== loggedUser._id ?msg.sender.username : "Me"}
                    </p>
                    <p className="text-sm break-words max-w-64">{msg.content}</p>
                    {msg.media && (
                      <>
                        {msg.media.type === 'image' && (
                          <img
                            src={`https://espsy.onrender.com${msg.media.url}`}
                            alt="uploaded"
                            className="max-h-48 max-w-48 mt-2 rounded"
                          />
                        )}
                        {msg.media.type === 'video' && (
                          <video
                            controls
                            className="max-h-48 max-w-48 mt-2 rounded"
                            src={`https://espsy.onrender.com${msg.media.url}`}
                          />
                        )}

                          {msg.media.type === 'audio' && (
                            <div key={msg._id} className="flex items-center  rounded-lg p-2 shadow-md mt-2"
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.2)', // Fallback for older browsers
                              backdropFilter: 'blur(10px)', // Modern browsers
                            }}>
                              {/* Play/Pause Button */}
                              <button
                                onClick={() => {
                                  const audio = audioRef.current;
                                  audio.paused ? audio.play() : audio.pause();
                                  setIsPlaying(!audio.paused);
                                }}
                                className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1977cc] text-white mr-3"
                              >
                                {isPlaying ? (
                                  <svg className="w-6 h-6 m-auto" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M14 19H18V5H14M6 19H10V5H6M6 5V19" />
                                  </svg>
                                ) : (
                                  <svg className="w-6 h-6 m-auto" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M8 5V19L19 12M16 5V19H16" />
                                  </svg>
                                )}
                              </button>

                              {/* Progress Bar and Duration */}
                              <div className="flex-grow">
                                <div className="relative h-1 rounded-full bg-gray-200">
                                  <div
                                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#1977cc] to-purple-500 rounded-full"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <div className="flex justify-between text-xs text-white-500 mt-1">
                                  <span>{formatTime(currentTime)}</span>
                                  <span>{formatTime(duration)}</span>
                                </div>
                              </div>

                              {/* Hidden Audio Element */}
                              <audio
                                ref={audioRef}
                                src={`https://espsy.onrender.com${msg.media.url}`}
                                onTimeUpdate={() => {
                                  if (audioRef.current.duration) {
                                    setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
                                    setCurrentTime(audioRef.current.currentTime);
                                  }
                                }}
                                onLoadedMetadata={() => {
                                  setDuration(audioRef.current.duration);
                                }}
                                onEnded={() => setIsPlaying(false)}
                                className="hidden"
                              />
                            </div>
                          )}
                        {msg.media.type === 'pdf' && (
                          <div className="mt-2 flex items-center space-x-2">
                            {/* PDF Icon */}
                            <FaFilePdf
                              className={`w-6 h-6 ${msg.sender._id !== loggedUser._id ? "text-[#1977cc]" : "text-white"}`}
                            />                            {/* PDF Link */}
                            <a
                              href={`https://espsy.onrender.com${msg.media.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`${msg.sender._id !== loggedUser._id ? "text-[#1977cc]" : "text-white"}`}
                              >
                              View Pdf File
                            </a>
                          </div>
                        )}

                          {msg.media.type === 'txt' && (
                            <div className="mt-2 flex items-center space-x-2">
                              {/* Text File Icon */}
                              <FaFileAlt 
                                className={`w-6 h-6 ${msg.sender._id !== loggedUser._id ? "text-[#1977cc]" : "text-white"}`}
                              />
                              {/* Text File Link */}
                              <a
                                href={`https://espsy.onrender.com${msg.media.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${msg.sender._id !== loggedUser._id ? "text-[#1977cc]" : "text-white"}`}
                              >
                                View Txt File
                              </a>
                            </div>
                          )}
                      </>
                    )}    
                  </div>
                </div>
                    {/* Dropdown menu */}
                    {msg.sender._id === loggedUser._id && activeMessageId === msg._id && (
                            <div className="absolute left-[-195px] top-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(msg);
                                }}
                                className="block w-full px-4 py-2 text-black text-left hover:bg-gray-100"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(msg._id);
                                }}
                                className="block w-full px-4 py-2 text-black text-left hover:bg-gray-100"
                              >
                                Delete
                              </button>
                            </div>
                          )}  
                    {msg.sender._id !== loggedUser._id && reportActiveMessageId === msg._id && (
                            <div className="absolute right-[-195px] top-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedReportDetails({
                                    reporter: loggedUser._id,
                                    reportedUser: msg.sender._id,
                                    groupId: GroupId,
                                    messageId: msg._id,
                                    content:"",
                                  });
                                  setShowReportForm(true);
                                }}
                                className="block w-full px-4 py-2 text-black text-left hover:bg-gray-100"
                              >
                                Report 
                              </button>
                            </div>
                          )}   

                          {/* Report Form */}
                          {showReportForm && (
                            <ReportFormCard
                              onSuccess={() => {
                                setSelectedReportDetails({
                                  reporter: '',
                                  reportedUser: '',
                                  groupId: '',
                                  messageId: '',
                                  content: ''
                                });
                              }}
                              onClose={() => setShowReportForm(false)}
                              selectedReportDetails={selectedReportDetails}
                            />
                          )} 
              </div>

            </div>
            
          ))}
         </div>
     
      {/* messages Footer */}      

            <div className="flex items-center pt-2" >
            <button
              type="button"
              className={`ml-2 inline-flex items-center justify-center rounded-md text-sm font-medium text-white ${isRecording ? 'bg-red-500' : 'bg-[#1977cc] hover:bg-[#1763a7]'} h-10 px-4 py-2`}
              onClick={toggleRecording}
            >
              {isRecording ? (
                <div className="flex items-center">
                  {/* Stop icon (square) when recording */}
                  <svg 
                    className="text-white animate-pulse" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <rect x="6" y="6" width="12" height="12" />
                  </svg>
                  <span className="ml-2 text-xs">Recording...</span>
                </div>
              ) : (
                <MdMic 
                  className="text-white" 
                  size={24} 
                  title="Voice recording"
                />
              )}
            </button>
              <button
                type="submit"
                className="ml-2 mr-2 inline-flex items-center justify-center rounded-md text-sm font-medium text-white bg-[#1977cc] hover:bg-[#1763a7]h-10 px-4 py-2"
                onClick={handleFileSelect}
              >
                
                   <MdFileUpload 
                    className="text-white" 
                    size={24} 
                    />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <input
                type="text"
                className="flex h-10 w-full rounded-md border border-[#1977cc] px-3 py-2 text-sm placeholder-[#1977cc]- focus:outline-none focus:ring-2 focus:ring-[#1977cc] text-[#1763a7] "
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              {
                activeEditBtn 
                ? 
                <button
                className="ml-2 inline-flex items-center justify-center rounded-md text-sm font-medium text-white bg-[#1977cc] hover:bg-[#1763a7] h-10 px-4 py-2"
                onClick={sendMessageEdited}
              >
                  Edit
                </button>
                :
                <button
                className="ml-2 inline-flex items-center justify-center rounded-md text-sm font-medium text-white bg-[#1977cc] hover:bg-[#1763a7] h-10 px-4 py-2"
                onClick={sendMessage}
              >
                  Send
                </button>
              }

            </div>
          </div>
        </>
     
    </div>
  );
};

export default Chat;
