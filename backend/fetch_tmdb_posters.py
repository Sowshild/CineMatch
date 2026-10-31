import urllib.request
import urllib.parse
import re
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5'
}

def get_poster(title):
    query = urllib.parse.quote(title)
    url = f"https://www.themoviedb.org/search/movie?query={query}"
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=5) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            # Look for image path like /t/p/w.../something.jpg or data-src
            matches = re.findall(r'(?:src|data-src)="(https://image\.tmdb\.org/t/p/w(?:185|342|500|w92)/[^"]+\.jpg)"', html)
            if matches:
                # convert to w500
                res = re.sub(r'/w\d+/', '/w500/', matches[0])
                return res
            # Also look for /t/p/w500/... in href or poster
            matches2 = re.findall(r'/t/p/w(?:185|342|500)/([a-zA-Z0-9_\-]+\.jpg)', html)
            if matches2:
                return f"https://image.tmdb.org/t/p/w500/{matches2[0]}"
    except Exception as e:
        return f"Error: {e}"
    return None

if __name__ == "__main__":
    for t in ["Forrest Gump", "La La Land", "Gladiator", "Dune: Part Two", "3 Idiots", "RRR", "Titanic"]:
        print(t, "->", get_poster(t))
