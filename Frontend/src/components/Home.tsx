import Cards from "./Cards";
import Navbar from "./Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { FaGithub } from "react-icons/fa";
import heroImg from "../assets/hero.png";
import { useState } from "react";
import CreateRoom from "./CreateRoom";
import JoinRoom from "./JoinRoom";
import { useNavigate } from "react-router-dom";

interface HomeProps {
  socket: any;
}

const Home: React.FC<HomeProps> = ({ socket }) => {
  const [showAction, setShowAction] = useState<"create" | "join" | null>(null);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-6 md:px-24 pt-16 md:pt-24 pb-24">
        <div className="flex flex-col md:flex-row items-center gap-12">
          {/* Hero Content */}
          <div className="flex-1 text-left min-h-[450px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {!showAction ? (
                <motion.div
                  key="hero-text"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <h1 className="text-5xl md:text-6xl font-extrabold text-[#1a1a1a] leading-tight mb-6">
                    Real-time<br />Collaborative<br />Whiteboard
                  </h1>
                  <p className="text-lg text-gray-500 mb-10 max-w-md">
                    Draw, write, brainstorm together in real time.
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => navigate("/dashboard")}
                      className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                    >
                      Create a Board
                    </button>
                    <button
                      onClick={() => navigate("/dashboard")}
                      className="bg-gray-100 text-[#1a1a1a] px-8 py-4 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                    >
                      Try as Guest
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="action-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4 }}
                  className="w-full max-w-md"
                >
                  <button
                    onClick={() => setShowAction(null)}
                    className="text-blue-600 font-semibold mb-6 flex items-center gap-2 hover:underline"
                  >
                    ← Back to Home
                  </button>
                  {showAction === "create" ? (
                    <CreateRoom socket={socket} />
                  ) : (
                    <JoinRoom socket={socket} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="flex-1 w-full cursor-pointer hover:scale-105 transition-transform duration-500"
            onClick={() => navigate("/dashboard")}
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
              <img
                src={heroImg}
                alt="Whiteboard Preview"
                className="w-full h-auto object-cover"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-24 border-t border-gray-50">
        <div className="container mx-auto px-6 md:px-24">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-[#1a1a1a] mb-4"
            >
              Features
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-gray-500 max-w-2xl mx-auto"
            >
              Everything you need for seamless collaboration, built with modern technology for a fast and reliable experience.
            </motion.p>
          </div>

          <Cards />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100">
        <div className="container mx-auto px-6 md:px-24 text-center">
          <div className="flex justify-center mb-8">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-900 transition-colors text-3xl"
            >
              <FaGithub />
            </a>
          </div>
          <p className="text-gray-400 text-sm">
            © 2024 Boardify. Built with Next.js, Tailwind CSS, and Liveblocks.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
