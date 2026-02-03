import { Request, Response, NextFunction } from "express";
import { getSession } from "@auth/express";
import { authConfig } from "../../features/auth/config.js"; // Ensure this path points to your actual config file
import { AppError } from "../errors/AppError.js";

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // getSession reads the cookie and validates the session against your DB/Secret
    const session = await getSession(req, authConfig);

    if (!session || !session.user) {
      return next(
        new AppError("You are not logged in. Please log in to get access.", 401)
      );
    }

    // Attach user to res.locals so controllers can access it
    res.locals.session = session;

    // Optional: If you need the full mongoose ID specifically as a string
    // res.locals.userId = session.user.id;

    next();
  } catch (error) {
    next(error);
  }
};
