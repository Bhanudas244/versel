const express = require('express');
const router = express.Router()
const MailController = require('../controller/MailController');





router.get('/', MailController.index);
router.post('/sendEmails', MailController.sendEmail);




module.exports = router