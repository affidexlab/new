# SAMUEL - STEP-BY-STEP VERIFICATION INSTRUCTIONS

## 🎯 YOUR MISSION
Verify 99 training prospects from **Row 100 down to Row 2** in the Google Spreadsheet.

## 📋 WHAT YOU NEED
1. ✅ Google Spreadsheet: https://docs.google.com/spreadsheets/d/1gPFzZwuaO3nFIC-9mMDhMcmqacNhWrZMAySmi9_73MY/edit
2. ✅ Verification Tracker: `verification_tracker_samuel.csv` (created for you)
3. ✅ This instruction guide

---

## 🚀 QUICK START GUIDE

### STEP 1: Open Your Tools
1. Open the Google Spreadsheet in one browser tab/window
2. Open the verification tracker CSV in Google Sheets or Excel in another window
3. Position them side-by-side on your screen

### STEP 2: Navigate to Your Starting Point (Row 100)
1. In the Google Spreadsheet, click on the **Name Box** (shows cell address like "A2")
2. Type: `A100`
3. Press Enter
4. You're now at Row 100 - this is your starting point

### STEP 3: Verify Each Row

For **EACH ROW** from 100 down to 2, do the following:

#### A. COLLECT BASIC INFO
- Copy **Surname** (Column B) → Put in your tracker
- Copy **First Name** (Column C) → Put in your tracker
- Copy **Age** (Column F) → Put in your tracker

#### B. CHECK AGE (Column F)
**Question**: Is the age between 18 and 35 (inclusive)?
- If YES (18-35) → Write "PASS" in tracker
- If NO (below 18 or above 35) → Write "FAIL" in tracker
- If EMPTY → Write "FAIL" in tracker

#### C. CHECK NIN NUMBER (Column P)
1. Scroll right to Column P in the spreadsheet
2. **Question**: Is there an 11-digit NIN number?
   - If YES (number present) → Write "YES" in tracker
   - If NO (empty or incomplete) → Write "NO" in tracker

#### D. CHECK NIN PICTURE (Column O - "Valid ID card (picture)")
1. Look at Column O
2. **Question**: Is there a Google Drive link (blue hyperlink)?
   - If YES (link present) → Write "YES" in tracker
   - If NO (empty or no link) → Write "NO" in tracker

#### E. CHECK PASSPORT PICTURE QUALITY (Column Q)
1. Look at Column Q ("Passport picture")
2. **Click the Google Drive link** to open and view the image
3. **Question**: Is this a proper passport photo or a selfie?
   - **PROPER**: Professional photo, plain background, formal
   - **SELFIE**: Casual photo, taken with phone, informal background
   - **FLAG**: Unclear or questionable
4. Write your assessment in tracker

#### F. DETERMINE ELIGIBILITY
**ELIGIBLE** if ALL of the following are TRUE:
- ✅ Age is 18-35 (PASS)
- ✅ NIN Number is present (YES)
- ✅ NIN Picture is present (YES)

**NOT ELIGIBLE** if ANY of the following are FALSE:
- ❌ Age is NOT 18-35 → Reason: "Age out of range"
- ❌ NIN Number is missing → Reason: "No NIN Number"
- ❌ NIN Picture is missing → Reason: "No NIN Picture"
- ❌ Multiple issues → Reason: "Age + No NIN" (or whatever combination)

#### G. RECORD IN TRACKER
In your verification tracker CSV:
1. Fill in all the columns for that row
2. Mark **ELIGIBILITY STATUS**: "ELIGIBLE" or "NOT ELIGIBLE"
3. If NOT ELIGIBLE, write the **Reason**
4. Add any **Notes** if needed

### STEP 4: Move to Next Row
1. In the Google Spreadsheet, press **Up Arrow** key (to go from Row 100 → 99 → 98, etc.)
2. Repeat Step 3 for the new row
3. Continue until you reach **Row 2** (your last row)

---

## 📊 COLUMN REFERENCE (Quick Guide)

| Column | Field Name | What to Check |
|--------|-----------|---------------|
| **A** | Timestamp | (Reference only) |
| **B** | Surname | Copy to tracker |
| **C** | First Name | Copy to tracker |
| **F** | **Age** | Must be 18-35 ⭐ |
| **O** | **Valid ID card (NIN Picture)** | Must have link ⭐ |
| **P** | **NIN Number** | Must be filled ⭐ |
| **Q** | **Passport picture** | Check quality (Flag selfies) ⚠️ |

---

## ✅ DECISION FLOWCHART

```
START: Check Row
    ↓
Is Age 18-35?
    ↓ NO → NOT ELIGIBLE (Age)
    ↓ YES
Has NIN Number?
    ↓ NO → NOT ELIGIBLE (No NIN Number)
    ↓ YES
Has NIN Picture Link?
    ↓ NO → NOT ELIGIBLE (No NIN Picture)
    ↓ YES
    → ELIGIBLE ✅
    ↓
Check Passport Photo Quality (Flag if selfie)
    ↓
RECORD IN TRACKER
    ↓
MOVE TO NEXT ROW (going backwards: 100→99→98...→2)
```

