import urllib.request
import json
import os

req_data = {
    "pack_id": "CORD-CD-104",
    "review_note": "Verified live demonstration: Student fee receipts confirm capitation charges alongside unapproved 60-seat expansion. Coordination notice issued.",
    "reviewer": "Officer R. Sharma | Regulation Bureau (HQ-Delhi)",
    "coordination_action": "Joint Inquiry and Show-Cause Alignment"
}

# 1. Post receipt
req = urllib.request.Request(
    "http://127.0.0.1:8000/api/codockets/CORD-CD-104/receipt",
    data=json.dumps(req_data).encode('utf-8'),
    headers={"Content-Type": "application/json"}
)
with urllib.request.urlopen(req) as resp:
    res_body = json.loads(resp.read().decode('utf-8'))
    print("RECEIPT SAVED:")
    print("Receipt ID:", res_body.get("receipt_id"))
    print("Hash Signature:", res_body.get("hash_signature"))
    print("Timestamp:", res_body.get("timestamp"))

# 2. Download PDF
pdf_path = os.path.abspath("CORD_CoDocket_CORD-CD-104.pdf")
urllib.request.urlretrieve("http://127.0.0.1:8000/api/codockets/CORD-CD-104/pdf", pdf_path)
file_size = os.path.getsize(pdf_path)
print("PDF DOWNLOADED:", pdf_path)
print(f"File size: {file_size} bytes (Header: {open(pdf_path, 'rb').read(4)})")
