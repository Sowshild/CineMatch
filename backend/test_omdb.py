import urllib.request
import urllib.parse
import json

titles = [
    "Forrest Gump", "Gladiator", "La La Land", "3 Idiots", "RRR",
    "Dune: Part Two", "Oppenheimer", "Baahubali: The Beginning",
    "Train to Busan", "Sholay", "Titanic", "Inglourious Basterds"
]

for t in titles:
    url = f"http://www.omdbapi.com/?t={urllib.parse.quote(t)}&apikey=trilogy"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=3) as resp:
            data = json.loads(resp.read().decode())
            if data.get('Response') == 'True' and data.get('Poster') and data.get('Poster') != 'N/A':
                print(f"SUCCESS: {t} -> {data.get('Poster')}")
            else:
                print(f"FAIL: {t} -> {data.get('Error')}")
    except Exception as e:
        print(f"ERROR: {t} -> {e}")
