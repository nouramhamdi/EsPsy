import React from "react";
import avatar from "../../../../assets/img/avatars/avatar11.png";
import banner from "../../../../assets/img/profile/banner.png";
import Card from "../../../../components/card";

const Banner = ({loggedUser}) => {
  return (
    <Card extra={"items-center w-full h-full p-[16px] bg-cover"}>
      {/* Background and profile */}
      <div
        className="relative mt-1 flex h-32 w-full justify-center rounded-xl bg-cover"
        style={{ backgroundImage: `url(${banner})` }}
      >
        <div className="absolute -bottom-12 flex h-[87px] w-[87px] items-center justify-center rounded-full border-[4px] border-white bg-pink-400 dark:!border-navy-700">
          <img className="h-full w-full rounded-full" src={avatar} alt="Profile" />
        </div>
      </div>

      {/* Name and contact details */}
      <div className="mt-16 flex flex-col items-center">
        <h4 className="text-xl font-bold text-navy-700 dark:text-white">{loggedUser ? loggedUser.fullname : "John Doe"}</h4>
        <p className="text-base font-normal text-gray-600">{loggedUser ? loggedUser.role : "Doctor"}</p>
      </div>

      {/* Profile details */}
      <div className="mt-6 mb-3 flex flex-col gap-2 items-center">
        <p className="text-lg font-medium text-navy-700 dark:text-white">{loggedUser ? loggedUser.email : "example@esprit.tn"}</p>
        <p className="text-lg font-medium text-navy-700 dark:text-white">{loggedUser ? loggedUser.datebirth.split('T')[0]  : "1999-05-15"}</p>
        <p className="text-lg font-medium text-navy-700 dark:text-white"> +216 {loggedUser ? loggedUser.number : "+1 234 567 890"}</p>
      </div>
    </Card>
  );
};

export default Banner;
