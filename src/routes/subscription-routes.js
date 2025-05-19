const express = require("express")
const SubscriptionController = require("../controllers/subscription-controller")

const router = express.Router()

router.post("/subscribe", SubscriptionController.subscribe)
router.get("/confirm/:token", SubscriptionController.confirmSubscription)
router.get("/unsubscribe/:token", SubscriptionController.unsubscribe)
router.get("/subscriptions", SubscriptionController.getSubscriptionsByEmail)
router.post("/unsubscribe", SubscriptionController.deleteSubscription)

module.exports = router
