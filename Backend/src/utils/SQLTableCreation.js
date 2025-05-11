import Users from "../models/Users.model.js";
import Messages from "../models/Messages.model.js";
import File from "../models/File.model.js";
import Friends from "../models/Friends.model.js";

const checkTables = async () => {
   const res1 = await Users.findAll({ limit: 2, raw: true });
   const res2 = await Messages.findAll({ limit : 2, raw: true});
   const res3 = await File.findAll({ limit : 2, raw: true});
   const res4 = await Friends.findAll({ limit : 2, raw: true});
   // console.log("Users Response");
   // console.log(res1);
   // console.log("Messages Response");
   // console.log(res2);
   // console.log("file Response");
   // console.log(res3);
   // console.log("Friends Response");
   // console.log(res4);
}

export default checkTables;