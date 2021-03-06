const router = require('express').Router();
const eventsModel = require('../../models/Event.model');
const clubHeadsModel = require('../../models/ClubHead.model')
const nodemailer = require('nodemailer')

// route for rendering the mailing page
router.route('/:id').get((req, res) => {
  const event_id = req.params.id
  eventsModel.findById(event_id)
    .then(event => {
    var date = new Date(event.date);
    date.setDate(date.getDate() + 1);
    if ((new Date())>date){
      req.flash("error",["Event Date has already passed !"])
      return res.redirect('/events/view_all')
    }
      clubHeadsModel.findById(event.owner)
        .then(user => {
          res.render('contact', { alerts: req.flash('error'), event: event, user: user, page_name:'view_events'  })
        }).catch((err) => {
          req.flash("error",err.message)
          res.redirect('/events/view_all')        })
    }).catch((err) => {
      req.flash("error",err.message)
      res.redirect('/events/view_all')    })
})

// route to send the mail to all registered participants
router.route('/push_notification/send/:id').post((req, res) => {

    const event_id = req.params.id
    var mailing_list = []
    var name,contact,email_id
    var eventname

    eventsModel.findById(event_id)
    .then(event=>{
        event.participants.forEach(person => {
          mailing_list.push(person)
        });
        console.log(event)
        eventname = event.name
        clubHeadsModel.findById(event.owner)
        .then(user=>{
          name = user.name
          contact = user.contact
          email_id = user.email_id
          console.log(mailing_list)
          const output = 
          `
          <p>Dear All,</p>
          <h3>Event name: ${eventname}</h3>
          <p>${req.body.message}</p>
            <p>Regards,</p>
            <ul>  
              <li>Name: ${name}</li>
              <li>Email: ${email_id}</li>
              <li>Phone: ${contact}</li>
            </ul>
            <h3>Message</h3>
          `;
          var atc=req.body.file;
     
    
          let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, 
            auth: {
                user: 'Tech.iittp@gmail.com', // club-head email-id to be put here.
                pass: 'Tech.iittp@123'  
            },
            tls:{
              rejectUnauthorized:false
            }
          });
  
    
          let mailOptions = {
              from: 'Tech.iittp@gmail.com', // sender address
              to: `${mailing_list}`, // list of receivers, here I have sent it to only my mail ID, To send the message to all people registered in a event, We can filter the users from the schema based on the event obtained from contact form
              subject: `${req.body.subject}`, // Subject line
              
              html: output, // html body
              attachments: [
                
                { 
                  filename:atc, //For now There is only 1 possible atachments, we can add more if required
                }
              ]
              
          };
  
   
          transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                  return console.log(error);
              }
              console.log('Message sent: %s', info.messageId);   
              console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        
              res.render('message_success', { alerts: req.flash('error')});
          });
              })
          }).catch(err=>{
            req.flash("error",err.message)
            res.redirect('/events/view_all')          })
});

module.exports = router