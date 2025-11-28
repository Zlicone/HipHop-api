from pydantic import BaseModel
from typing import Optional

class AlbumBase(BaseModel):
    title: str
    artist: str
    year: int
    region: str
    producer: Optional[str] = None
    label: Optional[str] = None
    cover_url: Optional[str] = None
    description: Optional[str] = None

class AlbumCreate(AlbumBase):
    pass

class AlbumUpdate(BaseModel):
    title: Optional[str] = None
    artist: Optional[str] = None
    year: Optional[int] = None
    region: Optional[str] = None
    producer: Optional[str] = None
    label: Optional[str] = None
    cover_url: Optional[str] = None
    description: Optional[str] = None

class Album(AlbumBase):
    id: int
    avg_rating: float
    total_ratings: int

    class Config:
        from_attributes = True
