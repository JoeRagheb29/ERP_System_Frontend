import http.client
import json

conn = http.client.HTTPConnection('localhost', 8000, timeout=5)
try:
    conn.request('GET', '/returns/?page=1&page_size=20')
    resp = conn.getresponse()
    print('Status:', resp.status)
    data = json.loads(resp.read().decode())
    print('total:', data['total'])
    print('items count:', len(data['items']))
    print('page:', data['page'])
    print('pages:', data['pages'])
except Exception as e:
    print('Error:', e)
finally:
    conn.close()
