import { Request, Response } from "express";
import ContactModel from "./model.js";
import WaitlistModel from "./waitlist.model.js";
import nodemailer from "nodemailer";
import logger from "../../shared/utils/logger.js";

export const handleContactSubmission = async (req: Request, res: Response) => {
    try {
        const { email, subject, message } = req.body;

        if (!email || !message) {
            return res.status(400).json({ error: true, message: "Email and message are required" });
        }

        // Send Email - No DB Storage for Contact Form as requested
        try {
            const serviceEmail = process.env.SERVICE_EMAIL;
            const servicePassword = process.env.SERVICE_EMAIL_PASSWORD;
            const adminEmail = process.env.ADMIN_EMAIL || "talhayaseen.dev@gmail.com";

            if (serviceEmail && servicePassword) {
                const transporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        user: serviceEmail,
                        pass: servicePassword,
                    },
                });

                await transporter.sendMail({
                    from: `"Mantiq Contact" <${serviceEmail}>`,
                    to: adminEmail,
                    replyTo: email,
                    subject: `[Contact Inquiry] ${subject || "General"}`,
                    html: `<p><strong>From:</strong> ${email}</p><p><strong>Subject:</strong> ${subject}</p><p><strong>Message:</strong></p><p>${message}</p>`,
                    text: `From: ${email}\nSubject: ${subject}\nMessage:\n${message}`,
                });

                logger.info(`Contact form email sent from ${email}`);
            } else {
                logger.warn("Missing email credentials. Contact email not sent.");
            }
        } catch (mailError) {
            logger.error(`Failed to send contact email: ${mailError}`);
            return res.status(500).json({ error: true, message: "Failed to send message. Please try again later." });
        }

        return res.status(201).json({
            error: false,
            message: "Message received successfully",
        });
    } catch (error) {
        console.error("Error submitting contact form:", error);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
};

export const handleWaitlistSubmission = async (req: Request, res: Response) => {
    try {
        const { email, type } = req.body;

        if (!email) {
            return res.status(400).json({ error: true, message: "Email is required" });
        }

        const existingEntry = await WaitlistModel.findOne({ email });

        if (existingEntry) {
            return res.status(400).json({
                error: true,
                message: "This email is already on the waitlist",
            });
        }

        // Save to DB
        const newEntry = new WaitlistModel({
            email,
            type: type || "general",
        });

        await newEntry.save();

        // Send Notification Email
        try {
            const serviceEmail = process.env.SERVICE_EMAIL;
            const servicePassword = process.env.SERVICE_EMAIL_PASSWORD;
            const adminEmail = process.env.ADMIN_EMAIL || "talhayaseen.dev@gmail.com";

            if (serviceEmail && servicePassword) {
                const transporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        user: serviceEmail,
                        pass: servicePassword,
                    },
                });

                await transporter.sendMail({
                    from: `"Mantiq Waitlist" <${serviceEmail}>`,
                    to: adminEmail,
                    subject: `[Waitlist Signup] New ${type || "general"} signup`,
                    html: `<p><strong>New Signup:</strong> ${email}</p><p><strong>Type:</strong> ${type}</p>`,
                    text: `New Signup: ${email}\nType: ${type}`,
                });

                logger.info(`Waitlist notification email sent for ${email}`);
            }
        } catch (mailError) {
            logger.error(`Failed to send waitlist notification: ${mailError}`);
            // Continue since DB save was successful
        }

        return res.status(201).json({
            error: false,
            message: "Added to waitlist successfully",
        });
    } catch (error) {
        console.error("Error submitting to waitlist:", error);
        return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
};
