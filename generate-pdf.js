const { jsPDF } = require("jspdf");
const fs = require("fs");

const doc = new jsPDF();
const pageWidth = doc.internal.pageSize.getWidth();
const margin = 20;
const maxLineWidth = pageWidth - margin * 2;
let yPos = 20;

function addWrappedText(text, fontSize = 12, isBold = false) {
  doc.setFontSize(fontSize);
  doc.setFont("helvetica", isBold ? "bold" : "normal");
  
  const lines = doc.splitTextToSize(text, maxLineWidth);
  for (let line of lines) {
    if (yPos > 280) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(line, margin, yPos);
    yPos += fontSize * 0.5; // line height spacing
  }
  yPos += 4; // paragraph spacing
}

addWrappedText("Session Key Updates & Summary", 18, true);
yPos += 5;

const updates = [
  {
    title: "1. Image to SVG Conversion & Application",
    details: "Converted a requested image to SVG format and successfully applied the changes.",
    why: "SVG provides a scalable, resolution-independent vector format ensuring the image appears crisp on all devices without loss of quality.",
    summary: "Image asset updated to SVG format."
  },
  {
    title: "2. Employee Profile - Incidences Section",
    details: "Created a new 'Incidences' section in the employee profile. This allows workers to log pre-approved permissions (late arrivals, leaving early, extra hours, special medical/childcare requests).",
    why: "To provide a streamlined way for employees to report and track specific exceptions and permissions within their attendance records.",
    summary: "Added Incidences submission capability for employees."
  },
  {
    title: "3. Extra Hours Worked - Numerical Slider",
    details: "Added a numerical sliding bar to specifically input the amount of extra hours worked in the Incidences section. Fixed an accuracy issue where the slider value wasn't capturing precisely.",
    why: "To give employees an intuitive, accurate, and error-free UI for logging precise extra hour values.",
    summary: "Implemented and refined a numeric slider for logging extra hours."
  },
  {
    title: "4. Admin Dashboard - Incidences Management",
    details: "Updated the Admin portal to display newly created incidences next to 'Clocked Out'. Created an action section between Reports and Records allowing admins to Authorize or Reject worker incidences.",
    why: "Admins needed a direct way to view pending worker requests and take immediate action on them (authorize/deny) from the dashboard.",
    summary: "Added Incidence management, authorization actions, and visibility for Administrators."
  },
  {
    title: "5. Report Generation - Incidences Included",
    details: "Updated the Admin 'Generate Report' functionality to include the total number of incidences and their authorization status (authorized vs. unauthorized).",
    why: "To ensure that payroll or management reports accurately reflect exceptions, special permissions, and extra hours authorized by administrators.",
    summary: "Reports now include incidence totals and authorization statuses."
  },
  {
    title: "6. Application Theme - Light Mode Implementation",
    details: "Implemented a professional, natural-looking Light Theme with neutral colors and high contrasts across the entire application (Admin, Employee, and Login/Register profiles).",
    why: "To improve accessibility, readability, and user experience for users who prefer or require a light interface, ensuring a premium aesthetic.",
    summary: "Complete Light mode styling implemented application-wide."
  },
  {
    title: "7. Theme Toggle Button",
    details: "Added a global toggle button positioned at the lower right corner with Sun and Moon icons to switch between Light and Dark modes. Adjusted contrast and fixed an alignment issue where the Sun icon wasn't perfectly centered in light mode.",
    why: "To give users an easily accessible, persistent, and visually polished way to switch their theme preference on any screen.",
    summary: "Added and perfected a floating Theme Toggle component."
  },
  {
    title: "8. React Hydration Mismatch Resolution",
    details: "Fixed a Hydration mismatch error in the RootLayout by adding suppressHydrationWarning to the HTML tag.",
    why: "The client-side theme script was mutating the HTML class before React hydrated, causing a mismatch between the server-rendered HTML and client properties. This fix instructs React to safely ignore the attribute discrepancy.",
    summary: "Eliminated console hydration errors caused by the theme provider."
  }
];

updates.forEach(u => {
  addWrappedText(u.title, 14, true);
  addWrappedText("Details: " + u.details, 11, false);
  addWrappedText("Why: " + u.why, 11, false);
  addWrappedText("Summary: " + u.summary, 11, true);
  yPos += 5;
});

const pdfData = doc.output('arraybuffer');
fs.writeFileSync("Session_Key_Updates.pdf", Buffer.from(pdfData));
console.log("PDF generated successfully.");
