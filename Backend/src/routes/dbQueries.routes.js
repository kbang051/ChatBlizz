import { Router } from "express";
import upload from "../middlewares/multer.middleware.js";
import verifyToken from "../middlewares/verifyToken.js";

import {
  fileUpload,
  saveMessage,
  getAllUsers,
  fetchSearchResults,
  sendFriendRequest,
  acceptFriendRequest,
  getUserDetail,
  displayFriendRequests,
  showConversation,
} from "../db/queries.js";

const router = Router();

// router.route("/getAllUsers/:q").get(getAllUsers);
// router.route("/fetchSearchResults/:q").get(fetchSearchResults);
// router.route("/getUserDetail/:userId/and/:friendId").get(getUserDetail);
// router.route("/displayFriendRequests/:userId").get(displayFriendRequests);
// router.route("/showConversation").get(showConversation);

// router.route("/sendFriendRequest").post(sendFriendRequest);
// router.route("/acceptFriendRequest").post(acceptFriendRequest);
// router.route("/saveMessage").post(saveMessage);
// router.route("/fileUpload").post(upload.array("files"), fileUpload);

router.route("/getAllUsers/:q").get(verifyToken, getAllUsers);
router.route("/fetchSearchResults/:q").get(verifyToken, fetchSearchResults);
router.route("/getUserDetail/:userId/and/:friendId").get(verifyToken, getUserDetail);
router.route("/displayFriendRequests/:userId").get(verifyToken, displayFriendRequests);
router.route("/showConversation").get(verifyToken, showConversation);

router.route("/sendFriendRequest").post(verifyToken, sendFriendRequest);
router.route("/acceptFriendRequest").post(verifyToken, acceptFriendRequest);
router.route("/saveMessage").post(verifyToken, saveMessage);
router.route("/fileUpload").post(verifyToken, upload.array("files"), fileUpload);

export default router;
