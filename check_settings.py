import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from django.conf import settings
db = settings.DATABASES['default']
print('ENGINE =', db.get('ENGINE'))
print('NAME =', repr(db.get('NAME')))
print('USER =', repr(db.get('USER')))
print('PASSWORD length =', len(db.get('PASSWORD') or ''))
print('HOST =', repr(db.get('HOST')))
print('PORT =', repr(db.get('PORT')))
