from sqlmodel import Field, SQLModel, create_engine
from pydantic_extra_types.coordinate import Latitude, Longitude
from enum import Enum
from datetime import datetime
import pytz


# ----------------------------
# HARDCODED ISSUES
# ----------------------------

class IssueType(Enum):
    broken_footpath = (1, "broken_footpath")
    waterlogging = (2, "waterlogging")
    potholes = (3, "potholes")
    street_vendors = (4, "street_vendors")
    construction_material = (5, "construction_material")
    garbage_dumped = (6, "garbage_dumped")
    vehicles_parked = (7, "vehicles_parked")
    poles_signboards = (8, "poles_signboards")
    barricades = (9, "barricades")
    animals_blocking = (10, "animals_blocking")
    overgrown_plants = (11, "overgrown_plants")
    no_streetlights = (12, "no_streetlights")
    wheelchair_ramp = (13, "wheelchair_ramp")
    tactile_tiles = (14, "tactile_tiles")
    narrow_walkway = (15, "narrow_walkway")
    footpath_ends = (16, "footpath_ends")
    no_zebra_crossing = (17, "no_zebra_crossing")
    vehicles_entering = (18, "vehicles_entering")
    no_ped_signal = (19, "no_ped_signal")
    unsafe_night = (20, "unsafe_night")
    exposed_wires = (21, "exposed_wires")

    def __init__(self, issue_id, issue_value):
        self.id = issue_id
        self.value_str = issue_value


# ----------------------------
# IST TIME HELPER
# ----------------------------

IST = pytz.timezone("Asia/Kolkata")

def get_ist_time():
    return datetime.now(IST)


# ----------------------------
# DATABASE MODELS
# ----------------------------

class ReportBase(SQLModel):
    latitude: Latitude
    longitude: Longitude


class ReportData(ReportBase, table=True):
    __tablename__ = "report_data"

    id: int | None = Field(default=None, primary_key=True)

    # New timestamp column (IST)
    timestamp: datetime = Field(default_factory=get_ist_time, nullable=False)


class IssueReported(SQLModel, table=True):
    __tablename__ = "issue_reported"

    reportid: int = Field(
        foreign_key="report_data.id",
        primary_key=True
    )

    issueid: int = Field(
        primary_key=True
    )

    # Text column (NOT part of primary key)
    issue_name: str = Field(nullable=False)

# ----------------------------
# DATABASE ENGINE
# ----------------------------

sqlite_url = "sqlite:////data/rate_my_footpath.db"

connect_args = {"check_same_thread": False}

engine = create_engine(
    sqlite_url,
    echo=True,
    connect_args=connect_args
)
