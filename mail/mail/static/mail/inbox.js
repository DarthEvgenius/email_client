document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Send a new mail via form 'compose-form'
  document.querySelector('#compose-form').onsubmit = process_form;

  // By default, load the inbox
  load_mailbox('inbox');

});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Request the server for the mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Each email shouldbe rendered in its own box (e.g. as a <div> with a border) that displays who the email is from, what the subject line is, and the timestamp of the email.
    emails.forEach(email => {
      
      // Create a row for each email
      const mail_row = document.createElement('div');
      mail_row.className = 'row my-2';

      mail_row_event = document.createElement('div');

      // Render for sent rows without archive buttons
      if (mailbox === 'sent') {
        mail_row_event.className = 'row col-12 mr-2 border rounded';
      } else {
        mail_row_event.className = 'row col-11 mr-2 border rounded';
      };
      
      mail_row_event.style.cursor = 'pointer';

      // If the email is unread => white background. If read => gray background
      if (email.read === true) {
        mail_row_event.classList.add('bg-secondary', 'text-white');
      } else {
        mail_row_event.classList.add('bg-light');
      }

      // Add an event listener to view this email
      mail_row_event.addEventListener('click', () => {
        show_email(email.id);
      });

      const mail_sender = document.createElement('div');
      mail_sender.className = 'col-4 p-2';
      mail_sender.innerHTML = `From: ${email.sender}`;

      const mail_subject = document.createElement('div');
      mail_subject.className = 'col-4 p-2 border-left border-right';
      mail_subject.innerHTML = `Subject: ${email.subject}`;

      const mail_time = document.createElement('div');
      mail_time.className = 'col-3  p-2';
      mail_time.innerHTML = `${email.timestamp}`;

      // Archive button
      const archive = document.createElement('div');
      archive.className = 'col-1 py-2';
      const archive_button = document.createElement('button');
      archive_button.className = 'btn btn-sm btn-outline-primary bg-light';

      // If it's inbox mail
      if (mailbox === 'inbox') {
        archive_button.innerHTML = 'Archive';
        archive_button.onclick = () => {
          console.log(`${email.id} archived`);
          fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: true
            })
          });
          console.log(this);
          load_mailbox('inbox');
        }
      } 
      else if (mailbox === 'archive') {
        archive_button.innerHTML = 'Unarchive';
        archive_button.onclick = () => {
          console.log(`${email.id} unarchived`);
          fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: false
            })
          });
          load_mailbox('inbox');
        }
      }
      
      archive.appendChild(archive_button);

      mail_row_event.appendChild(mail_sender);
      mail_row_event.appendChild(mail_subject);
      mail_row_event.appendChild(mail_time);
      
      mail_row.appendChild(mail_row_event);

      // Append archive button only in inbox mail
      if (mailbox != 'sent'){
        mail_row.appendChild(archive);
      }

      document.querySelector('#emails-view').append(mail_row);
    });

    
});
}

function process_form() {  
  // Sendd a new email

  // Get inputs form the form
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  // Make a POST request to the server with email's data
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

function show_email(email_id) {
  // Show the email's details

  // Show the email and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Make a GET request for the email to the API (/emails/id)
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    const email_div = document.querySelector('#email');
    // Error check
    if (email.error) {
      email_div.classList.add('text-danger');
      email_div.innerHTML = `${email.error}`;
    } else {
      // Clear the section
      email_div.innerHTML = '';

      // Mail's subject
      const mail_subject = document.createElement('h2');
      mail_subject.className = 'text-center';
      mail_subject.innerHTML = email.subject;

      // Mail's sender and time row
      const mail_sent = document.createElement('div');
      mail_sent.className = 'row border-bottom';
      // Sender
      const mail_sender = document.createElement('div');
      mail_sender.className = 'col-6 p-0';
      mail_sender.innerHTML = `From: ${email.sender}`;
      // Time
      const mail_time = document.createElement('div');
      mail_time.className = 'col-6 text-right';
      mail_time.innerHTML = email.timestamp;
      // Make the row
      mail_sent.appendChild(mail_sender);
      mail_sent.appendChild(mail_time);

      // Mail's recipients
      const mail_to = document.createElement('div');
      mail_to.className = 'border-bottom row mt-2';
      mail_to.innerHTML = `To: ${email.recipients}`;

      // Mail's body
      const mail_body = document.createElement('div');
      mail_body.className = 'mt-3 p-3 bg-light';
      mail_body.innerHTML = email.body;

      // Append and view all content
      email_div.append(mail_subject);
      email_div.append(mail_sent);
      email_div.append(mail_to);
      email_div.append(mail_body);
    }
  });

  // Change 'read' to 'true' via PUT request to the API
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  });
}

function email_archived(email_id) {
  // Match email as archived/not archived

  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  });
}