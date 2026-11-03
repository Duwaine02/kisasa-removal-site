/**
 * KISASA LEAD CAPTURE → GOOGLE SHEETS
 *
 * Spreadsheet:
 * https://docs.google.com/spreadsheets/d/1akkPRjddyXz-p3wI8-F9wXTLZqFRHPHUP09jWA7cYG0/edit
 *
 * Sheet/tab: Leads
 *
 * IMPORTANT:
 * 1. Open Extensions → Apps Script from the Google Sheet.
 * 2. Paste this entire file into Code.gs.
 * 3. Deploy → New deployment → Web app.
 * 4. Execute as: Me
 * 5. Who has access: Anyone
 * 6. Copy the /exec URL.
 * 7. Put that URL into removal-assessment.html where GOOGLE_SCRIPT_URL is shown.
 */

const SPREADSHEET_ID = "1akkPRjddyXz-p3wI8-F9wXTLZqFRHPHUP09jWA7cYG0";
const SHEET_NAME = "Leads";

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      ok: true,
      service: "Kisasa lead capture",
      sheet: SHEET_NAME
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("No POST data received.");
    }

    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp
      .openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error('Sheet/tab "' + SHEET_NAME + '" was not found.');
    }

    const timestamp = new Date();
    const fullName = cleanValue(data.fullName);
    const email = cleanValue(data.email);
    const phone = cleanValue(data.phone);

    if (!fullName || !email || !phone) {
      throw new Error("Full name, email and phone are required.");
    }

    // Keep these two fields neutral until your actual qualification rules are defined.
    const pipelineStage = "New Lead";
    const qualified = "Review";

    const utmSource = cleanValue(data.utmSource);
    const utmMedium = cleanValue(data.utmMedium);
    const utmCampaign = cleanValue(data.utmCampaign);
    const utmContent = cleanValue(data.utmContent);
    const landingPage = cleanValue(data.landingPage);

    const leadId = createLeadId();
    const answers = cleanAnswers(data.answers, data.questionTitles);
    const leadGrade = "Unassigned";

    // EXACT 14-COLUMN ORDER:
    // A Timestamp
    // B Full Name
    // C Email
    // D Phone
    // E Pipeline Stage
    // F Qualified
    // G UTM Source
    // H UTM Medium
    // I UTM Campaign
    // J UTM Content
    // K Landing Page
    // L Lead ID
    // M Answers
    // N Lead Grade
    sheet.appendRow([
      timestamp,
      fullName,
      email,
      phone,
      pipelineStage,
      qualified,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      landingPage,
      leadId,
      answers,
      leadGrade
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({
        ok: true,
        leadId: leadId
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error(error);

    return ContentService
      .createTextOutput(JSON.stringify({
        ok: false,
        error: String(error.message || error)
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function createLeadId() {
  const now = new Date();
  const tz = Session.getScriptTimeZone() || "Africa/Johannesburg";
  const datePart = Utilities.formatDate(now, tz, "yyyyMMdd");
  const randomPart = Utilities.getUuid().replace(/-/g, "").substring(0, 8).toUpperCase();
  return "KIS-" + datePart + "-" + randomPart;
}

function cleanValue(value) {
  if (value === null || value === undefined) return "";

  let text = String(value).trim();

  // Prevent spreadsheet formula injection while preserving the user's text.
  if (/^[=+\-@]/.test(text)) {
    text = "'" + text;
  }

  return text;
}

function cleanAnswers(answerObject, questionTitles) {
  if (!answerObject || typeof answerObject !== "object") {
    return "";
  }

  const lines = [];
  const keys = Object.keys(answerObject).sort(function(a, b) {
    return Number(a) - Number(b);
  });

  keys.forEach(function(key) {
    const index = Number(key);
    const title =
      questionTitles && questionTitles[index]
        ? questionTitles[index]
        : "Question " + (index + 1);

    const answer = cleanValue(answerObject[key]);
    lines.push("Q" + (index + 1) + ": " + title + " = " + answer);
  });

  // One cell in column M, deliberately not split across spreadsheet columns.
  return lines.join(" | ");
}
