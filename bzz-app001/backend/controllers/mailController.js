const { getDateTime, UpdateDaysTillDueDate,formatDate, getObject } = require('./utilController')
const sql = require('mssql')
const nodemailer = require('nodemailer')
const RAC_Model = 'RAC'
const NN_Model = 'NN'
const ADR_Model = 'ADR'
const CERT_Model = 'CERT'

const endpoints = {}

const mailer = (to, cc, subject, html) => {

  
    if(process.env.NODE_ENV != 'development') {

    var transporter = nodemailer.createTransport(({
        host: 'smtp-mailrelay.coh.org',
        port: 25, // have tried 465
        requireTLS: true  
      }));

      var mailOptions = {
        from: process.env.SENDER_MAIL,
        to: to,
        cc: cc,
        subject: subject,
        html: html
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
      
    }
}





endpoints.mailer = mailer
module.exports = mailer
