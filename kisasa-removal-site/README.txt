KISASA DEBT REVIEW REMOVAL SITE + GOOGLE SHEETS LEAD CAPTURE
============================================================

FLOW
----
index.html (front page, ads land here)
  -> "Check if I qualify" buttons
  -> removal-assessment.html (six questions + contact form)
  -> Google Apps Script web app (Code.gs)
  -> Google Sheet, tab "Leads"

FILES
-----
1. index.html
   Front page. Every button links to removal-assessment.html.

2. removal-assessment.html
   The six-question check. Sends completed assessments to Google Sheets.
   This is the ONLY page that needs the Google Apps Script URL.

3. kisasa-tracking.js
   Loaded by BOTH pages. Keeps the UTM tags and the real landing page
   (index.html) when a visitor clicks through to the assessment.

4. Code.gs
   Google Apps Script that writes leads into your Google Sheet.

5. kisasa-logo.png  (NOT included in this zip)
   Both pages expect this file in the same folder. Add your logo here.

KEEP ALL FILES IN THE SAME FOLDER when you upload the site.

GOOGLE SHEET
------------
Spreadsheet ID:
1akkPRjddyXz-p3wI8-F9wXTLZqFRHPHUP09jWA7cYG0

Tab:
Leads

EXACT COLUMN ORDER
------------------
A  Timestamp
B  Full Name
C  Email
D  Phone
E  Pipeline Stage
F  Qualified
G  UTM Source
H  UTM Medium
I  UTM Campaign
J  UTM Content
K  Landing Page
L  Lead ID
M  Answers
N  Lead Grade

GOOGLE APPS SCRIPT SETUP
------------------------
1. Open your Google Sheet.
2. Click Extensions.
3. Click Apps Script.
4. Delete the existing Code.gs contents.
5. Paste the contents of Code.gs from this package.
6. Click Save.
7. Click Deploy -> New deployment.
8. Select type: Web app.
9. Execute as: Me.
10. Who has access: Anyone.
11. Click Deploy.
12. Authorize the script if Google asks.
13. Copy the Web app URL ending in /exec.

CONNECT THE WEBSITE
-------------------
Open removal-assessment.html (NOT index.html).

Find:

const GOOGLE_SCRIPT_URL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_EXEC_URL_HERE";

Replace the placeholder with the /exec URL you copied.

Example:

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/XXXXXXXXXXXX/exec";

SAVE THE HTML.

IMPORTANT
---------
Do NOT paste the normal Google Sheet URL into GOOGLE_SCRIPT_URL.

The website needs the Google Apps Script Web App /exec URL.

If you change Code.gs later, you must Deploy -> Manage deployments ->
edit the deployment -> New version, otherwise the live URL keeps running
the old code.

TEST
----
Use a test name, email and phone number on the assessment.

After submitting, open the Leads tab.

A new row should appear with exactly 14 populated columns.

UTM + LANDING PAGE TEST
-----------------------
Open the FRONT page with tags on the URL:

index.html?utm_source=facebook&utm_medium=paid&utm_campaign=debt-removal&utm_content=ad-01

Click "Check if I qualify for removal", finish the check and submit.

The sheet should receive:

UTM Source   = facebook
UTM Medium   = paid
UTM Campaign = debt-removal
UTM Content  = ad-01
Landing Page = index.html

Point your Meta ads at index.html with the UTM tags on the URL.
Ads that point straight at removal-assessment.html also work.

QUALIFIED / LEAD GRADE
----------------------
The current setup deliberately uses:

Pipeline Stage = New Lead
Qualified = Review
Lead Grade = Unassigned

This is because the supplied HTML does not contain a legally defined qualification
algorithm. Once you provide the rules you want to use, those fields can be
calculated automatically from the six answers.

ANSWERS
-------
All six answers are kept inside column M (Answers) as one clean cell.

Example:

Q1: WHY DO YOU WANT TO BE REMOVED FROM DEBT REVIEW? = I have paid all my debt |
Q2: HAVE YOU PAID ALL THE ACCOUNTS THAT WERE INCLUDED IN YOUR DEBT REVIEW? = Yes |
Q3: DO YOU HAVE A HOME LOAN IN YOUR DEBT REVIEW? = No |
Q4: ARE YOU CURRENTLY EMPLOYED OR EARNING A REGULAR INCOME? = Full-time |
Q5: IS THERE A DEBT REVIEW COURT ORDER OR NCT MATTER ALREADY IN PLACE AGAINST YOU? = No |
Q6: WHICH OF THESE BEST DESCRIBES WHERE YOU ARE RIGHT NOW? = I can now afford my repayments on my own

This prevents the answers from spilling into additional Google Sheet columns.
