import admin from "firebase-admin";
import serviceAccount from "../../chatblizz-firebase-adminsdk-fbsvc-bdc2450a8e.json" assert { type: "json" };

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})

const verifyJWT = async (req, res, next) => {
    const idToken = req.headers.authorization?.split(" ")[1];
    if (!idToken) {
        console.log("No idToken provided")
        return res.status(400).json({error: "No token provided"});
    }
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken) 
        req.user = decodedToken 
        next()
    } catch (error) {
        console.error("Error verifying token:", error);
        res.status(401).json({ error: "Invalid token" });
    }
}

export default verifyJWT;