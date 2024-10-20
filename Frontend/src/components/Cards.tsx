import { LuPencil } from "react-icons/lu";
import { LuUsers } from "react-icons/lu";
import { IoShareSocialOutline } from "react-icons/io5";
import { LuEraser } from "react-icons/lu";
import React from "react";

interface CardData {
  text: string;
  desc: string;
  icon: React.ReactElement;
}

const data:CardData[] = [
  {
    text: "Draw Together",
    desc: "Collaborate in real-time with drawing tools",
    icon: <LuPencil />,
  },
  {
    text: "Multi-User Support",
    desc: "Work with multiple users simultaneously",
    icon: <LuUsers />,
  },
  {
    text: "Easy Sharing",
    desc: "Share your whiteboard with a simple link",
    icon: <IoShareSocialOutline />,
  },
  {
    text: "Interactive Tools",
    desc: "Use various tools like pens, erasers",
    icon: <LuEraser />,
  },
];

const Cards :React.FC= () => {
  return (
      <div className="row px-sm-5 px-3 py-4 g-4">
        {data.map((data, index) => (
          <div key={index} className="col-lg-3 col-md-6 col-12">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title mt-2 mb-3 d-flex align-items-center gap-3">
                  {" "}
                  <span className="">{data.icon}</span> {data.text}
                </h5>
                <p className="card-text mb-3 mt-4">{data.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
  );
};

export default Cards;
