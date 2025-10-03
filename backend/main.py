from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from schemas.ceramic import CeramicInput, PredictionResponse
from schemas.history import HistoricalSaleInput
from typing import Optional

from utils.db import insert_ceramic, get_all_ceramics
import uvicorn
import jwt

from datetime import datetime


app = FastAPI(title="Ceramic Pricing API", version="1.0.0")

# Add this helper function to verify Supabase JWT
async def get_user_id(authorization: Optional[str] = Header(None)) -> str:
    """Extract user ID from Supabase JWT token"""
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # For development, you can skip JWT verification
    # In production, you should verify the JWT token
    token = authorization.replace('Bearer ', '')
    
    # Simple extraction (NOT SECURE - for development only)
    # In production, use proper JWT verification
    try:
        # This is a simplified version - in production decode and verify properly
        decoded = jwt.decode(token, options={"verify_signature": False})
        return decoded.get('sub')
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

# Allow your frontend to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    """Health check endpoint"""
    return {"status": "Ceramic Pricing API is running", "version": "1.0.0"}

@app.post("/predict", response_model=PredictionResponse)
async def predict_price(ceramic: CeramicInput, authorization: Optional[str] = Header(None)):
    """
    Predict the price of a ceramic piece
    For now, this is a simple formula - we'll add ML later
    """
    user_id = await get_user_id(authorization)
    
    # Simple calculation (we'll replace this with ML model later)
    total_cost = ceramic.material_cost + ceramic.labor_cost + ceramic.overhead_cost
    base_price = total_cost * (1 + ceramic.markup)
    
    # Quality adjustment (simplified)
    quality_avg = (ceramic.glazing_quality + ceramic.originality + 
                   ceramic.beauty + ceramic.demand) / 4
    quality_multiplier = quality_avg / 10  # 0.1 to 1.0
    
    predicted_price = base_price * (1 + quality_multiplier * 0.5)
    
    # Save to database
    ceramic_dict = ceramic.dict(exclude={'image_base64'})
    db_data = {
        **ceramic_dict,
        'date_created': str(ceramic.date_created),  # Convert date to string
        'date_listed': str(ceramic.date_listed),    # Convert date to string
        'predicted_price': predicted_price,
        'status': 'listed',
        'model_version': 'v0.1.0-simple',
        'user_id': user_id  # Add user_id
    }
    insert_ceramic(db_data)
    
    return PredictionResponse(
        predicted_price=round(predicted_price, 2),
        breakdown={
            "total_cost": total_cost,
            "base_price": base_price,
            "quality_adjustment": predicted_price - base_price
        },
        confidence_interval=[
            round(predicted_price * 0.9, 2),
            round(predicted_price * 1.1, 2)
        ],
        model_version="v0.1.0-simple"
    )

@app.get("/history")
async def get_history(authorization: Optional[str] = Header(None)):
    """Get all past ceramic submissions"""
    user_id = await get_user_id(authorization)
    try:
        ceramics = get_all_ceramics()
        # Filter ceramics by user_id
        user_ceramics = [ceramic for ceramic in ceramics if ceramic.get('user_id') == user_id]
        return {"count": len(user_ceramics), "items": user_ceramics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/historical")
async def add_historical_sale(sale: HistoricalSaleInput, authorization: Optional[str] = Header(None)):
    """
    Add a historical sale to the database for model training
    """
    user_id = await get_user_id(authorization)
    try:
        # Calculate days to sell
        days_to_sell = (sale.date_sold - sale.date_listed).days
        
        # Calculate profit metrics
        total_cost = sale.material_cost + sale.labor_cost + sale.overhead_cost
        profit = sale.actual_price - total_cost
        profit_margin = (profit / total_cost * 100) if total_cost > 0 else 0
        
        # Prepare data for database
        sale_dict = sale.dict()
        db_data = {
            **sale_dict,
            'date_created': str(sale.date_created),
            'date_listed': str(sale.date_listed),
            'date_sold': str(sale.date_sold),
            'status': 'sold',
            'predicted_price': None,  # This was a historical sale, no prediction made
            'model_version': None,
            'days_to_sell': days_to_sell,
            'profit': profit,
            'profit_margin': profit_margin,
            'user_id': user_id  # Add user_id
        }
        
        # Remove notes if empty to avoid storing empty strings
        if not db_data.get('notes'):
            db_data.pop('notes', None)
        
        # Insert into database
        result = insert_ceramic(db_data)
        
        return {
            "status": "success",
            "message": "Historical sale added successfully",
            "data": {
                "id": result[0]['id'] if result else None,
                "name": sale.name,
                "actual_price": sale.actual_price,
                "profit": round(profit, 2),
                "profit_margin": round(profit_margin, 1),
                "days_to_sell": days_to_sell
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add historical sale: {str(e)}")


# Add endpoint to get statistics about your historical data
@app.get("/stats")
async def get_statistics(authorization: Optional[str] = Header(None)):
    """
    Get statistics about historical sales
    """
    user_id = await get_user_id(authorization)
    try:
        all_ceramics = get_all_ceramics()
        
        # Filter ceramics by user_id
        user_ceramics = [ceramic for ceramic in all_ceramics if ceramic.get('user_id') == user_id]
        
        # Filter only sold items for this user
        sold_items = [item for item in user_ceramics if item.get('status') == 'sold']
        
        if not sold_items:
            return {
                "total_items": len(user_ceramics),
                "sold_items": 0,
                "listed_items": len(user_ceramics),
                "message": "No historical sales data yet"
            }
        
        # Calculate statistics
        prices = [item['actual_price'] for item in sold_items if item.get('actual_price')]
        
        return {
            "total_items": len(user_ceramics),
            "sold_items": len(sold_items),
            "listed_items": len(user_ceramics) - len(sold_items),
            "price_stats": {
                "min": min(prices) if prices else 0,
                "max": max(prices) if prices else 0,
                "average": sum(prices) / len(prices) if prices else 0,
                "total_revenue": sum(prices) if prices else 0
            },
            "ready_for_training": len(sold_items) >= 20
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)