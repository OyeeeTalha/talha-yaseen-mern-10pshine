import { Socket } from "socket.io";
import { getSession } from "@auth/express";
import { authConfig } from "../../features/auth/config.js";
import logger from "../utils/logger.js";
import { parse as parseCookie } from "cookie";
import { IncomingMessage } from "http";

export const socketAuthMiddleware = async (
  socket: Socket,
  next: (err?: Error) => void,
) => {
  try {
    // Extract request from handshake
    const req = socket.request as IncomingMessage & { cookies?: any };

    // Parse cookies from headers if not already parsed
    if (req.headers.cookie && !req.cookies) {
      req.cookies = parseCookie(req.headers.cookie);
    }

    // Log handshake info for debugging
    logger.info({
      msg: "Socket handshake attempt",
      hasCookie: !!req.headers?.cookie,
      cookieKeys: req.cookies ? Object.keys(req.cookies) : [],
      origin: req.headers?.origin,
    });

    // Create Express-like request object for getSession
    const expressReq = Object.assign(req, {
      // Add Express-specific properties that Auth.js might need
      protocol: req.headers["x-forwarded-proto"] || "http",
      get: (name: string) => {
        return req.headers[name.toLowerCase()];
      },
      cookies: req.cookies,
    }) as any;

    // Get session using Auth.js
    const session = await getSession(expressReq, authConfig);

    if (!session || !session.user) {
      logger.warn({
        msg: "Socket authentication failed: No session",
        hasCookie: !!req.headers?.cookie,
        cookies: req.cookies ? Object.keys(req.cookies) : [],
        sessionTokenPresent: !!req.cookies?.["authjs.session-token"],
      });
      return next(new Error("Authentication required"));
    }

    // Attach user info to socket for later use
    socket.data.userId = session.user.id;
    socket.data.user = session.user;

    logger.info({
      msg: "Socket authenticated",
      userId: session.user.id,
    });

    next();
  } catch (error) {
    logger.error({
      msg: "Socket authentication error",
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    next(new Error("Authentication failed"));
  }
};
