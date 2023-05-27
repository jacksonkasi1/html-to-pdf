/**
 * @see https://www.nicesnippets.com/blog/how-to-convert-base64-to-pdf-in-nodejs
 * @see https://www.freecodecamp.org/news/save-a-base64-string-as-pdf-on-client-side-in-javascript/
 */

const cors = require("cors");
const nodemailer = require("nodemailer");
const sgTransport = require("nodemailer-sendgrid-transport");

const fs = require("fs");
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

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

app.get("/", async (req, res) => {
  res.status(200).send("HTML to PDF converter");
});

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

    // Remove prefix from Base64 string
    const base64Data = data.replace(/^data:application\/pdf;base64,/, "");

    // Decode Base64 to buffer
    const pdfBuffer = Buffer.from(base64Data, "base64");

    // Save PDF buffer to file
    // fs.writeFile("generated-pdf.pdf", pdfBuffer, (err) => {
    //   if (err) {
    //     console.error("Error saving PDF:", err);
    //     res.status(500).send("Error saving PDF");
    //     return;
    //   }

    //   console.log("PDF file saved successfully.");

    //   // Set response headers for file download
    //   res.set({
    //     "Content-Type": "application/pdf",
    //     "Content-Disposition": 'attachment; filename="generated-pdf.pdf"',
    //     "Content-Length": pdfBuffer.length.toString(),
    //   });

    //   // Send the PDF file to the client
    //   res.send(pdfBuffer);
    // });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="generated-pdf.pdf"',
      "Content-Length": pdfBuffer.length.toString(),
    });

    res.send(pdfBytes);
  } catch (err) {
    console.error("Error converting to PDF:", err);
    res.status(500).send("Error converting to PDF");
  }
});

app.post("/send-email", async (req, res) => {
  const { data } = req.body;

  if (!data) {
    throw new Error("No PDF data provided");
  }

  // Remove prefix from Base64 string
  const base64Data = data.replace(/^data:application\/pdf;base64,/, "");

  // Decode Base64 to buffer
  const pdfBuffer = Buffer.from(base64Data, "base64");

  try {
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
