import mongoose from "mongoose";

/**
 * Resolves the authenticated or claimed user identifier
 * Priority: Verified JWT user (`req.user._id`) > query/body > anonymous
 */
export const resolveUserId = (req, anonymous = "anonymous-client") =>
  req.user?._id?.toString() || req.user?.id || req.query?.userId || req.body?.userId || anonymous;

/**
 * Safely picks only allowed keys from an object
 */
export const pick = (obj = {}, keys = []) =>
  keys.reduce((acc, key) => {
    if (obj[key] !== undefined) acc[key] = obj[key];
    return acc;
  }, {});

export const isValidObjectId = (id) =>
  mongoose.isValidObjectId(id) && /^[0-9a-fA-F]{24}$/.test(String(id));

/**
 * Builds safe filter for booking reference or Mongo ObjectId
 */
export const bookingIdFilter = (id) => {
  const clauses = [{ bookingRef: id }];
  if (isValidObjectId(id)) clauses.push({ _id: id });
  return { $or: clauses };
};

export default { resolveUserId, pick, isValidObjectId, bookingIdFilter };
