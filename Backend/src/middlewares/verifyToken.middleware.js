import admin from "firebase-admin";
import serviceAccount from "../../chatblizz-firebase-adminsdk-fbsvc-bdc2450a8e.json" assert { type: "json" };

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("No authHeader provided");
        return res.status(400).json({ message: "Unauthorized: No token provided" });
    }
    const idToken = authHeader.split("Bearer ")[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken; 
        next();
    } catch (error) {
        console.error("Error verifying token:", error);
        res.status(401).json({ message: "Forbidden: Invalid token" });
    }
}

export default verifyToken;