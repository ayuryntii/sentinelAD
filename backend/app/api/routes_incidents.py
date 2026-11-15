import io
import csv
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.core.database import get_db
from app.models.incident import Incident

router = APIRouter()

@router.get("/incidents")
def get_incidents(
    db: Session = Depends(get_db),
    severity: Optional[str] = Query(None, description="Filter berdasarkan tingkat keparahan: CRITICAL, HIGH, MEDIUM, LOW"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0)
):
    query = db.query(Incident)
    if severity:
        query = query.filter(Incident.severity == severity.upper())
    
    total = query.count()
    incidents = query.order_by(desc(Incident.timestamp)).offset(offset).limit(limit).all()

    return {
        "total": total,
        "items": [inc.to_dict() for inc in incidents]
    }

@router.post("/incidents/{incident_id}/resolve")
def resolve_incident(incident_id: int, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Insiden tidak ditemukan")
    incident.resolved = True
    db.commit()
    return {"status": "success", "message": f"Insiden #{incident_id} ditandai selesai."}

@router.post("/incidents/{incident_id}/isolate")
def isolate_incident(incident_id: int, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Insiden tidak ditemukan")
    new_state = not getattr(incident, "is_isolated", False)
    incident.is_isolated = new_state
    db.commit()
    status_text = "berhasil diisolasi otomatis oleh Firewall Pussiberad" if new_state else "isolasi dicabut"
    return {
        "status": "success",
        "is_isolated": new_state,
        "message": f"IP {incident.source_ip} {status_text}."
    }

@router.delete("/incidents/clear")
def clear_incidents(db: Session = Depends(get_db)):
    db.query(Incident).delete()
    db.commit()
    return {"status": "success", "message": "Semua log insiden berhasil dibersihkan."}

@router.get("/incidents/export/csv")
def export_incidents_csv(db: Session = Depends(get_db)):
    incidents = db.query(Incident).order_by(desc(Incident.timestamp)).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Timestamp", "Source IP", "Destination IP", "Protocol", "Threat Type", "Severity", "Anomaly Score", "Packets", "Details", "Resolved"])
    
    for inc in incidents:
        writer.writerow([
            inc.id,
            inc.timestamp.isoformat() if inc.timestamp else "",
            inc.source_ip,
            inc.destination_ip,
            inc.protocol,
            inc.threat_type,
            inc.severity,
            inc.anomaly_score,
            inc.packet_count,
            inc.details or "",
            inc.resolved
        ])
    
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=sentinel_incident_audit.csv"}
    )
