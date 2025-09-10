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

\`\`\`datacoretsx
const { ContactInfo } = await dc.require("Settings/Scripts/Datacore/contact.tsx");

return function View() {

	return <ContactInfo />;
}
\`\`\`

<% await tp.file.move("/CRM/Contacts/" + tp.file.title) %>
`;
