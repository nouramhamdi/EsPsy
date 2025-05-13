import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Peer from "peerjs";
import { io } from "socket.io-client";
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import { BsCameraVideo, BsCameraVideoOff } from 'react-icons/bs';
import { FiMoreHorizontal } from 'react-icons/fi';
import { HiOutlineLogout } from 'react-icons/hi';
const VideoCall = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [peerId, setPeerId] = useState("");
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const socketRef = useRef();
  const myPeer = useRef();
  const videoGridRef = useRef();

  useEffect(() => {
    const initializeCall = async () => {
      try {
        socketRef.current = io("http://localhost:5000", { transports: ["websocket"] });

        myPeer.current = new Peer(undefined, {
          host: "localhost",
          port: 9000,
          path: "/peerjs",
          config: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              {
                urls: "turn:numb.viagenie.ca",
                username: "your_username",
                credential: "your_password"
              }
            ]
          },
          debug: 3
        });

        myPeer.current.on("open", (id) => {
          setPeerId(id);
          socketRef.current.emit("register-peer", id);
          socketRef.current.emit("join-video-call", groupId);
        });

        const mediaStream = await getMediaStream();
        setStream(mediaStream);

        const localVideo = document.createElement("video");
        localVideo.muted = true;
        addVideoStream(localVideo, mediaStream);

        myPeer.current.on("call", (call) => {
          call.answer(mediaStream);
          const remoteVideo = document.createElement("video");
          call.on("stream", (userVideoStream) => {
            addVideoStream(remoteVideo, userVideoStream);
          });
          call.on("close", () => remoteVideo.remove());
        });

        socketRef.current.on("user-connected", ({ peerId: userId }) => {
          if (userId !== myPeer.current.id) {
            setTimeout(() => connectToNewUser(userId, mediaStream), 1000);
          }
        });

        socketRef.current.on("existing-peers", (peers) => {
          peers.forEach(({ peerId: userId }) => {
            if (userId !== myPeer.current.id) {
              setTimeout(() => connectToNewUser(userId, mediaStream), 1000);
            }
          });
        });

      } catch (err) {
        console.error("Initialization failed:", err);
        if (err.name === "NotReadableError") {
          setError("Camera in use. Close other tabs or applications using the camera.");
        }
      }
    };

    initializeCall();

    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop());
      if (myPeer.current) myPeer.current.destroy();
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [groupId]);

  const getMediaStream = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevice = devices.find((d) => d.kind === "videoinput");
  
      if (!videoDevice) throw new Error("No video input device found");
  
      const constraints = {
        video: {
          deviceId: { ideal: videoDevice.deviceId }
        },
        audio: true
      };
  
      console.log("Using constraints:", constraints);
  
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      console.error("Media acquisition failed:", error);
      throw error;
    }
  };
  

  const addVideoStream = (video, stream) => {
    const container = document.createElement('div');
    container.className = 'video-item';
    
    video.srcObject = stream;
    video.className = 'rounded-lg shadow-lg';
    
    // Add loading placeholder
    const placeholder = document.createElement('div');
    placeholder.className = 'absolute inset-0 flex items-center justify-center bg-gray-800';
    placeholder.textContent = 'Connecting...';
    container.appendChild(placeholder);
    
    video.addEventListener('loadedmetadata', () => {
      placeholder.remove();
      container.appendChild(video);
      video.play();
    });
    
    videoGridRef.current.append(container);
  };




  const connectToNewUser = (userId, stream) => {
    try {
      const call = myPeer.current.call(userId, stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
      call.on("close", () => video.remove());
      call.on("error", (err) => {
        console.error("Connection error:", err);
        video.remove();
      });
    } catch (error) {
      console.error("Failed to connect to user:", error);
    }
  };

  const toggleMute = () => {
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks.forEach((track) => {
          track.enabled = !track.enabled;
        });
      }
      setIsMuted(!isMuted);
    }
  };

  const toggleCamera = () => {
    if (stream) {
      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks.forEach((track) => {
          track.enabled = !track.enabled;
        });
      }
      setIsCameraOn(!isCameraOn);
    }
  };

  return (
<div className="relative bg-gradient-to-br from-blue-900 to-purple-900 min-h-screen overflow-hidden">
      {/* Error Banner */}
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white p-3 rounded shadow-lg z-20">
          {error}
        </div>
      )}

      {/* Main Container */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header with Leave Call Button */}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold text-white">
            Video Conference
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline"
          >
            Leave Call
          </button>
        </header>

        {/* Video Grid */}
        <main className="">
          <div ref={videoGridRef} className=" flex items-center justify-center gap-4 sm:justify-start md:justify-center ">
          </div>
        </main>

        {/* Control Panel */}
        <footer className="bg-white bg-opacity-10 backdrop-blur-md rounded-full shadow-lg p-4 mt-8 flex justify-center space-x-4">
            {/* Mute Button */}
            <button
                onClick={toggleMute}
                className={`
                p-3 rounded-full 
                ${isMuted 
                    ? 'bg-gray-600 hover:bg-gray-700' 
                    : 'bg-blue-500 hover:bg-blue-700'}
                text-white focus:outline-none transition-all
                `}
                aria-label={isMuted ? "Unmute" : "Mute"}
            >
                {isMuted ? (
                <FaMicrophoneSlash className="h-6 w-6" />
                ) : (
                <FaMicrophone className="h-6 w-6" />
                )}
            </button>

            {/* Camera Toggle */}
            <button
                onClick={toggleCamera}
                className={`
                p-3 rounded-full 
                ${isCameraOn 
                    ? 'bg-gray-600 hover:bg-gray-700' 
                    : 'bg-green-500 hover:bg-green-700'}
                text-white focus:outline-none transition-all
                `}
                aria-label={isCameraOn ? "Turn Off Camera" : "Turn On Camera"}
            >
                {isCameraOn ? (
                <BsCameraVideo className="h-6 w-6" />
                ) : (
                <BsCameraVideoOff className="h-6 w-6" />
                )}
            </button>

            {/* More Controls */}
            <button
                className="p-3 rounded-full bg-gray-600 hover:bg-gray-700 text-white focus:outline-none transition-all"
                aria-label="More Controls"
            >
                <FiMoreHorizontal className="h-6 w-6" />
            </button>

            {/* Leave Call */}
            <button
                onClick={() => navigate(-1)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition-all"
            >
                <HiOutlineLogout className="h-6 w-6" />
            </button>
        </footer>
      </div>
      {/* Animated Gradient Background - Optional */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 blur-3xl"></div>
      
    </div>
  );
};

export default VideoCall;
