import { Router } from "express";
import { getAllUsers, fetchSearchResults, sendFriendRequest, acceptFriendRequest, getUserDetail } from "../db/queries.js";

const router = Router();

router.route("/getAllUsers").get(getAllUsers);
router.route("/fetchSearchResults/:q").get(fetchSearchResults);
router.route("/getUserDetail/:userId/and/:friendId").get(getUserDetail)

router.route("/sendFriendRequest").post(sendFriendRequest);
router.route("/acceptFriendRequest").post(acceptFriendRequest);

export default router;


