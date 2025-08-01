from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Incident(Base):
    __tablename__ = "Incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String, unique=True)
    type = Column(String)
    alarm = Column(Integer)
    enroute_time = Column(String)
    arrive_time = Column(String)
    address = Column(String)
    apparatus = Column(String)
    total = Column(Integer)
    scan_date = Column(String)
    created_at = Column(String)
