from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Service
from app.schemas import ServiceOut


router = APIRouter(tags=["Público"])


@router.get("/services", response_model=list[ServiceOut])
def list_public_services(db: Session = Depends(get_db)) -> list[ServiceOut]:
    return list(
        db.scalars(
            select(Service)
            .where(Service.is_active.is_(True))
            .order_by(Service.sort_order, Service.title)
        )
    )
