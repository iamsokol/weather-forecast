const SubscriptionController = require("src/controllers/subscription-controller")
const SubscriptionModel = require("src/models/subscription")
const EmailService = require("src/services/email-service")

jest.mock("src/models/subscription")
jest.mock("src/services/email-service")

describe("SubscriptionController", () => {
  let req, res

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
    }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("subscribe", () => {
    it("should create subscription and send confirmation email", async () => {
      req.body = {
        email: "test@example.com",
        city: "London",
        frequency: "daily",
      }

      const mockSubscription = {
        id: 1,
        email: "test@example.com",
        city: "London",
        frequency: "daily",
        confirmation_token: "token123",
        unsubscribe_token: "token456",
        confirmed: false,
      }
      SubscriptionModel.create.mockResolvedValue(mockSubscription)

      EmailService.sendConfirmationEmail.mockResolvedValue({})

      await SubscriptionController.subscribe(req, res)

      expect(SubscriptionModel.create).toHaveBeenCalledWith("test@example.com", "London", "daily")
      expect(EmailService.sendConfirmationEmail).toHaveBeenCalledWith("test@example.com", "London", "token123", "daily")
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: "Subscription created. Check your email for confirmation.",
      })
    })

    it("should return error if required fields are missing", async () => {
      req.body = {
        email: "test@example.com",
        city: "London",
      }

      await SubscriptionController.subscribe(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: "All fields (email, city, frequency) are required",
      })
    })
  })

  describe("confirmSubscription", () => {
    it("should confirm subscription by token", async () => {
      req.params = {
        token: "token123",
      }

      const mockSubscription = {
        id: 1,
        email: "test@example.com",
        city: "London",
        frequency: "daily",
        confirmed: true,
      }
      SubscriptionModel.confirmByToken.mockResolvedValue(mockSubscription)

      await SubscriptionController.confirmSubscription(req, res)

      expect(SubscriptionModel.confirmByToken).toHaveBeenCalledWith("token123")
      expect(res.send).toHaveBeenCalled()
      expect(res.send.mock.calls[0][0]).toContain("<!DOCTYPE html>")
      expect(res.send.mock.calls[0][0]).toContain("Subscription Confirmed")
    })

    it("should return error if token not found", async () => {
      req.params = {
        token: "nonexistentToken",
      }

      SubscriptionModel.confirmByToken.mockResolvedValue(null)

      await SubscriptionController.confirmSubscription(req, res)

      expect(SubscriptionModel.confirmByToken).toHaveBeenCalledWith("nonexistentToken")
      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ error: "Token not found" })
    })
  })
})
