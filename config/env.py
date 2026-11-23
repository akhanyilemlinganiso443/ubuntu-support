import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / '.env')

print('DB_NAME =', repr(os.getenv('DB_NAME')))
print('DB_USER =', repr(os.getenv('DB_USER')))
print('DB_PASSWORD length =', len(os.getenv('DB_PASSWORD') or ''))
print('DB_HOST =', repr(os.getenv('DB_HOST')))
print('DB_PORT =', repr(os.getenv('DB_PORT')))
print('DEBUG =', repr(os.getenv('DEBUG')))