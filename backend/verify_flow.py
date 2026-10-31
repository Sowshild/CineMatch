import urllib.request
import json
import sys

sys.stdout.reconfigure(encoding="utf-8")

BASE = "http://127.0.0.1:8000/api"

def req(url, method="GET", data=None):
    request = urllib.request.Request(url, method=method)
    if data is not None:
        request.add_header("Content-Type", "application/json")
        body = json.dumps(data).encode("utf-8")
    else:
        body = None
    with urllib.request.urlopen(request, data=body) as response:
        return json.loads(response.read().decode("utf-8"))

def run():
    print("=== 1. Testing Movie Catalog & Filters ===")
    movies_page = req(f"{BASE}/movies?page=1&page_size=5&genre=Sci-Fi")
    assert len(movies_page["items"]) > 0, "No Sci-Fi movies found"
    print("Total Sci-Fi movies:", movies_page["total"])

    print("\n=== 2. Testing Search ===")
    search_res = req(f"{BASE}/movies/search?q=Dark%20Knight")
    assert any("Dark Knight" in m["title"] for m in search_res), "Search failed"
    print("Search result title:", search_res[0]["title"])

    print("\n=== 3. Testing Rating Creation & Persistence ===")
    test_user_id = 6  # Newbie
    new_rating = req(f"{BASE}/ratings", method="POST", data={"user_id": test_user_id, "movie_id": 14, "rating": 5.0})
    assert new_rating["rating"] == 5.0
    ratings_list = req(f"{BASE}/ratings/{test_user_id}")
    assert any(r["movie_id"] == 14 and r["rating"] == 5.0 for r in ratings_list)
    print("Rating created and retrieved successfully: 5.0 stars for movie 14 (Spider-Man: Into the Spider-Verse)")

    print("\n=== 4. Testing Favorites Creation & Persistence ===")
    fav_res = req(f"{BASE}/favorites", method="POST", data={"user_id": test_user_id, "movie_id": 14})
    assert fav_res["movie_id"] == 14
    fav_list = req(f"{BASE}/favorites/{test_user_id}")
    assert any(f["movie_id"] == 14 for f in fav_list)
    print("Favorite added and verified successfully")

    print("\n=== 5. Testing Preferences (Genre Customization) ===")
    pref_res = req(f"{BASE}/preferences", method="POST", data={"user_id": test_user_id, "favorite_genres": ["Animation", "Family"]})
    assert "Animation" in pref_res["favorite_genres"]
    print("Preferences updated:", pref_res["favorite_genres"])

    print("\n=== 6. Testing Personalized Recommendations ===")
    recs = req(f"{BASE}/recommendations/{test_user_id}?limit=3")
    print("User 6 Model Used:", recs["algorithm_used"])
    for r in recs["recommendations"]:
        print(f" -> {r['movie']['title']} (Score: {r['score']}, Algo: {r['algorithm']})")
        print(f"    Explanation: {r['explanation']}")

    print("\n=== 7. Testing User Persona Switch to Sarah (Romance/Drama) ===")
    sarah_recs = req(f"{BASE}/recommendations/2?limit=3")
    print("Sarah Model Used:", sarah_recs["algorithm_used"])
    for r in sarah_recs["recommendations"]:
        print(f" -> {r['movie']['title']} (Score: {r['score']}, Algo: {r['algorithm']})")
        print(f"    Explanation: {r['explanation']}")

    print("\n=== 8. Testing Rating Statistics (Recharts endpoint) ===")
    stats = req(f"{BASE}/stats/1")
    print(f"Alex Stats: Total Ratings: {stats['total_ratings']}, Avg: {stats['average_rating']}★, Top Genres: {[g['genre'] for g in stats['top_genres']]}")

    # Clean up test rating
    req(f"{BASE}/ratings/{test_user_id}/14", method="DELETE")
    req(f"{BASE}/favorites/{test_user_id}/14", method="DELETE")
    print("\nCleanup complete. All end-to-end flows successfully verified!")

if __name__ == "__main__":
    run()
