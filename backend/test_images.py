import urllib.request
import urllib.parse
import json

def get_wiki_poster(title):
    headers = {'User-Agent': 'CineMatch/1.0 (contact@cinematch.dev)'}
    for query in [f"{title} (film)", title, f"{title} (2010 film)", f"{title} (2014 film)"]:
        url = f"https://en.wikipedia.org/w/api.php?action=query&titles={urllib.parse.quote(query)}&prop=pageimages&format=json&pithumbsize=600"
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=4) as resp:
                data = json.loads(resp.read().decode())
                pages = data.get('query', {}).get('pages', {})
                for pid, pdata in pages.items():
                    if pid != '-1' and 'thumbnail' in pdata:
                        return pdata['thumbnail']['source']
        except Exception as e:
            pass
    return None

if __name__ == "__main__":
    for t in ['Forrest Gump', 'Gladiator', 'La La Land', '3 Idiots', 'RRR', 'The Dark Knight', 'Titanic']:
        print(t, '->', get_wiki_poster(t))
