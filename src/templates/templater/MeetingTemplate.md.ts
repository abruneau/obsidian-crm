export const MeetingTemplate = `---
aliases: 
date_created: <% tp.file.creation_date() %>
start_date: <% tp.file.creation_date("YYYY-MM-DD HH:mm") %>
end_date: <% tp.file.creation_date("YYYY-MM-DD HH:mm") %>
tags:
  - meeting
title: Meeting Note
Activity:
---

account::

oppy::

Attendees::

- name

<%*

let qcFileName = await tp.system.prompt("Meeting Title")

if (qcFileName != ""){

  titleName = qcFileName

} else {

  titleName = tp.file.title

}

titleName = titleName.replace("/", "").replace(":", "").replace("|", "").replace("&", "and")

finalName = tp.file.creation_date("YYYY-MM-DD") + "-" + titleName

await tp.file.rename(finalName)

await tp.file.move("/CRM/Interactions/" + finalName)

tR += "# " + titleName

%>`;
