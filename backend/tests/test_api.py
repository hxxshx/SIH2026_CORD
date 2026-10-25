import pytest
from fastapi.testclient import TestClient
from app.main import app

def test_api_health_check():
    with TestClient(app) as client:
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "online"
        assert "CORD" in data["service"]

def test_institutions_list_and_search():
    with TestClient(app) as client:
        # List all
        res = client.get("/api/institutions")
        assert res.status_code == 200
        institutions = res.json()
        assert len(institutions) >= 8
        
        # Search Demo Institute North
        res_search = client.get("/api/institutions?search=DEMO-PID-104")
        assert res_search.status_code == 200
        results = res_search.json()
        assert len(results) >= 1
        assert results[0]["name"] == "Demo Institute North"
        assert results[0]["verification_state"] == "VERIFIED"

def test_codocket_receipt_and_pdf_download():
    with TestClient(app) as client:
        # 1. Fetch pack details
        pack_res = client.get("/api/codockets/CORD-CD-104")
        assert pack_res.status_code == 200
        pack_data = pack_res.json()
        assert pack_data["pack"]["pack_id"] == "CORD-CD-104"
        assert len(pack_data["cases"]) >= 2

        # 2. Record review receipt
        payload = {
            "pack_id": "CORD-CD-104",
            "review_note": "Automated verification test note for joint hearing.",
            "reviewer": "R. Sharma (Under Secretary, Regulation Bureau)",
            "coordination_action": "Joint Hearing Recommended"
        }
        receipt_res = client.post("/api/codockets/CORD-CD-104/receipt", json=payload)
        assert receipt_res.status_code == 200
        receipt_data = receipt_res.json()
        assert "receipt_id" in receipt_data
        assert "hash_signature" in receipt_data

        # 3. Download PDF
        pdf_res = client.get("/api/codockets/CORD-CD-104/pdf")
        assert pdf_res.status_code == 200
        assert pdf_res.headers["content-type"] == "application/pdf"
        assert pdf_res.content.startswith(b"%PDF")
