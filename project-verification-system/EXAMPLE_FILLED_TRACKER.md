# 📋 EXAMPLE: How to Fill Your Verification Tracker

## Sample Entries (How Your Tracker Should Look When Filled)

### Example 1: ELIGIBLE Candidate ✅

**From Google Spreadsheet Row 100:**
- Surname: Okonkwo
- First Name: Chidi
- Age: 28
- NIN Number: 12345678901 (present)
- NIN Picture: https://drive.google.com/... (link present)
- Passport Picture: https://drive.google.com/... (opened it - proper professional photo)

**Your tracker entry:**
```
Row #: 100
Surname: Okonkwo
First Name: Chidi
Age: 28
Age Check (18-35): PASS
NIN Number Present: YES
NIN Picture Present: YES
ELIGIBILITY STATUS: ELIGIBLE
Reason if Not Eligible: (leave blank)
Passport Picture Quality: PROPER
Notes: Good candidate
```

---

### Example 2: NOT ELIGIBLE - Age Issue ❌

**From Google Spreadsheet Row 99:**
- Surname: Adeyemi
- First Name: Folake
- Age: 42
- NIN Number: 98765432109 (present)
- NIN Picture: https://drive.google.com/... (link present)
- Passport Picture: https://drive.google.com/... (link present)

**Your tracker entry:**
```
Row #: 99
Surname: Adeyemi
First Name: Folake
Age: 42
Age Check (18-35): FAIL
NIN Number Present: YES
NIN Picture Present: YES
ELIGIBILITY STATUS: NOT ELIGIBLE
Reason if Not Eligible: Age out of range (42 years old)
Passport Picture Quality: PROPER
Notes: Has all documents but exceeds age limit
```

---

### Example 3: NOT ELIGIBLE - Missing NIN Picture ❌

**From Google Spreadsheet Row 98:**
- Surname: Bello
- First Name: Aminu
- Age: 24
- NIN Number: 11122233344 (present)
- NIN Picture: (empty - no link)
- Passport Picture: https://drive.google.com/... (link present)

**Your tracker entry:**
```
Row #: 98
Surname: Bello
First Name: Aminu
Age: 24
Age Check (18-35): PASS
NIN Number Present: YES
NIN Picture Present: NO
ELIGIBILITY STATUS: NOT ELIGIBLE
Reason if Not Eligible: No NIN Picture
Passport Picture Quality: PROPER
Notes: Need to upload NIN picture
```

---

### Example 4: ELIGIBLE but Selfie Flagged ✅⚠️

**From Google Spreadsheet Row 97:**
- Surname: Ibrahim
- First Name: Aisha
- Age: 22
- NIN Number: 55566677788 (present)
- NIN Picture: https://drive.google.com/... (link present)
- Passport Picture: https://drive.google.com/... (opened it - it's a selfie!)

**Your tracker entry:**
```
Row #: 97
Surname: Ibrahim
First Name: Aisha
Age: 22
Age Check (18-35): PASS
NIN Number Present: YES
NIN Picture Present: YES
ELIGIBILITY STATUS: ELIGIBLE
Reason if Not Eligible: (leave blank - she IS eligible)
Passport Picture Quality: SELFIE - FLAG
Notes: Eligible but passport photo is a selfie, flag for COO review
```

---

### Example 5: NOT ELIGIBLE - Multiple Issues ❌

**From Google Spreadsheet Row 96:**
- Surname: Musa
- First Name: Yusuf
- Age: (empty)
- NIN Number: (empty)
- NIN Picture: (empty)
- Passport Picture: (empty)

**Your tracker entry:**
```
Row #: 96
Surname: Musa
First Name: Yusuf
Age: (blank)
Age Check (18-35): FAIL
NIN Number Present: NO
NIN Picture Present: NO
ELIGIBILITY STATUS: NOT ELIGIBLE
Reason if Not Eligible: Multiple issues - No age, No NIN number, No NIN picture
Passport Picture Quality: MISSING
Notes: Incomplete application
```

---

