export const OpportunityTemplate = `---
tags:
  - oppy
status: 
sfdc: 
drive: 
mainOrg: 
stage: 
next_deadline:
---
account:: 

\`\`\`dataviewjs
const {DvAccount} = customJS

DvAccount.links({app, dv, context: this})

\`\`\`
## Project

## Meetings

\`\`\`dataview
LIST
FROM #meeting 
WHERE oppy = this.file.link
SORT start_date DESC
\`\`\`

## Tasks

\`\`\`dataview
TASK
FROM #meeting 
WHERE oppy = this.file.link
SORT date DESC
\`\`\`
## Competition 
*What are the alternative solutions the customer is considering?*

\`\`\`dataviewjs
try {

	let meetings = dv.pages("(#meeting)")
	
	.where(p => p.oppy && p.oppy.toString().includes(dv.current().file.name))
	let software = meetings.file.outlinks
	.where(l => l.path.endsWith(".md"))
	.map(l => dv.page(l.path))
	.filter(x => x)
	.where(p => p.tags?.includes('company/competitor'))
	.distinct(p => p.file.name)
	.sort(p => p.file.name)
	
	  
	
	if (software.length) {
		
		dv.list(
			software.file.link
		)

	}

} catch (err) {
	dv.el("p", err)
}
\`\`\`
## Landscape 
*What is the customer technical landscape? (Cloud providers, on-prem, multi-cloud/DC, development languages, …)*

\`\`\`dataviewjs
try {

	let meetings = dv.pages("(#meeting)")
	.where(p => p.oppy && p.oppy.toString().includes(dv.current().file.name))
	
	  
	
	let software = meetings.file.outlinks
	.where(l => l.path.endsWith(".md"))
	.map(l => dv.page(l.path))
	.filter(x => x)
	.where(p => p.tags?.includes('software') || p.tags?.includes('programming_language'))
	.where(p => !p.tags?.includes('company/competitor'))
	.distinct(p => p.file.name)
	.sort(p => p.file.name)

  

	if (software.length) {
		dv.list(
			software.file.link 
		)
	}

} catch (err) {
	dv.el("p", err)
}
\`\`\`

## Unique Differentiators 
*Why is your product (and only it) the best solution?*

## Solution Design 
*What is the proposed architecture in the context of the customer?*

## Technical Champion 
*How is the technical decision made? Who is influencing this decision?*

## Timeline 
*What are the key milestones in the project? Are there compelling events?*

## External threats 
*Who can negatively impact/delay your deal? (teams or individuals, ie. compliance, security, competitor champion, ...)*

## Required Capabilities 
*Based on the Customer pain and use case, what are the mandatory features?*
`;
