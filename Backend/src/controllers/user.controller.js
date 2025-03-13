import { pool } from "../index.js";

const userRegistration = async (req, res) => {
    console.log("Request received to register user")
    console.log(req.body)
    const { username, email, fireBaseID, avatar } = req.body
    const essentials = [ username, email, fireBaseID ]
    for (const item of essentials) {
        if (item.trim().length === 0) {
            console.log(`${item} is missing`)
            return res.status(400).json({message: `${item} is missing`})
        }
    }
    try {
        const [checkUserName] = await pool.query("SELECT `username` FROM `users` WHERE `username` = ?", [username.trim()])
        if (checkUserName.length > 0) {
            console.log("username already exists in the user database")
            return res.status(400).json({message: `Username ${username} already exists in the database`})
        }
    
        const [checkEmail] = await pool.query("SELECT `email` FROM `users` WHERE `email` = ?", [email.trim()])
        if (checkEmail.length > 0) {
            console.log("email already exists in the user database")
            return res.status(400).json({message: `Email ${email} already exists in the database`})
        }
        
        const queryOperation = "INSERT INTO `users` (`username`, `email`, `fireBaseID`, `id`) VALUES (?, ?, ?, ?)"
        const [query] = await pool.query(queryOperation, [username.trim(), email.trim(), fireBaseID.trim(), fireBaseID.trim()])
        if (query.affectedRows > 0) {
            console.log("User successfully inserted!");
            return res.status(200).json({ message: "User registered successfully", userId: query.insertId });
        }

    } catch (error) {
        console.log("Unable to insert user data in the user database")
        console.log(error)
        return res.status(400).json({message: `${error}`})
    }
}

export { userRegistration }

