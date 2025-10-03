from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials in .env file")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_all_ceramics():
    """Fetch all ceramic records from database"""
    response = supabase.table('ceramics').select("*").execute()
    return response.data

def insert_ceramic(data: dict):
    """Insert a new ceramic record"""
    response = supabase.table('ceramics').insert(data).execute()
    return response.data

def get_ceramic_by_id(ceramic_id: str):
    """Get a specific ceramic by ID"""
    response = supabase.table('ceramics').select("*").eq('id', ceramic_id).execute()
    return response.data[0] if response.data else None