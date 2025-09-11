export const CompanyTemplate = `---
aliases:
tags: 
  - company
title: Company
---

# <% tp.file.title %>

<% await tp.file.move("/CRM/Companies/" + tp.file.title) %>

Parent::

Products::

\`\`\`crm
\`\`\`
`;
