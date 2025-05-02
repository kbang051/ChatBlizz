import { Router } from "express";
import upload from "../middlewares/multer.middleware.js";
import verifyToken from "../middlewares/verifyToken.middleware.js";

import {
  fileUpload,
  saveMessage,
  getAllUsers,
  fetchRecommendation,
  fetchSearchAll,
  sendFriendRequest,
  acceptFriendRequest,
  getUserDetail,
  displayFriendRequests,
  showConversation,
  showUnreadMessages
} from "../db/queries.js";

const router = Router();

router.route("/getAllUsers/:q").get(verifyToken, getAllUsers);
router.route("/fetchRecommendation/:q").get(verifyToken, fetchRecommendation);
router.route("/fetchSearchAll/:q").get(verifyToken, fetchSearchAll);
router.route("/getUserDetail/:userId/and/:friendId").get(verifyToken, getUserDetail);

router.route("/displayFriendRequests/:userId").get(verifyToken, displayFriendRequests);

router.route("/showConversation").get(verifyToken, showConversation);

router.route("/getUnreadMessages").get(verifyToken, showUnreadMessages);

router.route("/sendFriendRequest").post(verifyToken, sendFriendRequest);

router.route("/acceptFriendRequest").post(verifyToken, acceptFriendRequest);

router.route("/saveMessage").post(verifyToken, saveMessage);
router.route("/fileUpload").post(verifyToken, upload.array("files"), fileUpload);

export default router;
