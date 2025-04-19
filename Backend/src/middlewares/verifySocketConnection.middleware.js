import admin from "firebase-admin";

const socketAuth = async (socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    console.log("No token provided in socket handshake");
    return next(new Error("Authentication error"));
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    socket.user = decodedToken; 
    next();
  } catch (err) {
    console.error("Invalid Firebase token:", err);
    next(new Error("Authentication error"));
  }
};

export default socketAuth;





