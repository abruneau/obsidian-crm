export const BUTemplate = `---
tags:
  - BU
---

# <%tp.file.title %>

<% await tp.file.move("/CRM/Companies/0 BU/" + tp.file.title) %>

mainOrg::

Parent::
Products::

\`\`\`crm
\`\`\`
`;
