"""
AUTO VERIFICATION HELPER - SAMUEL
This script helps automate parts of the verification process.

NOTE: You still need to manually check passport picture quality!
This script only helps with Age and NIN verification.

HOW TO USE:
1. Download the Google Spreadsheet as CSV
2. Save it as "raw_data.csv" in the same folder as this script
3. Run: python3 auto_verifier_helper.py
4. It will create "auto_verified_results.csv"
5. Review the results and manually add passport picture quality checks
"""

import csv
import os

def verify_age(age_str):
    """Check if age is between 18-35"""
    try:
        age = int(age_str)
        if 18 <= age <= 35:
            return "PASS", age
        else:
            return "FAIL", age
    except (ValueError, TypeError):
        return "FAIL", "Invalid/Empty"

def verify_nin_number(nin_str):
    """Check if NIN number is present and valid format"""
    if not nin_str or nin_str.strip() == "":
        return "NO", "Empty"
    elif len(nin_str.strip()) == 11 and nin_str.strip().isdigit():
        return "YES", "Valid (11 digits)"
    else:
        return "YES", f"Present (check format: {len(nin_str.strip())} chars)"

def verify_nin_picture(picture_url):
    """Check if NIN picture link is present"""
    if not picture_url or picture_url.strip() == "":
        return "NO"
    elif "drive.google.com" in picture_url or "http" in picture_url:
        return "YES"
    else:
        return "NO"

def determine_eligibility(age_check, nin_number_check, nin_picture_check):
    """Determine if candidate is eligible"""
    if age_check == "PASS" and nin_number_check == "YES" and nin_picture_check == "YES":
        return "ELIGIBLE", ""
    else:
        reasons = []
        if age_check == "FAIL":
            reasons.append("Age out of range")
        if nin_number_check == "NO":
            reasons.append("No NIN Number")
        if nin_picture_check == "NO":
            reasons.append("No NIN Picture")
        return "NOT ELIGIBLE", " + ".join(reasons)

