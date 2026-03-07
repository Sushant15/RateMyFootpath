from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from sqlmodel import Session

from .models import engine, ReportData, IssueReported, IssueType
from pydantic_extra_types.coordinate import Latitude, Longitude


# ----------------------------
# REQUEST MODELS
# ----------------------------

class IssueInput(BaseModel):
    id: int
    value: str


class ReportCreate(BaseModel):
    latitude: Latitude
    longitude: Longitude
    issues: List[IssueInput]


# ----------------------------
# FASTAPI
# ----------------------------

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
        with session.begin():

            db_report = ReportData(
                latitude=report.latitude,
                longitude=report.longitude
            )

            session.add(db_report)
            session.flush()

            for issue in report.issues:

                valid_issue = next(
                    (i for i in IssueType if i.id == issue.id and i.value_str == issue.value),
                    None
                )

                if not valid_issue:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Invalid issue id/value pair: {issue.id} - {issue.value}"
                    )

                db_issue = IssueReported(
                    issueid=issue.id,
                    reportid=db_report.id
                )

                session.add(db_issue)

        return {
            "report_id": db_report.id,
            "message": "Report saved successfully"
        }

        

