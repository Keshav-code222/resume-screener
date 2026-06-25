import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')
SCHEMA_PATH = 'schema.sql'

def init_db():
    print(f"Connecting to {DATABASE_URL}...")
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        with open(SCHEMA_PATH, 'r') as f:
            schema_sql = f.read()
            
        cur.execute(schema_sql)
        conn.commit()
        print("Schema executed successfully!")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'conn' in locals() and conn:
            cur.close()
            conn.close()

if __name__ == '__main__':
    init_db()
