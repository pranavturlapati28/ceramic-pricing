from pydantic import BaseModel, Field
from datetime import date

class HistoricalSaleInput(BaseModel):
    """Historical sale data for training the model"""
    name: str = Field(..., min_length=1, max_length=255)
    date_created: date
    date_listed: date
    date_sold: date
    
    # Costs
    material_cost: float = Field(..., ge=0)
    labor_cost: float = Field(..., ge=0)
    overhead_cost: float = Field(..., ge=0)
    
    # Quality attributes (1-10)
    glazing_quality: int = Field(..., ge=1, le=10)
    originality: int = Field(..., ge=1, le=10)
    beauty: int = Field(..., ge=1, le=10)
    demand: int = Field(..., ge=1, le=10)
    
    hours_worked: float = Field(..., ge=0)
    actual_price: float = Field(..., ge=0)  # The price it actually sold for
    notes: str = ""
