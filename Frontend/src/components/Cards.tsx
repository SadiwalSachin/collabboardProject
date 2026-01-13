import { LuUsers, LuMousePointer2, LuHistory } from "react-icons/lu";
import React from "react";
import { motion } from "framer-motion";

interface CardData {
  text: string;
  desc: string;
  icon: React.ReactElement;
}

const data: CardData[] = [
  {
    text: "Real-time Collaboration",
    desc: "Work with your team simultaneously on the same canvas.",
    icon: <LuUsers />,
  },
  {
    text: "Multi-user Cursors",
    desc: "See where your teammates are pointing and working.",
    icon: <LuMousePointer2 />,
  },
  {
    text: "Auto-save & Version History",
    desc: "Never lose your work with automatic saving and easy rollbacks.",
    icon: <LuHistory />,
  },
];

const Cards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
      {data.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          viewport={{ once: true }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-start gap-4 hover:shadow-md transition-shadow"
        >
          <div className="text-3xl text-blue-600 mb-2">
            {item.icon}
          </div>
          <h5 className="font-bold text-gray-900 text-lg">
            {item.text}
          </h5>
          <p className="text-gray-500 text-sm leading-relaxed">
            {item.desc}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

export default Cards;

