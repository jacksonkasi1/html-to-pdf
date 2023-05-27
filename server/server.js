const cors = require("cors");
const nodemailer = require("nodemailer");
const sgTransport = require("nodemailer-sendgrid-transport");

const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");

const { PDFDocument } = require("pdf-lib");
const pdf = require("html-pdf-node");

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_EMAIL = process.env.SENDGRID_EMAIL;
const TO_EMAIL = process.env.TO_EMAIL;

const transporter = nodemailer.createTransport(
  sgTransport({
    auth: {
      api_key: SENDGRID_API_KEY,
    },
  })
);

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    parameterLimit: 100000,
    extended: true,
  })
);

app.options("/send-email", cors());

app.post("/generate-pdf", async (req, res) => {
  const { html } = req.body;

  try {
    const file = { content: html };
    const buffer = await pdf.generatePdf(file, {
      format: "A4",
      encoding: "UTF-8",
      border: "15mm",
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="generated-pdf.pdf"',
      "Content-Length": buffer.length.toString(),
    });

    res.send(buffer);
  } catch (error) {
    console.error("PDF generation failed:", error);
    res.status(500).send("PDF generation failed");
  }
});

app.post("/convert-base64-to-pdf", async (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      throw new Error("No PDF data provided");
    }

    const pdfBuffer = Buffer.from(data, "base64");
    console.log("Received PDF buffer:", pdfBuffer);

    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pdfBytes = await pdfDoc.save();
    console.log("PDF bytes:", pdfBytes);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="generated-pdf.pdf"',
      "Content-Length": pdfBytes.length.toString(),
    });

    res.send(pdfBytes);
  } catch (err) {
    console.error("Error converting to PDF:", err);
    res.status(500).send("Error converting to PDF");
  }
});

app.post("/send-email", async (req, res) => {
  const { data } = req.body;

  try {
    const pdfBuffer = Buffer.from(data, "base64");

    const mailOptions = {
      from: SENDGRID_EMAIL,
      to: TO_EMAIL,
      subject: "Generated PDF",
      text: "Please find the generated PDF attached.",
      attachments: [
        {
          filename: "generated.pdf",
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
    res.status(200).send("Email sent successfully");
  } catch (error) {
    console.error("Email sending failed:", error);
    res.status(500).send("Email sending failed");
  }
});

app.listen(3001, () => {
  console.log("Server is running on http://localhost:3001");
});
