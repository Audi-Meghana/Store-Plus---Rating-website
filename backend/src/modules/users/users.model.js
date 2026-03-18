// User model is defined in auth.model.js — re-export it from here
// so both modules/auth and modules/users can import the same model
// without Mongoose throwing "Cannot overwrite User model once compiled"
export { default } from "../auth/auth.model.js";