document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('#compose-form').onsubmit = process_form;


  // By default, load the inbox
  load_mailbox('inbox');

});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Request the server for the mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    console.log(emails);

    // Each email shouldbe rendered in its own box (e.g. as a <div> with a border) that displays who the email is from, what the subject line is, and the timestamp of the email.
    emails.forEach(email => {
      const mail_row = document.createElement('div');
      mail_row.className = 'row border rounded my-2';
      // If the email is unread => white background. If read => gray background
      if (email.read === true) {
        mail_row.classList.add('bg-secondary-subtle');
      } else {
        mail_row.classList.add('bg-light');
      }

      const mail_sender = document.createElement('div');
      mail_sender.className = 'col-4 p-2';
      mail_sender.innerHTML = `From: ${email.sender}`;

      const mail_subject = document.createElement('div');
      mail_subject.className = 'col-4 p-2 border-left border-right';
      mail_subject.innerHTML = `Subject: ${email.subject}`;

      const mail_time = document.createElement('div');
      mail_time.className = 'col-4  p-2';
      mail_time.innerHTML = `${email.timestamp}`;

      mail_row.appendChild(mail_sender);
      mail_row.appendChild(mail_subject);
      mail_row.appendChild(mail_time);

      document.querySelector('#emails-view').append(mail_row);
    });

    
});
}

function process_form() {  
  // Get inputs form the form
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  // Make a POST request to the server
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  // Check the response
  .then(result => {
    console.log(result);
    // If there is an error response, show the error message in the input's placeholder
    if (result.error) {
      let error_field = document.querySelector('#compose-recipients');
      error_field.value = '';
      error_field.placeholder = result.error;
    } else {
      load_mailbox('sent');
    }
  });

  return false;
}