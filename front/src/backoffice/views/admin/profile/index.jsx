import Banner from "./components/Banner";
import General from "./components/General";
import userServices from "../../../../Services/UserService"; // Importing the userServices
import { useEffect, useState } from "react";

const ProfileOverview = () => {

  const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));


  return (
    <div className="flex w-full flex-col gap-5">
      <div className="w-ful mt-3 flex h-fit flex-col gap-5 lg:grid lg:grid-cols-12">
        <div className="col-span-4 lg:!mb-0">
        {loggedUser ?
          <Banner loggedUser={loggedUser} />
          :
          <Banner />
        }
        </div>
        <div className="col-span-5 lg:col-span-6 lg:mb-0 3xl:col-span-5">
        {loggedUser ?
          <General loggedUser={loggedUser} />
          :
          <General />
        }
        </div>











{/*
        <div className="col-span-5 lg:col-span-12 lg:mb-0 3xl:!col-span-3">
          <Notification />
        </div>

        <div className="col-span-3 lg:!mb-0">
          <Storage />
        </div>

        <div className="z-0 col-span-5 lg:!mb-0">
          <Upload />
        </div>
      </div>
       all project & ... 

      <div className="grid h-full grid-cols-1 gap-5 lg:!grid-cols-12">
        <div className="col-span-5 lg:col-span-6 lg:mb-0 3xl:col-span-4">
          <Project />
        </div>*/}
      </div>
    </div>
  );
};

export default ProfileOverview;
