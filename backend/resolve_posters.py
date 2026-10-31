import urllib.request
import urllib.parse
import json
import time

failed_titles = {
    11: 'Forrest Gump',
    13: 'La La Land',
    17: 'The Lord of the Rings: The Fellowship of the Ring',
    25: 'The Grand Budapest Hotel',
    29: 'Inglourious Basterds',
    32: 'Amelie',
    34: 'Princess Mononoke',
    35: 'Eternal Sunshine of the Spotless Mind',
    39: 'Jurassic Park',
    42: 'Memento',
    44: 'No Country for Old Men',
    45: 'Everything Everywhere All at Once',
    46: 'Her',
    48: 'Shutter Island',
    49: 'Django Unchained',
    51: 'Ex Machina',
    52: 'The Truman Show',
    57: 'Pride & Prejudice',
    58: 'The Social Network',
    59: 'Up'
}

key = '15d2ea6d0dc1d476efbca3eba2b9bbfb'
results = {}

for mid, title in failed_titles.items():
    success = False
    for attempt in range(4):
        try:
            query = urllib.parse.quote(title)
            url = f"https://api.themoviedb.org/3/search/movie?api_key={key}&query={query}"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
            with urllib.request.urlopen(req, timeout=8) as resp:
                data = json.loads(resp.read().decode())
                res = data.get('results', [])
                if res and res[0].get('poster_path'):
                    poster_path = res[0]['poster_path']
                    poster_url = f"https://image.tmdb.org/t/p/w500{poster_path}"
                    # Test poster url
                    p_req = urllib.request.Request(poster_url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(p_req, timeout=6) as p_resp:
                        if p_resp.status == 200:
                            results[mid] = poster_url
                            print(f"SUCCESS {mid}: {title} -> {poster_url}")
                            success = True
                            break
        except Exception as e:
            time.sleep(1.2)
    if not success:
        print(f"FAILED: {mid} {title}")
    time.sleep(0.8)

with open('resolved_posters.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2)

print(f"Finished resolving. Total verified: {len(results)} of {len(failed_titles)}")
