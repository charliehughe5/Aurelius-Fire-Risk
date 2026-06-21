import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for sending real SMTP emails
  app.post("/api/send-email", async (req, res) => {
    const { to, subject, body, smtpSettings } = req.body;

    // Use parameters from request if provided (allows real-time front-end testing of SMTP settings)
    const host = smtpSettings?.host || process.env.SMTP_HOST;
    const port = Number(smtpSettings?.port || process.env.SMTP_PORT || 587);
    const secure = smtpSettings?.secure !== undefined ? smtpSettings.secure : (process.env.SMTP_SECURE === "true");
    const user = smtpSettings?.user || process.env.SMTP_USER;
    const pass = smtpSettings?.pass || process.env.SMTP_PASS;
    const fromAddress = smtpSettings?.from || process.env.SMTP_FROM || user;

    if (!host || !user || !pass) {
      return res.status(400).json({
        success: false,
        error: "SMTP server credentials are not fully configured. Enter your mail settings, save them, and try again."
      });
    }

    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure, // true for 465, false for other ports
        auth: {
          user,
          pass,
        },
        tls: {
          rejectUnauthorized: false // Helps prevent SSL certificate errors with custom/local mail servers
        }
      });

      const info = await transporter.sendMail({
        from: `"Aurelius compliance" <${fromAddress}>`,
        to,
        subject,
        text: body,
        html: body.split("\n").join("<br />"), // simple conversion to preserve spacing
      });

      console.log(`Email successfully dispatched: ${info.messageId}`);
      res.json({ success: true, messageId: info.messageId });
    } catch (err: any) {
      console.error("Email delivery failed:", err);
      res.status(500).json({ success: false, error: err.message || err });
    }
  });

  // Serve static files in production vs live HMR in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Aurelius Server] Running in ${process.env.NODE_ENV || "development"} mode on http://localhost:${PORT}`);
  });
}

startServer();
