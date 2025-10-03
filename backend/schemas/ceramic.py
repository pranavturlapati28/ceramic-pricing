from pydantic import BaseModel, Field
from datetime import date
from typing import Optional

class CeramicInput(BaseModel):
    """What users send when they want a price prediction"""
    name: str = Field(..., min_length=1, max_length=255)
    date_created: date
    date_listed: date
    
    # Costs
    material_cost: float = Field(..., ge=0)
    labor_cost: float = Field(..., ge=0)
    overhead_cost: float = Field(..., ge=0)
    
    # Quality attributes (1-10)
    glazing_quality: int = Field(..., ge=1, le=10)
    originality: int = Field(..., ge=1, le=10)
    beauty: int = Field(..., ge=1, le=10)
    demand: int = Field(..., ge=1, le=10)
    
    # User weights
    alpha: float = Field(0.5, ge=0, le=1)  # cost weight
    beta: float = Field(0.5, ge=0, le=1)   # quality weight
    hours_worked: float = Field(..., ge=0)
    markup: float = Field(0.3, ge=0, le=2)
    
    # Optional image (base64 encoded)
    image_base64: Optional[str] = None

class PredictionResponse(BaseModel):
    """What the API returns after prediction"""
    predicted_price: float
    breakdown: dict
    confidence_interval: list[float]
    model_version: str