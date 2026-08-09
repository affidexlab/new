# 🤖 HOW TO USE THE AUTO VERIFICATION HELPER SCRIPT

## What Does This Script Do?

The **auto_verifier_helper.py** script automates the tedious parts of your verification work:

✅ **Automatically checks**:
- Age (18-35 range)
- NIN Number (present/missing)
- NIN Picture (link present/missing)
- Determines ELIGIBLE or NOT ELIGIBLE status

⚠️ **You still need to manually**:
- Review passport picture quality (open links and check if selfie or proper)
- Verify the auto-generated results
- Add any additional notes

---

## 🚀 OPTION 1: Use the Script (Semi-Automated)

If you want to save time and let the script do most of the work:

### Step 1: Download the Spreadsheet as CSV

1. Open the Google Spreadsheet: https://docs.google.com/spreadsheets/d/1gPFzZwuaO3nFIC-9mMDhMcmqacNhWrZMAySmi9_73MY/edit
2. Click **File** → **Download** → **Comma Separated Values (.csv, current sheet)**
3. Save it as **`raw_data.csv`** in your downloads folder
4. Move **`raw_data.csv`** to the same folder where you have the **`auto_verifier_helper.py`** script

### Step 2: Run the Script

**On Mac/Linux:**
```bash
python3 auto_verifier_helper.py
```

**On Windows:**
```bash
python auto_verifier_helper.py
```

### Step 3: Review the Output

The script will create **`auto_verified_results.csv`** with:
- All 99 rows (Row 100 down to Row 2)
- Age verification done ✅
- NIN Number verification done ✅
- NIN Picture verification done ✅
- Preliminary ELIGIBLE/NOT ELIGIBLE status ✅
- Passport Picture Quality = "NEEDS MANUAL REVIEW" ⚠️

### Step 4: Manual Review

1. Open **`auto_verified_results.csv`**
2. For each row:
   - **If ELIGIBLE**: Click the passport picture link (from original spreadsheet), check if it's proper or selfie
   - **If NOT ELIGIBLE**: You can skip passport check (they're already disqualified)
3. Update the "Passport Picture Quality" column:
   - Change "NEEDS MANUAL REVIEW" to "PROPER", "SELFIE", or "FLAG"
4. Verify the auto-generated decisions are correct

### Step 5: Transfer to General Workbook

When COO shares the general workbook:
- Copy your verified data from `auto_verified_results.csv` to the general workbook

---

## 🖐️ OPTION 2: Manual Verification (No Script)

If you prefer to do everything manually or don't want to use the script:

1. Use the **`verification_tracker_samuel.csv`** I created for you
2. Follow the **SAMUEL_STEP_BY_STEP_INSTRUCTIONS.md**
3. Manually check each row and fill in your tracker
4. Transfer to general workbook when COO shares it

---

## 🤔 Which Option Should You Choose?

### Choose **OPTION 1 (Script)** if:
- ✅ You're comfortable using Python scripts
- ✅ You want to save time on repetitive checks
- ✅ You still want to review everything but with a head start
- ⏱️ **Time saving**: ~2 hours (script does 60-70% of the work)

### Choose **OPTION 2 (Manual)** if:
- ✅ You prefer full control over every step
- ✅ You're not comfortable with scripts
- ✅ You want to learn the data intimately
- ⏱️ **Time required**: ~3-5 hours (you do 100% of the work)

---

## 📊 Script Output Example

When you run the script, you'll see:

```
==============================================================
🤖 AUTO VERIFICATION HELPER - SAMUEL
==============================================================

📋 Your assignment:
   Rows: 100 down to 2
   Input file: raw_data.csv
   Output file: auto_verified_results.csv

✅ Input file found! Starting verification...

📊 Found 202 total rows in spreadsheet
✅ Your assignment: Rows 100 to 2

==============================================================
✅ AUTO VERIFICATION COMPLETE!
==============================================================
📊 Total rows processed: 99
✅ Eligible (based on Age + NIN only): 45
❌ Not Eligible: 54

📁 Results saved to: auto_verified_results.csv

⚠️ IMPORTANT: You still need to manually:
   1. Review passport picture quality (open links and check)
   2. Mark as PROPER, SELFIE, or FLAG
   3. Verify the auto-generated results

💡 Open the output file and review each entry!
==============================================================

🎯 Next steps:
   1. Open the generated CSV file
   2. Manually review passport picture quality
   3. Verify the eligibility decisions
   4. Transfer final results to COO's general workbook

Good luck! 🚀
```

---

## 🔧 Troubleshooting

### Error: "File 'raw_data.csv' not found"
**Solution**: 
- Make sure you downloaded the spreadsheet as CSV
- Make sure it's named exactly **`raw_data.csv`**
- Make sure it's in the same folder as the script

### Error: "Python not found" or "command not found"
**Solution**:
- Make sure Python is installed: `python3 --version`
- On Windows, try `python` instead of `python3`
- If not installed, download from python.org

### Error: "Column index out of range"
**Solution**:
- The spreadsheet structure might be different than expected
- Check if the CSV has all columns (A through Q)
- You may need to adjust column indices in the script

### Script runs but output looks wrong
**Solution**:
- Open both `raw_data.csv` and `auto_verified_results.csv`
- Manually verify a few rows to check accuracy
- If something is off, fall back to manual verification (Option 2)

---

## 💡 Pro Tips for Using the Script

1. **Always review the output** - The script is a helper, not a replacement for your judgment
2. **Spot-check random rows** - Manually verify 5-10 random rows to ensure script accuracy
3. **Focus your time on passport pictures** - That's the only thing you must do manually
4. **Save the original** - Keep a backup of `auto_verified_results.csv` before making manual edits
5. **Double-check borderline ages** - Script should catch these, but verify ages like 35, 36, 18, 17

---

## ✅ Final Checklist (If Using Script)

- [ ] Downloaded Google Spreadsheet as CSV
- [ ] Saved as `raw_data.csv`
- [ ] Placed in same folder as `auto_verifier_helper.py`
- [ ] Ran the script: `python3 auto_verifier_helper.py`
- [ ] Script completed successfully
- [ ] Opened `auto_verified_results.csv`
- [ ] Manually reviewed passport picture quality for ELIGIBLE candidates
- [ ] Updated "Passport Picture Quality" column
- [ ] Spot-checked 5-10 rows for accuracy
- [ ] Ready to transfer to general workbook!

---

## 🎯 Bottom Line

**The script is OPTIONAL but HELPFUL.**

- **Use it** if you want to save 2+ hours
- **Skip it** if you prefer full manual control

**Either way, you have all the tools you need to succeed!** 🚀
