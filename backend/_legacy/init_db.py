import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

print(f"Connecting to database...")

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    with open('schema.sql', 'r') as f:
        cur.execute(f.read())
    
    conn.commit()
    cur.close()
    conn.close()
    print("✅ Database tables created successfully!")
except Exception as e:
    print(f"❌ Error: {e}")