export class UserAvailabilityError extends Error {
  constructor (message, code) {
    super(message, code)
    this.code = code
  }
}
export class UserNotFoundError extends Error {
  constructor (code) {
    super(code)
    this.code = code
  }
}
