import Cards from "./Cards";
import CreateRoom from "./CreateRoom";
import JoinRoom from "./JoinRoom";
import Navbar from "./Navbar";

const Home = ({ socket }) => {
  return (
    <>
      <Navbar />
      <div className="mt-4 pt-3">
        <h1 className="fw-bold text-uppercase text-black text-center">
          Welcome to CollabBoard
        </h1>
        <h3 className="text-center mt-sm-4 fw-normal fs-sm-4 fs-5">
          Create or join a collaborative whiteboard and bring your ideas to life
          together.
        </h3>
        <div className="d-flex flex-column flex-sm-row justify-content-center align-items-center">
          <CreateRoom socket={socket} />
          <JoinRoom socket={socket} />
        </div>
      </div>
        <Cards />
        <div className="pt-3">
        <h1 className="fw-bold text-black text-center">
        Ready to Collaborate?
        </h1>
        <h3 className="text-center mt-sm-4 fw-sm-normal fs-6">
          Create or join a collaborative whiteboard and bring your ideas to life
          together.
        </h3>
      </div>
    </>
  );
};

export default Home;
