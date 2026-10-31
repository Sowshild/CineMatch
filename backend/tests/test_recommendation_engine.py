"""
Unit and Integration Tests for CineMatch Recommendation Engine
"""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from database import Base
from models import User, Movie, Rating, UserPreference, Favorite
from seed_data import SEED_MOVIES, SEED_USERS, SEED_RATINGS
from recommendation_engine import RecommendationEngine


@pytest.fixture(scope="function")
def test_db():
    """In-memory SQLite database for isolated test execution."""
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    # Populate movies
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

    # Populate test users & preferences
    test_users = [
        {"id": 1, "username": "alex", "name": "Alex", "favorite_genres": ["Sci-Fi", "Action"]},
        {"id": 5, "username": "jordan", "name": "Jordan", "favorite_genres": ["Sci-Fi", "Drama"]},
        {"id": 6, "username": "newbie", "name": "Newbie", "favorite_genres": ["Animation", "Comedy"]}
    ]
    for u in test_users:
        db.add(User(
            id=u["id"],
            username=u["username"],
            name=u["name"],
            avatar="https://api.dicebear.com/7.x/bottts/svg?seed=" + u["username"]
        ))
        fav_genres = u.get("favorite_genres", [])
        if fav_genres:
            db.add(UserPreference(
                user_id=u["id"],
                favorite_genres=",".join(fav_genres)
            ))

    # Populate test ratings for collaborative and content testing
    test_ratings = [
        {"user_id": 1, "movie_id": 1, "rating": 5.0},
        {"user_id": 1, "movie_id": 2, "rating": 4.5},
        {"user_id": 1, "movie_id": 3, "rating": 4.5},
        {"user_id": 5, "movie_id": 1, "rating": 5.0},
        {"user_id": 5, "movie_id": 2, "rating": 5.0},
        {"user_id": 5, "movie_id": 21, "rating": 5.0},
        {"user_id": 5, "movie_id": 41, "rating": 4.5}
    ]
    for r in test_ratings:
        db.add(Rating(
            user_id=r["user_id"],
            movie_id=r["movie_id"],
            rating=r["rating"]
        ))

    db.commit()
    yield db
    db.close()


def test_similar_movies_computation(test_db):
    """Test item-item similarity using Inception (movie_id=1)."""
    engine = RecommendationEngine(test_db)
    similars = engine.get_similar_movies(movie_id=1, top_n=5)

    assert len(similars) > 0
    # Inception must not be returned in its own similarity list
    assert all(item["movie_id"] != 1 for item in similars)
    # Scores must be descending
    scores = [item["score"] for item in similars]
    assert scores == sorted(scores, reverse=True)
    # Explanations must be non-empty and meaningful
    assert all(len(item["explanation"]) > 5 for item in similars)


def test_content_based_recommendations_alex(test_db):
    """Test content-based recommendations for User 1 (Alex - Sci-Fi fan)."""
    engine = RecommendationEngine(test_db)
    recs = engine.content_based_recommendations(user_id=1, top_n=10, exclude_rated=True)

    assert len(recs) <= 10
    # Exclude movies Alex already rated
    rated_ids = {r.movie_id for r in test_db.query(Rating).filter(Rating.user_id == 1).all()}
    for item in recs:
        assert item["movie_id"] not in rated_ids
        assert item["algorithm"] == "content"
        assert len(item["explanation"]) > 0


def test_collaborative_filtering_recommendations(test_db):
    """
    Test collaborative filtering for User 1 (Alex).
    User 5 (Jordan) has strong overlap with User 1 and highly rated Dune: Part Two (id 21) & The Prestige (id 41).
    """
    engine = RecommendationEngine(test_db)
    recs, success = engine.collaborative_filtering_recommendations(user_id=1, top_n=5, exclude_rated=True)

    assert success is True
    assert len(recs) > 0
    # Dune: Part Two or The Prestige should be suggested because Jordan gave them high marks
    rec_movie_ids = [r["movie_id"] for r in recs]
    assert (21 in rec_movie_ids or 41 in rec_movie_ids or 24 in rec_movie_ids)


def test_hybrid_recommendation_ranking(test_db):
    """Test hybrid recommendation combining content and collaborative signals."""
    engine = RecommendationEngine(test_db)
    result = engine.hybrid_recommendations(user_id=1, top_n=10, exclude_rated=True)

    assert "algorithm_used" in result
    assert result["algorithm_used"] in ["hybrid", "content"]
    recs = result["recommendations"]
    assert len(recs) > 0
    # Check normalized scores between 0 and 1
    for item in recs:
        assert 0.0 <= item["score"] <= 1.0


def test_new_user_cold_start(test_db):
    """
    Test cold-start behavior for User 6 (newbie) who has no ratings.
    Should gracefully use genre preferences if available, or popular fallback.
    """
    engine = RecommendationEngine(test_db)
    result = engine.hybrid_recommendations(user_id=6, top_n=8)

    assert len(result["recommendations"]) > 0
    assert result["algorithm_used"] in ["popular_fallback", "content"]


def test_empty_dataset_handling():
    """Test engine behavior when database has no movies or ratings."""
    empty_engine = create_engine("sqlite:///:memory:")
    Session = sessionmaker(bind=empty_engine)
    Base.metadata.create_all(bind=empty_engine)
    db = Session()

    engine = RecommendationEngine(db)
    recs = engine.get_similar_movies(movie_id=999)
    assert recs == []

    cb_recs = engine.content_based_recommendations(user_id=999)
    assert cb_recs == []

    cf_recs, success = engine.collaborative_filtering_recommendations(user_id=999)
    assert cf_recs == []
    assert success is False

    hybrid_res = engine.hybrid_recommendations(user_id=999)
    assert hybrid_res["recommendations"] == []
    db.close()
