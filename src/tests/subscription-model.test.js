const SubscriptionModel = require("src/models/subscription")
const db = require("src/db")

jest.mock("src/db", () => ({
  query: jest.fn(),
}))

describe("SubscriptionModel", () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("create", () => {
    it("should create new subscription", async () => {
      const mockSubscription = {
        id: 1,
        email: "test@example.com",
        city: "Kyiv",
        frequency: "daily",
        confirmation_token: "token123",
        unsubscribe_token: "token456",
        confirmed: false,
      }

      db.query.mockResolvedValue({
        rows: [mockSubscription],
      })

      const result = await SubscriptionModel.create("test@example.com", "Kyiv", "daily")

      expect(result).toEqual(mockSubscription)
      expect(db.query).toHaveBeenCalledTimes(1)
      expect(db.query.mock.calls[0][1]).toEqual([
        "test@example.com",
        "Kyiv",
        "daily",
        expect.any(String),
        expect.any(String),
      ])
    })

    it("should handle errors when creating a subscription", async () => {
      const mockError = new Error("Error")
      db.query.mockRejectedValue(mockError)

      await expect(SubscriptionModel.create("test@example.com", "Kyiv", "daily")).rejects.toThrow("Error")
    })
  })

  describe("confirmByToken", () => {
    it("should confirm subscription to the token", async () => {
      const mockSubscription = {
        id: 1,
        email: "test@example.com",
        city: "Kyiv",
        frequency: "daily",
        confirmed: true,
      }

      db.query.mockResolvedValue({
        rows: [mockSubscription],
      })

      const result = await SubscriptionModel.confirmByToken("token123")

      expect(result).toEqual(mockSubscription)
      expect(db.query).toHaveBeenCalledTimes(1)
      expect(db.query.mock.calls[0][1]).toEqual(["token123"])
    })

    it("should return null, if token not found", async () => {
      db.query.mockResolvedValue({
        rows: [],
      })

      const result = await SubscriptionModel.confirmByToken("notFoundToken")
      expect(result).toBeNull()
    })
  })
})
