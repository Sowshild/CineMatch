"""
API Integration Tests for CineMatch FastAPI Application
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from database import Base, get_db
from main import app
from seed_data import SEED_MOVIES, SEED_USERS, SEED_RATINGS
from models import Movie, User, Rating, UserPreference

# In-memory SQLite engine for API testing with StaticPool
engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="module", autouse=True)
def setup_api_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    for m in SEED_MOVIES:
        db.add(Movie(
            id=m["id"],
            title=m["title"],
            release_year=m.get("release_year"),
            genres=m["genres"],
            overview=m.get("overview"),
            poster_url=m.get("poster_url"),
            backdrop_url=m.get("backdrop_url"),
            vote_average=m.get("vote_average", 0.0),
            vote_count=m.get("vote_count", 0)
        ))

    test_users = [
        {"id": 1, "username": "testuser1", "name": "Test User 1", "email": "user1@test.com", "favorite_genres": ["Sci-Fi", "Action"]},
        {"id": 6, "username": "testuser6", "name": "Test User 6", "email": "user6@test.com", "favorite_genres": ["Drama", "Crime"]}
    ]
    for u in test_users:
        db.add(User(
            id=u["id"],
            username=u["username"],
            name=u["name"],
            email=u.get("email"),
            avatar="https://api.dicebear.com/7.x/bottts/svg?seed=test"
        ))
        fav_genres = u.get("favorite_genres", [])
        if fav_genres:
            db.add(UserPreference(
                user_id=u["id"],
                favorite_genres=",".join(fav_genres)
            ))

    test_ratings = [
        {"user_id": 1, "movie_id": 1, "rating": 5.0},
        {"user_id": 1, "movie_id": 2, "rating": 4.5},
        {"user_id": 1, "movie_id": 3, "rating": 4.0},
        {"user_id": 6, "movie_id": 1, "rating": 4.0}
    ]
    for r in test_ratings:
        db.add(Rating(
            user_id=r["user_id"],
            movie_id=r["movie_id"],
            rating=r["rating"]
        ))

    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    return TestClient(app)


def test_list_movies_pagination(client):
    """Test movie listing with pagination and filters."""
    response = client.get("/api/movies?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) == 10
    assert data["total"] >= 50
    assert data["page"] == 1


def test_search_movies(client):
    """Test search by title."""
    response = client.get("/api/movies/search?q=Dark Knight")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any("Dark Knight" in m["title"] for m in data)


def test_get_movie_details(client):
    """Test retrieving movie details by ID."""
    response = client.get("/api/movies/1")
    assert response.status_code == 200
    movie = response.json()
    assert movie["id"] == 1
    assert movie["title"] == "Inception"
    assert "Action" in movie["genre_list"]


def test_get_movie_404(client):
    """Test 404 response for non-existent movie."""
    response = client.get("/api/movies/999999")
    assert response.status_code == 404


def test_get_genres(client):
    """Test listing available genres."""
    response = client.get("/api/genres")
    assert response.status_code == 200
    genres = response.json()
    assert "Sci-Fi" in genres
    assert "Action" in genres
    assert "Drama" in genres


def test_rating_crud_flow(client):
    """Test creating, updating, retrieving, and deleting a movie rating."""
    # 1. Create rating
    payload = {"user_id": 6, "movie_id": 10, "rating": 4.5}
    create_resp = client.post("/api/ratings", json=payload)
    assert create_resp.status_code == 200
    data = create_resp.json()
    assert data["rating"] == 4.5
    assert data["movie_id"] == 10

    # 2. Update rating (same user & movie)
    update_payload = {"user_id": 6, "movie_id": 10, "rating": 5.0}
    update_resp = client.post("/api/ratings", json=update_payload)
    assert update_resp.status_code == 200
    assert update_resp.json()["rating"] == 5.0

    # 3. Retrieve user ratings
    list_resp = client.get("/api/ratings/6")
    assert list_resp.status_code == 200
    ratings = list_resp.json()
    assert any(r["movie_id"] == 10 and r["rating"] == 5.0 for r in ratings)

    # 4. Delete rating
    del_resp = client.delete("/api/ratings/6/10")
    assert del_resp.status_code == 200

    # Verify deleted
    verify_resp = client.get("/api/ratings/6")
    ratings_after = verify_resp.json()
    assert not any(r["movie_id"] == 10 for r in ratings_after)


def test_favorites_crud_flow(client):
    """Test adding, retrieving, and removing a favorite movie."""
    # 1. Add favorite
    add_resp = client.post("/api/favorites", json={"user_id": 6, "movie_id": 1})
    assert add_resp.status_code == 200

    # 2. Retrieve favorites
    get_resp = client.get("/api/favorites/6")
    assert get_resp.status_code == 200
    favs = get_resp.json()
    assert any(f["movie_id"] == 1 for f in favs)

    # 3. Delete favorite
    del_resp = client.delete("/api/favorites/6/1")
    assert del_resp.status_code == 200

    # Verify deleted
    get_after = client.get("/api/favorites/6")
    assert not any(f["movie_id"] == 1 for f in get_after.json())


def test_user_preferences_flow(client):
    """Test setting and retrieving user favorite genres."""
    pref_payload = {"user_id": 6, "favorite_genres": ["Sci-Fi", "Animation", "Comedy"]}
    post_resp = client.post("/api/preferences", json=pref_payload)
    assert post_resp.status_code == 200
    assert post_resp.json()["favorite_genres"] == ["Sci-Fi", "Animation", "Comedy"]

    get_resp = client.get("/api/preferences/6")
    assert get_resp.status_code == 200
    assert get_resp.json()["favorite_genres"] == ["Sci-Fi", "Animation", "Comedy"]


def test_recommendations_endpoint(client):
    """Test personalized recommendations endpoint."""
    resp = client.get("/api/recommendations/1?limit=6")
    assert resp.status_code == 200
    data = resp.json()
    assert "recommendations" in data
    assert len(data["recommendations"]) > 0
    assert "algorithm_used" in data
    assert all("explanation" in item for item in data["recommendations"])


def test_similar_movies_endpoint(client):
    """Test similar movies endpoint."""
    resp = client.get("/api/recommendations/1/similar/1?limit=5")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) > 0
    assert all(item["movie"]["id"] != 1 for item in data)


def test_user_stats_endpoint(client):
    """Test statistics endpoint for chart generation."""
    resp = client.get("/api/stats/1")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_ratings"] > 0
    assert "rating_distribution" in data
    assert "top_genres" in data
