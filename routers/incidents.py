from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from db import get_db
from models import Incident

router = APIRouter()

@router.get("/addresses")
def autocomplete_addresses(q: str = Query(..., min_length=2), db: Session = Depends(get_db)):
    """
    Returns a list of unique addresses matching the query substring (case-insensitive).
    """
    pattern = f"%{q}%"
    addresses = db.query(Incident.address).filter(Incident.address.ilike(pattern)).distinct().limit(10).all()
    return [addr[0] for addr in addresses]

@router.get("/")
def read_incidents(
    address: str = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """
    List incidents filtered by address substring (if given), paginated.
    """
    query = db.query(Incident)
    if address:
        pattern = f"%{address}%"
        query = query.filter(Incident.address.ilike(pattern))
    incidents = query.offset(skip).limit(limit).all()
    return incidents

@router.get("/{incident_id}")
def read_incident(incident_id: int, db: Session = Depends(get_db)):
    """
    Get a single incident by its integer primary key (id).
    """
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident
