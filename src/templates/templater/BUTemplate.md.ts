export const BUTemplate = `---
tags:
  - BU
---

# <%tp.file.title %>

<% await tp.file.move("/CRM/Companies/0 BU/" + tp.file.title) %>

mainOrg::

Parent::
Products::

\`\`\`dataviewjs
const {DvAccount2} = customJS
DvAccount2.getAccountInfo({app, dv, context: this})
\`\`\`
`;