def process_spreadsheet(input_file, output_file, start_row, end_row):
    """Process the spreadsheet and generate verification results"""
    
    if not os.path.exists(input_file):
        print(f"❌ ERROR: File '{input_file}' not found!")
        print(f"📥 Please download the Google Spreadsheet as CSV and save it as '{input_file}'")
        return
    
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        rows = list(reader)
    
    # Assuming standard Google Forms response structure
    # Column indices (adjust if needed):
    # A=0(Timestamp), B=1(Surname), C=2(FirstName), D=3(OtherName), E=4(Phone), F=5(Age)
    # O=14(NIN Picture), P=15(NIN Number), Q=16(Passport)
    
    headers = rows[0]
    print(f"📊 Found {len(rows)-1} total rows in spreadsheet")
    print(f"✅ Your assignment: Rows {start_row} to {end_row}")
    
    # Find column indices
    try:
        surname_idx = 1  # Column B
        firstname_idx = 2  # Column C
        age_idx = 5  # Column F
        nin_picture_idx = 14  # Column O
        nin_number_idx = 15  # Column P
        passport_idx = 16  # Column Q
    except:
        print("❌ ERROR: Could not identify columns. Please check CSV structure.")
        return
    
    # Prepare output
    output_headers = [
        "Row #", "Surname", "First Name", "Age", "Age Check (18-35)", 
        "NIN Number Present", "NIN Picture Present", "ELIGIBILITY STATUS",
        "Reason if Not Eligible", "Passport Picture Quality", "Notes"
    ]
    
    output_rows = []
    eligible_count = 0
    not_eligible_count = 0
    
    # Process rows from start_row to end_row (Samuel: 100 to 2)
    for row_num in range(start_row, end_row-1, -1):  # 100 down to 2
        if row_num >= len(rows):
            print(f"⚠️ Warning: Row {row_num} doesn't exist in spreadsheet")
            continue
        
        row = rows[row_num]
        
        # Extract data
        surname = row[surname_idx] if len(row) > surname_idx else ""
        firstname = row[firstname_idx] if len(row) > firstname_idx else ""
        age = row[age_idx] if len(row) > age_idx else ""
        nin_picture_url = row[nin_picture_idx] if len(row) > nin_picture_idx else ""
        nin_number = row[nin_number_idx] if len(row) > nin_number_idx else ""
        passport_url = row[passport_idx] if len(row) > passport_idx else ""
        
        # Verify
        age_check, age_detail = verify_age(age)
        nin_number_check, nin_number_detail = verify_nin_number(nin_number)
        nin_picture_check = verify_nin_picture(nin_picture_url)
        
        # Determine eligibility
        eligibility, reason = determine_eligibility(age_check, nin_number_check, nin_picture_check)
        
        if eligibility == "ELIGIBLE":
            eligible_count += 1
        else:
            not_eligible_count += 1
        
        # Passport quality - needs manual review
        passport_quality = "NEEDS MANUAL REVIEW" if passport_url else "MISSING"
        
        # Notes
        notes = []
        if age_check == "FAIL":
            notes.append(f"Age: {age_detail}")
        if nin_number_check == "NO":
            notes.append("NIN number missing")
        elif "check format" in nin_number_detail:
            notes.append(nin_number_detail)
        
        output_row = [
            row_num,
            surname,
            firstname,
            age,
            age_check,
            nin_number_check,
            nin_picture_check,
            eligibility,
            reason if reason else "",
            passport_quality,
            "; ".join(notes) if notes else ""
        ]
        
        output_rows.append(output_row)
    
    # Write output
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(output_headers)
        writer.writerows(output_rows)
    
    # Summary
    print("\n" + "="*60)
    print("✅ AUTO VERIFICATION COMPLETE!")
    print("="*60)
    print(f"📊 Total rows processed: {len(output_rows)}")
    print(f"✅ Eligible (based on Age + NIN only): {eligible_count}")
    print(f"❌ Not Eligible: {not_eligible_count}")
    print(f"\n📁 Results saved to: {output_file}")
    print("\n⚠️ IMPORTANT: You still need to manually:")
    print("   1. Review passport picture quality (open links and check)")
    print("   2. Mark as PROPER, SELFIE, or FLAG")
    print("   3. Verify the auto-generated results")
    print("\n💡 Open the output file and review each entry!")
    print("="*60)

if __name__ == "__main__":
    print("="*60)
    print("🤖 AUTO VERIFICATION HELPER - SAMUEL")
    print("="*60)
    print()
    
    # Configuration for Samuel
    INPUT_FILE = "raw_data.csv"
    OUTPUT_FILE = "auto_verified_results.csv"
    START_ROW = 100
    END_ROW = 2
    
    print("📋 Your assignment:")
    print(f"   Rows: {START_ROW} down to {END_ROW}")
    print(f"   Input file: {INPUT_FILE}")
    print(f"   Output file: {OUTPUT_FILE}")
    print()
    
    # Check if input file exists
    if not os.path.exists(INPUT_FILE):
        print("⚠️ INPUT FILE NOT FOUND!")
        print()
        print("📥 TO USE THIS SCRIPT:")
        print("   1. Open the Google Spreadsheet")
        print("   2. Click File → Download → Comma Separated Values (.csv)")
        print("   3. Save it as 'raw_data.csv' in the same folder as this script")
        print("   4. Run this script again: python3 auto_verifier_helper.py")
        print()
    else:
        print("✅ Input file found! Starting verification...")
        print()
        process_spreadsheet(INPUT_FILE, OUTPUT_FILE, START_ROW, END_ROW)

    print("\n🎯 Next steps:")
    print("   1. Open the generated CSV file")
    print("   2. Manually review passport picture quality")
    print("   3. Verify the eligibility decisions")
    print("   4. Transfer final results to COO's general workbook")
    print()
    print("Good luck! 🚀")
