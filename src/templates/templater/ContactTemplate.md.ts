export const ContactTemplate = `---
date_created: <% tp.file.creation_date() %>
tags:
  - contacts
---

# <% tp.file.title %>

Company:: <% tp.file.cursor(1) %>
Team::
Role::
Email::
Phone::
Linkedin::
Manager::
Location::

\`\`\`crm
\`\`\`

<% await tp.file.move("/CRM/Contacts/" + tp.file.title) %>
`;
