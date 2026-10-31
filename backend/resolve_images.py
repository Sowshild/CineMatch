import urllib.request
import urllib.parse
import json
import time
from concurrent.futures import ThreadPoolExecutor
import seed_data

def check_url_status(url):
    if not url or not url.startswith('http'):
        return False
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=3) as resp:
            return resp.status == 200
    except Exception:
        return False

def get_omdb_poster(title, year=None):
    clean_title = title.split(":")[0].strip() # in case of subtitle
    queries = [
        f"http://www.omdbapi.com/?t={urllib.parse.quote(title)}&apikey=trilogy",
        f"http://www.omdbapi.com/?t={urllib.parse.quote(clean_title)}&apikey=trilogy",
    ]
    if year:
        queries.insert(0, f"http://www.omdbapi.com/?t={urllib.parse.quote(title)}&y={year}&apikey=trilogy")
    
    for q in queries:
        try:
            req = urllib.request.Request(q, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=4) as resp:
                data = json.loads(resp.read().decode())
                if data.get('Response') == 'True' and data.get('Poster') and data.get('Poster') != 'N/A':
                    return data.get('Poster')
        except Exception:
            pass
    return None

def process_movie(m):
    movie = dict(m)
    title = movie['title']
    poster = movie.get('poster_url', '')
    
    # Check if current poster works
    if not check_url_status(poster):
        print(f"Resolving poster for: {title}...")
        new_poster = get_omdb_poster(title, movie.get('release_year'))
        if new_poster:
            print(f" -> Found poster for {title}: {new_poster[:40]}...")
            movie['poster_url'] = new_poster
        else:
            print(f" !! WARNING: Could not find poster for {title}")
    
    # Check backdrop
    backdrop = movie.get('backdrop_url', '')
    if not check_url_status(backdrop):
        movie['backdrop_url'] = movie['poster_url']

    return movie

if __name__ == "__main__":
    print(f"Processing {len(seed_data.SEED_MOVIES)} movies...")
    start_time = time.time()
    with ThreadPoolExecutor(max_workers=8) as executor:
        resolved_movies = list(executor.map(process_movie, seed_data.SEED_MOVIES))
    
    print(f"Finished in {time.time() - start_time:.2f}s")
    
    # Check failing posters now
    failing = [m for m in resolved_movies if not check_url_status(m['poster_url'])]
    print(f"Failing posters after resolution: {len(failing)} / {len(resolved_movies)}")
    for f in failing:
        print(f['id'], f['title'])

    # Write out updated movies
    import pprint
    with open("resolved_movies.json", "w", encoding="utf-8") as f:
        json.dump(resolved_movies, f, indent=2)
    print("Saved to resolved_movies.json")
