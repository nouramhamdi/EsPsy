import React from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import Animation from "../assets/notfound.json";

const Error = () => {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-white">
      <Player
        autoplay
        loop
        src={Animation}
        style={{ height: "100vh", width: "100vw" }}
      />
    </div>
  );
};

export default Error;