---

## 💡 TIPS FOR EFFICIENCY

### Time-Saving Tips:
1. **Don't overthink** - If age is 36, it's automatically NOT ELIGIBLE
2. **Copy-paste** names from spreadsheet to tracker
3. **Use keyboard shortcuts**:
   - `Ctrl+C` = Copy
   - `Ctrl+V` = Paste
   - `Arrow Keys` = Navigate between rows
   - `Ctrl+Home` = Go to top
   - `Ctrl+End` = Go to bottom

### Picture Verification Tips:
- **NIN Picture (Column O)**: Just check if link exists - don't need to open every one
- **Passport Picture (Column Q)**: Open to check quality
- **Selfie indicators**: Background shows room/outdoors, casual pose, phone in hand visible
- **Proper passport**: Plain background (white/blue), formal pose, shoulders visible

### Track Your Progress:
- Set mini-goals: "I'll complete 10 rows every 30 minutes"
- Take a 5-minute break after every 25 rows
- You have **99 rows total** to complete

---

## 🚨 COMMON SCENARIOS

### Scenario 1: Age is 35
- **Decision**: PASS ✅ (35 is included in 18-35 range)

### Scenario 2: Age is 36
- **Decision**: FAIL ❌ (Above 35)

### Scenario 3: Has NIN Number but no NIN Picture
- **Decision**: NOT ELIGIBLE ❌
- **Reason**: "No NIN Picture"

### Scenario 4: Everything is perfect but passport is a selfie
- **Decision**: ELIGIBLE ✅
- **Note**: Flag passport as "SELFIE" in tracker
- (Selfies are flagged but don't disqualify - COO will review)

### Scenario 5: Multiple missing fields (No age, no NIN, no picture)
- **Decision**: NOT ELIGIBLE ❌
- **Reason**: "Multiple issues - No age, No NIN, No NIN Picture"

---

## 📝 EXAMPLE - HOW TO FILL YOUR TRACKER

Let's say Row 85 has:
- Surname: Adebayo
- First Name: Chioma
- Age: 28
- NIN Number: 12345678901
- NIN Picture: (Google Drive link present)
- Passport Picture: (Link present, you opened it and it's a proper photo)

**Your tracker entry:**
| Row # | Surname | First Name | Age | Age Check | NIN # | NIN Pic | Status | Reason | Passport | Notes |
|-------|---------|------------|-----|-----------|-------|---------|---------|--------|----------|-------|
| 85 | Adebayo | Chioma | 28 | PASS | YES | YES | ELIGIBLE | - | PROPER | Good candidate |

---

## ⏱️ TIME ESTIMATE

- **Average time per row**: 2-3 minutes
- **Total rows**: 99
- **Estimated total time**: 3-5 hours (with breaks)
- **Recommended approach**: Break it into 2-3 sessions

---

## ✅ BEFORE YOU SUBMIT

1. Double-check you've covered **Row 100 down to Row 2** (99 rows total)
2. Verify your tracker has all rows filled
3. Count how many are ELIGIBLE vs NOT ELIGIBLE
4. Make sure "Reason" is filled for all NOT ELIGIBLE entries
5. Save your verification tracker

---

## 🆘 TROUBLESHOOTING

**Problem**: Can't see Column O or P
- **Solution**: Scroll right in the spreadsheet (use horizontal scrollbar or arrow keys)

**Problem**: Google Drive links won't open
- **Solution**: Make sure you're logged into the correct Google account. Ask COO for access if needed.

**Problem**: Not sure if photo is a selfie or proper passport
- **Solution**: 
  - If in doubt, mark as "FLAG" and add note
  - COO will review flagged items

**Problem**: Row has completely empty data
- **Solution**: Mark as NOT ELIGIBLE, Reason: "No data provided"

---

## 📞 WHEN YOU'RE DONE

1. **Save your verification tracker** (CSV or Google Sheets)
2. **Wait for COO** to share the general workbook
3. **Transfer your data** from your offline tracker to the general workbook
4. **Report to COO** with summary:
   - Total rows verified: 99
   - Eligible: [your count]
   - Not Eligible: [your count]
   - Flagged for review: [your count]

---

## 🎯 YOU'VE GOT THIS!

Remember:
- ✅ You're checking **99 rows** (Row 100 → Row 2)
- ✅ Your coworker Eseosa is doing Row 2 → Row 100 (you'll meet in the middle!)
- ✅ Focus on the 2 main criteria: Age (18-35) + NIN (number + picture)
- ✅ Take breaks, stay organized, and work systematically

**Good luck, Samuel! 🚀**
