from fastapi import HTTPException
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pydantic_extra_types.coordinate import Latitude, Longitude
from sqlmodel import Field, Session, SQLModel, create_engine, Relationship
from enum import Enum
from typing import List, Optional


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
# DATABASE MODELS
# ----------------------------

class ReportBase(SQLModel):
    latitude: Latitude
    longitude: Longitude


class Report_data(ReportBase, table=True):
    __tablename__ = "report_data"
    id: int | None = Field(default=None, primary_key=True)


class IssueReported(SQLModel, table=True):
    __tablename__ = "issue_reported"

    reportid: int = Field(
        foreign_key="report_data.id",
        primary_key=True
    )

    issueid: int = Field(
        primary_key=True
    )


# ----------------------------
# REQUEST MODEL
# ----------------------------

class IssueInput(BaseModel):
    id: int
    value: str


class ReportCreate(BaseModel):
    latitude: Latitude
    longitude: Longitude
    issues: List[IssueInput]


# ----------------------------
# DATABASE
# ----------------------------

sqlite_url = f"sqlite:///./rate_my_footpath.db"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, echo=True, connect_args=connect_args)


# ----------------------------
# FASTAPI
# ----------------------------

app = FastAPI()

#this below section is to make OPTIONS method work from frontend

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ----------------------------
# API ENDPOINT
# ----------------------------


@app.post("/submit/")
def submit_issue(report: ReportCreate):
    with Session(engine) as session:
        with session.begin():  # atomic transaction

            db_report = Report_data(
                latitude=report.latitude,
                longitude=report.longitude
            )
            session.add(db_report)
            session.flush()  # get ID

            for issue in report.issues:

                # Validate against IssueType enum
                valid_issue = next(
                    (i for i in IssueType if i.id == issue.id and i.value_str == issue.value),
                    None
                )

                if not valid_issue:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Invalid issue id/value pair: {issue.id} - {issue.value}"
                    )

                # Store only issue_id
                db_issue = IssueReported(
                    issueid=issue.id,
                    reportid=db_report.id
                )
                session.add(db_issue)

        return {
            "report_id": db_report.id,
            "message": "Report saved successfully"
        }
