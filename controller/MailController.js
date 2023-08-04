const async = require("async");
const validator = require("validator");
const exelToJson = require("convert-excel-to-json");
const fs = require("fs-extra");
const fss = require("fs");
const json2xls = require("json2xls");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const nodemailer = require("nodemailer");
const deepEmailValidator = require("deep-email-validator");
require("dotenv").config();

exports.index = async (req, res) => {
  try {
    res.render("mail");
  } catch (error) {
    console.log(error);
  }
};

exports.sendEmail = async (req, res) => {
  try {
    // console.log(req.body);
    if (
      !req.body ||
      !req.body.recipients ||
      !req.body.message ||
      !req.body.subject
    ) {
      return res.status(400).json({ status: false, message: `Invalid fields` });
    }

    const { message, subject, recipients } = req.body;

    const inputArray = req.body.recipients
      .split(",")
      .map((email) => email.trim());
    console.log(inputArray);

    const emailArray = recipients
      .split(/\s+/)
      .filter((email) => email.trim() !== "");

    // Join the email array into a single comma-separated string
    const commaSeparatedEmails = emailArray.join(",");

    //   const emailArray = inputArray.map((obj) => obj.recipient);

    //   const emailArray = Array.isArray(inputArray) ? inputArray : [inputArray];
    console.log("emailArray", emailArray);

    const emails = [];
    const emailRegex =
      /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    for (const recipient of emailArray) {
      deepEmailValidator
        .validate(recipient)
        .then((result) => {
           console.log(result);
          if (result.valid) {
            console.log("Valid email address!");
            emails.push({ recipient, message, subject });
            console.log("Details:", result);
          } else {
            console.log("Invalid email address!");
            console.log("Errors:", result);
          }
        })
        .catch((error) => {
          console.error("Error during validation:", error);
        });
   
      // if (
      //   validator.isEmail(recipient) &&
      //   emailRegex.test(recipient) 
      // ) {
      //   emails.push({ recipient, message, subject });
      //   console.log(recipient);
      //   // emails.push({ recipient });
      // }
      // else {
      //   console.error(`Invalid recipient email: ${recipient}`);
      //   return res.status(400).json({ status: false, message: `Invalid recipient email: ${recipient}` });
      // }
    }

    // return res.send(emails);
    // Check if there are any valid recipient emails to send
    if (emails.length === 0) {
      return res
        .status(400)
        .json({ status: false, message: "No valid recipient emails provided" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const sendEmail = (recipient, message, subject) => {
      const mailOptions = {
        from: process.env.EMAIL,
        to: recipient,
        subject: subject,
        text: message,
        html: `
      <p>Dear,</p>
      <p>Are you ready to embark on an exciting journey into the world of cryptocurrency mining? We are thrilled to introduce you to the most advanced and user-friendly Crypto Cloud Mining App that will revolutionize the way you earn and interact with cryptocurrencies!</p>
      <p>Unlock the Potential: ✓ Tap into the unlimited potential of the blockchain revolution. ✓ Harness the power of cloud mining to mine your favorite cryptocurrencies effortlessly. ✓ Watch your earnings grow while you focus on what truly matters to you.<br /><br /><strong>Download Our App:&nbsp;<a href="https://bit.ly/cryptominingapp12" target="_blank" rel="noopener" data-saferedirecturl="https://www.google.com/url?q=https://play.google.com/store/apps/details?id%3Dcom.cloud.mining.rig.crypto.mine.app&amp;source=gmail&amp;ust=1690895508478000&amp;usg=AOvVaw0QrpAQWgrHM9i7sH0V4abz">Click Here</a></strong></p>
      <p>Why Choose Our App?</p>
      <ol>
        <li>
          <p><strong>Seamless Simplicity:</strong>&nbsp;Our app is designed with your convenience in mind. With a user-friendly interface and intuitive controls, you can start mining with just a few taps - no technical expertise is required!</p>
        </li>
        <li>
          <p><strong>Secure and Trustworthy:</strong>&nbsp;Your security is our utmost priority. Rest assured that your investments and earnings are safeguarded by state-of-the-art security protocols and encryption.</p>
        </li>
        <li>
          <p><strong>Maximum Efficiency:</strong>&nbsp;We've optimized our mining algorithms to ensure you get the maximum returns from your investment. Say goodbye to inefficient setups and hello to higher profitability!</p>
        </li>
        <li>
          <p><strong>Transparent Reporting:</strong>&nbsp;Keep track of your mining activities with detailed and transparent reports. We believe in complete transparency, allowing you to monitor your progress and earnings in real-time.</p>
        </li>
        <li>
          <p><strong>24/7 Support:</strong>&nbsp;Our dedicated support team is always ready to assist you with any queries or concerns. We're here to ensure you have a smooth and rewarding mining experience.</p>
        </li>
        <li>
          <p><strong>Eco-Friendly Mining:</strong>&nbsp;We take environmental responsibility seriously. By utilizing renewable energy sources, we aim to contribute to a sustainable future for our planet.</p>
        </li>
      </ol>
      <p>Join the Crypto Revolution: With cryptocurrencies rapidly reshaping the financial landscape, now is the perfect time to become a part of the crypto revolution. Our app allows you to mine popular cryptocurrencies such as Bitcoin, Ethereum, and more, with ease and efficiency.</p>
      <p>How to Get Started: Getting started is as easy as 1-2-3:</p>
      <ol>
        <li>Download our Crypto Cloud Mining App from the App Store or Google Play Store.</li>
        <li>Create your account and choose your preferred mining plan.</li>
        <li>Sit back, relax, and watch your earnings grow!</li>
      </ol>
      <p>To sweeten the deal, we're offering an exclusive limited-time promotion for early adopters like you! Sign up now and receive a bonus in your mining wallet to kickstart your journey with a bang!</p>
      <p>Don't miss out on this incredible opportunity to join the ranks of successful crypto miners worldwide.</p>
      <p>Download our app today and begin your path to financial freedom!</p>
      <p>Happy Mining!</p>
    `,
        // html : { path: '../message.html' }
      };

      return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            reject(error);
          } else {
            resolve(info);
          }
        });
      });
    };

    const sendMultipleEmails = async (emails) => {
      const failedEmails = []; // To store the failed emails
      let totalSentCount = 0;
      let totalFailedCount = 0;
      let sent = [];
      let fail = [];

      try {
        await async.eachLimit(emails, 1, async (email) => {
          const { recipient, message, subject } = email;
          try {
            const info = await sendEmail(recipient, message, subject);
            console.log(`Email sent to ${recipient}: ${info.messageId}`);
            totalSentCount++;
            sent.push(recipient);
          } catch (error) {
            console.error(
              `Error sending email to ${recipient}: ${error.message}`
            );
            failedEmails.push(recipient); // Store the failed recipient email
            totalFailedCount++;
            fail.push(recipient);
          }
        });
        if (failedEmails.length > 0) {
          const data = {
            status: false,
            message: "Some emails failed to send",
            failedEmails: failedEmails,
            totalSentCount: totalSentCount,
            totalFailedCount: totalFailedCount,
            totalSent: sent,
            totalFail: fail,
          };
          return res.status(400).json(data);
        } else {
          const data = {
            status: true,
            message: "All emails sent successfully",
            totalSentCount: totalSentCount,
            totalFailedCount: totalFailedCount,
            totalSent: sent,
            totalFail: fail,
          };
          res.render("mailresponse", data); // Pass the data as the second argument to res.render()
          // return res.status(200).json(data);
        }
      } catch (error) {
        console.error("Error sending emails:", error);
        return res
          .status(500)
          .json({ status: false, message: "Failed to send emails" });
      }
    };

    sendMultipleEmails(emails);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error });
  }
};
