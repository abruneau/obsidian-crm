export const CompanyTemplate = `---
aliases:
tags: 
  - company
title: Company
---

# <% tp.file.title %>

<% await tp.file.move("/CRM/Companies/" + tp.file.title) %>

mainOrg::

Parent::

Products::

\`\`\`dataviewjs
const {DvAccount2} = customJS
DvAccount2.getAccountInfo({app, dv, context: this})
\`\`\`
`;
