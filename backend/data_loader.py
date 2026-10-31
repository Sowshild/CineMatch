"""
Data Loader Module for CineMatch
Handles automatic database initialization, seeding with sample movies/ratings,
and optional MovieLens dataset ingestion.
"""

import os
import csv
from sqlalchemy.orm import Session
from database import engine, Base
from models import User, Movie, Rating, UserPreference, Favorite, Review
from seed_data import SEED_MOVIES, SEED_USERS, SEED_RATINGS, SEED_FAVORITES, SEED_REVIEWS


def init_db():
    """Create all database tables if they do not exist."""
    Base.metadata.create_all(bind=engine)


def seed_database(db: Session, force_reset: bool = False):
    """
    Seeds the database with curated movies, demo users, user preferences,
    sample ratings, initial favorites, and community reviews.
    """
    init_db()

    # Check if movies already exist
    existing_movies_count = db.query(Movie).count()
    if existing_movies_count > 0 and not force_reset:
        return {
            "status": "already_seeded",
            "movies_count": existing_movies_count,
            "users_count": db.query(User).count(),
            "ratings_count": db.query(Rating).count(),
            "reviews_count": db.query(Review).count()
        }

    if force_reset:
        # Clear existing records
        db.query(Review).delete()
        db.query(Favorite).delete()
        db.query(UserPreference).delete()
        db.query(Rating).delete()
        db.query(Movie).delete()
        db.query(User).delete()
        db.commit()

    # 1. Insert Movies
    for movie_dict in SEED_MOVIES:
        movie = Movie(
            id=movie_dict["id"],
            title=movie_dict["title"],
            release_year=movie_dict.get("release_year"),
            genres=movie_dict["genres"],
            industry=movie_dict.get("industry", "Hollywood"),
            director=movie_dict.get("director"),
            cast=movie_dict.get("cast"),
            overview=movie_dict.get("overview"),
            poster_url=movie_dict.get("poster_url"),
            backdrop_url=movie_dict.get("backdrop_url"),
            video_url=movie_dict.get("video_url"),
            stream_url=movie_dict.get("stream_url"),
            vote_average=movie_dict.get("vote_average", 0.0),
            vote_count=movie_dict.get("vote_count", 0)
        )
        db.add(movie)
    db.commit()

    # 2. Insert Users and their Preferences
    for user_dict in SEED_USERS:
        user = User(
            id=user_dict["id"],
            username=user_dict["username"],
            name=user_dict["name"],
            avatar=user_dict.get("avatar")
        )
        db.add(user)
        db.commit()

        # Add initial preferences
        fav_genres = user_dict.get("favorite_genres", [])
        if fav_genres:
            pref = UserPreference(
                user_id=user.id,
                favorite_genres=",".join(fav_genres)
            )
            db.add(pref)
    db.commit()

    # 3. Insert Ratings
    for rating_dict in SEED_RATINGS:
        rating = Rating(
            user_id=rating_dict["user_id"],
            movie_id=rating_dict["movie_id"],
            rating=rating_dict["rating"]
        )
        db.add(rating)
    db.commit()

    # 4. Insert Favorites
    for fav_dict in SEED_FAVORITES:
        fav = Favorite(
            user_id=fav_dict["user_id"],
            movie_id=fav_dict["movie_id"]
        )
        db.add(fav)
    db.commit()

    # 5. Insert Community Reviews
    for rev_dict in SEED_REVIEWS:
        rev = Review(
            user_id=rev_dict["user_id"],
            movie_id=rev_dict["movie_id"],
            rating=rev_dict.get("rating"),
            comment=rev_dict["comment"]
        )
        db.add(rev)
    db.commit()

    return {
        "status": "seeded_successfully",
        "movies_count": len(SEED_MOVIES),
        "users_count": len(SEED_USERS),
        "ratings_count": len(SEED_RATINGS),
        "favorites_count": len(SEED_FAVORITES),
        "reviews_count": len(SEED_REVIEWS)
    }


def import_movielens_csv(db: Session, movies_csv_path: str, ratings_csv_path: str, max_movies: int = 500):
    """
    Optional helper to import standard MovieLens small dataset files (movies.csv and ratings.csv).
    """
    if not os.path.exists(movies_csv_path) or not os.path.exists(ratings_csv_path):
        raise FileNotFoundError(f"MovieLens CSV files not found at {movies_csv_path} or {ratings_csv_path}")

    import re

    # Ingest movies
    movie_id_map = {}
    with open(movies_csv_path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        count = 0
        for row in reader:
            if count >= max_movies:
                break
            raw_id = int(row["movieId"])
            raw_title = row["title"]
            genres = row["genres"]

            # Parse year from title
            year_match = re.search(r"\((\d{4})\)", raw_title)
            year = int(year_match.group(1)) if year_match else None
            clean_title = re.sub(r"\s*\(\d{4}\)", "", raw_title).strip()

            movie = Movie(
                id=raw_id,
                title=clean_title,
                release_year=year,
                genres=genres,
                industry="Hollywood",
                overview=f"MovieLens dataset entry: {clean_title} ({year or 'N/A'}).",
                poster_url=None,
                vote_average=3.5,
                vote_count=10
            )
            db.merge(movie)
            movie_id_map[raw_id] = True
            count += 1
    db.commit()

    # Ingest ratings
    with open(ratings_csv_path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            m_id = int(row["movieId"])
            if m_id in movie_id_map:
                u_id = int(row["userId"])
                user = db.query(User).filter(User.id == u_id).first()
                if not user:
                    user = User(id=u_id, username=f"movielens_user_{u_id}", name=f"User {u_id}")
                    db.add(user)
                    db.commit()

                rating = Rating(
                    user_id=u_id,
                    movie_id=m_id,
                    rating=float(row["rating"])
                )
                db.merge(rating)
    db.commit()