### Example 6: NOT ELIGIBLE - No NIN Number ❌

**From Google Spreadsheet Row 95:**
- Surname: Okoro
- First Name: Ngozi
- Age: 30
- NIN Number: (empty)
- NIN Picture: https://drive.google.com/... (link present - but doesn't matter if no number)
- Passport Picture: https://drive.google.com/... (link present)

**Your tracker entry:**
```
Row #: 95
Surname: Okoro
First Name: Ngozi
Age: 30
Age Check (18-35): PASS
NIN Number Present: NO
NIN Picture Present: YES
ELIGIBILITY STATUS: NOT ELIGIBLE
Reason if Not Eligible: No NIN Number
Passport Picture Quality: PROPER
Notes: Has NIN picture but no number filled in the form
```

---

### Example 7: ELIGIBLE - Borderline Age (35) ✅

**From Google Spreadsheet Row 94:**
- Surname: Adeleke
- First Name: Tunde
- Age: 35
- NIN Number: 99988877766 (present)
- NIN Picture: https://drive.google.com/... (link present)
- Passport Picture: https://drive.google.com/... (proper photo)

**Your tracker entry:**
```
Row #: 94
Surname: Adeleke
First Name: Tunde
Age: 35
Age Check (18-35): PASS
NIN Number Present: YES
NIN Picture Present: YES
ELIGIBILITY STATUS: ELIGIBLE
Reason if Not Eligible: (leave blank)
Passport Picture Quality: PROPER
Notes: Age is exactly 35 - still eligible (18-35 inclusive)
```

---

### Example 8: NOT ELIGIBLE - Borderline Age (36) ❌

**From Google Spreadsheet Row 93:**
- Surname: Eze
- First Name: Chioma
- Age: 36
- NIN Number: 44455566677 (present)
- NIN Picture: https://drive.google.com/... (link present)
- Passport Picture: https://drive.google.com/... (proper photo)

**Your tracker entry:**
```
Row #: 93
Surname: Eze
First Name: Chioma
Age: 36
Age Check (18-35): FAIL
NIN Number Present: YES
NIN Picture Present: YES
ELIGIBILITY STATUS: NOT ELIGIBLE
Reason if Not Eligible: Age out of range (36 years old - exceeds 35)
Passport Picture Quality: PROPER
Notes: Just missed the age cutoff by 1 year
```

---

## 📊 Quick Visual Reference

### ✅ ELIGIBLE Entry Template:
```
Row #: [number]
Surname: [from spreadsheet]
First Name: [from spreadsheet]
Age: [18-35]
Age Check: PASS
NIN Number Present: YES
NIN Picture Present: YES
ELIGIBILITY STATUS: ELIGIBLE
Reason if Not Eligible: (blank)
Passport Picture Quality: PROPER or SELFIE-FLAG
Notes: [optional comments]
```

### ❌ NOT ELIGIBLE Entry Template:
```
Row #: [number]
Surname: [from spreadsheet]
First Name: [from spreadsheet]
Age: [outside 18-35 OR blank]
Age Check: FAIL or PASS
NIN Number Present: NO or YES
NIN Picture Present: NO or YES
ELIGIBILITY STATUS: NOT ELIGIBLE
Reason if Not Eligible: [specific reason]
Passport Picture Quality: [any]
Notes: [optional comments]
```

---

## 💡 Key Takeaways

1. **Copy names exactly** from the spreadsheet
2. **PASS** = meets criteria, **FAIL** = doesn't meet criteria
3. **YES** = present/filled, **NO** = missing/empty
4. **ELIGIBLE** only if ALL three main criteria are met (Age PASS + NIN Number YES + NIN Picture YES)
5. **Always fill "Reason"** when marking NOT ELIGIBLE
6. **Flag selfies** in Passport Picture Quality column
7. **Use Notes** for any observations or borderline cases

---

## 🎯 You're Ready!

Use these examples as a guide while filling out your tracker. Copy the format and adapt it to each row you're verifying.

**Good luck! 🚀**
