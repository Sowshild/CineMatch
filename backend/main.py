"""
CineMatch FastAPI Application
Full-featured RESTful API for movie discovery, personalized recommendations,
ratings management, user preferences, and favorites.
"""
from dotenv import load_dotenv

load_dotenv()
from contextlib import asynccontextmanager
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, asc

from database import get_db, engine, Base
from models import User, Movie, Rating, UserPreference, Favorite, Review
from schemas import (
    MovieResponse, MovieListResponse,
    RatingCreate, RatingResponse,
    PreferencesCreate, PreferencesResponse,
    FavoriteCreate, FavoriteResponse,
    ReviewCreate, ReviewResponse,
    RecommendationsResponse, RecommendationItem,
    UserResponse, UserCreate, UserRegister, UserLogin, TokenResponse, UserProfileUpdate,
    UserStatsResponse, RatingCountByScore, GenreDistribution
)
from data_loader import seed_database
from recommendation_engine import RecommendationEngine
from auth import (
    get_password_hash, verify_password, create_access_token,
    get_current_user, get_optional_user
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes tables and seeds initial data on startup."""
    Base.metadata.create_all(bind=engine)
    from database import SessionLocal
    db = SessionLocal()
    try:
        seed_database(db, force_reset=False)
    finally:
        db.close()
    yield


app = FastAPI(
    title="CineMatch Recommendation API",
    description="Machine Learning Powered Movie Recommendation System with Content-Based, Collaborative Filtering, and Hybrid algorithms.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend development
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

import os

frontend_url = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173"
)

allowed_origins = [
    url.strip()
    for url in frontend_url.split(",")
    if url.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _enrich_movie_response(movie: Movie, user_id: Optional[int] = None, db: Optional[Session] = None) -> MovieResponse:
    """Helper to convert Movie model to MovieResponse with user state and genre list."""
    genre_list = [g.strip() for g in (movie.genres or "").split("|") if g.strip()]
    user_rating = None
    is_favorite = False

    if user_id and db:
        r = db.query(Rating).filter(Rating.user_id == user_id, Rating.movie_id == movie.id).first()
        if r:
            user_rating = r.rating
        fav = db.query(Favorite).filter(Favorite.user_id == user_id, Favorite.movie_id == movie.id).first()
        if fav:
            is_favorite = True

    return MovieResponse(
        id=movie.id,
        title=movie.title,
        release_year=movie.release_year,
        genres=movie.genres,
        genre_list=genre_list,
        industry=getattr(movie, "industry", "Hollywood") or "Hollywood",
        director=getattr(movie, "director", None),
        cast=getattr(movie, "cast", None),
        overview=movie.overview,
        poster_url=movie.poster_url,
        backdrop_url=movie.backdrop_url,
        video_url=getattr(movie, "video_url", None),
        stream_url=getattr(movie, "stream_url", None),
        vote_average=movie.vote_average or 0.0,
        vote_count=movie.vote_count or 0,
        user_rating=user_rating,
        is_favorite=is_favorite
    )


# ---------------------------------------------------------
# Authentication & User Profile Endpoints
# ---------------------------------------------------------

@app.post("/api/auth/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED, tags=["Auth"])
def register(reg_in: UserRegister, db: Session = Depends(get_db)):
    """Create a new user profile with secure credentials and return a session token."""
    username = reg_in.username.strip().lower()
    email = reg_in.email.strip().lower()

    if not username or len(username) < 2:
        raise HTTPException(status_code=400, detail="Username must be at least 2 characters long.")
    
    if "@" not in email or "." not in email:
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")

    if len(reg_in.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")

    existing_user = db.query(User).filter(User.username == username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username is already taken. Please choose another username.")

    existing_email = db.query(User).filter(User.email == email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    hashed_pw = get_password_hash(reg_in.password)
    user = User(
        username=username,
        email=email,
        name=reg_in.name.strip(),
        hashed_password=hashed_pw,
        avatar=reg_in.avatar or "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=user
    )


@app.post("/api/auth/login", response_model=TokenResponse, tags=["Auth"])
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate with username/email and password.
    Returns 404 with 'Profile not found' if account does not exist.
    """
    login_id = login_in.login_id.strip().lower()
    user = db.query(User).filter(
        (User.username == login_id) | (User.email == login_id)
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found. Please check your username/email or create a new profile."
        )

    if not user.hashed_password or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password. Please verify your credentials."
        )

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=user
    )


@app.get("/api/auth/me", response_model=UserResponse, tags=["Auth"])
def get_current_user_profile(user: User = Depends(get_current_user)):
    """Retrieve active authenticated user profile."""
    return user


@app.put("/api/auth/profile", response_model=UserResponse, tags=["Auth"])
def update_profile(
    update_in: UserProfileUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update active user profile (name, custom avatar, email)."""
    if update_in.name and update_in.name.strip():
        user.name = update_in.name.strip()
    if update_in.avatar:
        user.avatar = update_in.avatar
    if update_in.email and update_in.email.strip():
        new_email = update_in.email.strip().lower()
        conflict = db.query(User).filter(User.email == new_email, User.id != user.id).first()
        if conflict:
            raise HTTPException(status_code=400, detail="This email is already in use by another profile.")
        user.email = new_email

    db.commit()
    db.refresh(user)
    return user


@app.get("/api/users", response_model=List[UserResponse], tags=["Users"])
def get_users(db: Session = Depends(get_db)):
    """Retrieve all users."""
    return db.query(User).all()


@app.post("/api/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED, tags=["Users"])
def create_user(user_in: UserCreate, db: Session = Depends(get_db)):
    """Create a new user profile (compatible with seed & test endpoints)."""
    existing = db.query(User).filter(User.username == user_in.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    hashed_pw = get_password_hash(user_in.password or "demo123")
    user = User(
        username=user_in.username,
        email=user_in.email,
        name=user_in.name,
        hashed_password=hashed_pw,
        avatar=user_in.avatar or "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# ---------------------------------------------------------
# Movies Endpoints
# ---------------------------------------------------------

@app.get("/api/movies", response_model=MovieListResponse, tags=["Movies"])
def list_movies(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    genre: Optional[str] = None,
    industry: Optional[str] = None,
    release_year: Optional[int] = None,
    min_rating: Optional[float] = Query(None, ge=0.0, le=10.0),
    sort_by: Optional[str] = Query("popular", pattern="^(popular|rating|year_desc|year_asc|title)$"),
    user_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    List movies with pagination and rich filters (genre, industry, year, min rating, sorting).
    Optionally annotates with the requesting user's rating and favorite status.
    """
    query = db.query(Movie)

    if genre and genre.strip() and genre.lower() != "all":
        query = query.filter(Movie.genres.ilike(f"%{genre.strip()}%"))

    if industry and industry.strip() and industry.lower() != "all":
        query = query.filter(Movie.industry.ilike(f"%{industry.strip()}%"))

    if release_year:
        query = query.filter(Movie.release_year == release_year)

    if min_rating is not None:
        query = query.filter(Movie.vote_average >= min_rating)

    # Sorting
    if sort_by == "rating":
        query = query.order_by(desc(Movie.vote_average), desc(Movie.vote_count))
    elif sort_by == "year_desc":
        query = query.order_by(desc(Movie.release_year))
    elif sort_by == "year_asc":
        query = query.order_by(asc(Movie.release_year))
    elif sort_by == "title":
        query = query.order_by(asc(Movie.title))
    else:  # popular
        query = query.order_by(desc(Movie.vote_count), desc(Movie.vote_average))

    total = query.count()
    total_pages = max(1, (total + page_size - 1) // page_size)
    movies = query.offset((page - 1) * page_size).limit(page_size).all()

    items = [_enrich_movie_response(m, user_id=user_id, db=db) for m in movies]

    return MovieListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@app.get("/api/movies/search", response_model=List[MovieResponse], tags=["Movies"])
def search_movies(
    q: str = Query(..., min_length=1, description="Movie title search query"),
    user_id: Optional[int] = None,
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Search movies by title with partial substring match."""
    movies = db.query(Movie).filter(Movie.title.ilike(f"%{q.strip()}%")).limit(limit).all()
    return [_enrich_movie_response(m, user_id=user_id, db=db) for m in movies]


@app.get("/api/movies/{movie_id}", response_model=MovieResponse, tags=["Movies"])
def get_movie_details(
    movie_id: int,
    user_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get full details for a specific movie."""
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    return _enrich_movie_response(movie, user_id=user_id, db=db)


@app.get("/api/genres", response_model=List[str], tags=["Movies"])
def get_genres(db: Session = Depends(get_db)):
    """List all unique movie genres available in the database."""
    movies = db.query(Movie.genres).all()
    unique_genres = set()
    for row in movies:
        if row[0]:
            for g in row[0].split("|"):
                cleaned = g.strip()
                if cleaned:
                    unique_genres.add(cleaned)
    return sorted(list(unique_genres))


@app.get("/api/industries", response_model=List[str], tags=["Movies"])
def get_industries(db: Session = Depends(get_db)):
    """List all unique movie industries (Hollywood, Bollywood, Tollywood)."""
    movies = db.query(Movie.industry).distinct().all()
    industries = [row[0] for row in movies if row[0]]
    unique = sorted(list(set(industries)))
    return unique if unique else ["Hollywood", "Bollywood", "Tollywood"]


# ---------------------------------------------------------
# Reviews Endpoints
# ---------------------------------------------------------

@app.get("/api/movies/{movie_id}/reviews", response_model=List[ReviewResponse], tags=["Reviews"])
def get_movie_reviews(movie_id: int, db: Session = Depends(get_db)):
    """List all community reviews for a movie, ordered newest first."""
    reviews = db.query(Review).filter(Review.movie_id == movie_id).order_by(desc(Review.created_at)).all()
    results = []
    for r in reviews:
        user_name = r.user.name if r.user else "Anonymous Cinephile"
        user_avatar = r.user.avatar if r.user else None
        results.append(ReviewResponse(
            id=r.id,
            user_id=r.user_id,
            movie_id=r.movie_id,
            comment=r.comment,
            rating=r.rating,
            created_at=r.created_at,
            user_name=user_name,
            user_avatar=user_avatar
        ))
    return results


@app.post("/api/movies/{movie_id}/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED, tags=["Reviews"])
def create_movie_review(movie_id: int, review_in: ReviewCreate, db: Session = Depends(get_db)):
    """Add a review and optional star rating for a movie."""
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    user = db.query(User).filter(User.id == review_in.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_review = Review(
        user_id=review_in.user_id,
        movie_id=movie_id,
        comment=review_in.comment.strip(),
        rating=review_in.rating
    )
    db.add(new_review)

    # If rating provided, sync with Rating model
    if review_in.rating:
        existing_rating = db.query(Rating).filter(
            Rating.user_id == review_in.user_id,
            Rating.movie_id == movie_id
        ).first()
        if existing_rating:
            existing_rating.rating = review_in.rating
        else:
            db.add(Rating(user_id=review_in.user_id, movie_id=movie_id, rating=review_in.rating))

    db.commit()
    db.refresh(new_review)

    return ReviewResponse(
        id=new_review.id,
        user_id=new_review.user_id,
        movie_id=new_review.movie_id,
        comment=new_review.comment,
        rating=new_review.rating,
        created_at=new_review.created_at,
        user_name=user.name,
        user_avatar=user.avatar
    )


# ---------------------------------------------------------
# User Preferences Endpoints
# ---------------------------------------------------------

@app.post("/api/preferences", response_model=PreferencesResponse, tags=["Preferences"])
def save_preferences(pref_in: PreferencesCreate, db: Session = Depends(get_db)):
    """Save or update a user's favorite genres."""
    user = db.query(User).filter(User.id == pref_in.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    genre_str = ",".join([g.strip() for g in pref_in.favorite_genres if g.strip()])
    pref = db.query(UserPreference).filter(UserPreference.user_id == pref_in.user_id).first()

    if pref:
        pref.favorite_genres = genre_str
    else:
        pref = UserPreference(user_id=pref_in.user_id, favorite_genres=genre_str)
        db.add(pref)

    db.commit()
    db.refresh(pref)

    fav_list = [g.strip() for g in pref.favorite_genres.split(",") if g.strip()]
    return PreferencesResponse(
        user_id=pref.user_id,
        favorite_genres=fav_list,
        updated_at=pref.updated_at
    )


@app.get("/api/preferences/{user_id}", response_model=PreferencesResponse, tags=["Preferences"])
def get_preferences(user_id: int, db: Session = Depends(get_db)):
    """Retrieve saved genre preferences for a user."""
    pref = db.query(UserPreference).filter(UserPreference.user_id == user_id).first()
    if not pref:
        return PreferencesResponse(
            user_id=user_id,
            favorite_genres=[],
            updated_at=func.now()
        )
    fav_list = [g.strip() for g in pref.favorite_genres.split(",") if g.strip()]
    return PreferencesResponse(
        user_id=pref.user_id,
        favorite_genres=fav_list,
        updated_at=pref.updated_at
    )


# ---------------------------------------------------------
# Ratings Endpoints
# ---------------------------------------------------------

@app.post("/api/ratings", response_model=RatingResponse, tags=["Ratings"])
def create_or_update_rating(rating_in: RatingCreate, db: Session = Depends(get_db)):
    """Create or update a user's 1-5 star movie rating."""
    user = db.query(User).filter(User.id == rating_in.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    movie = db.query(Movie).filter(Movie.id == rating_in.movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    existing_rating = db.query(Rating).filter(
        Rating.user_id == rating_in.user_id,
        Rating.movie_id == rating_in.movie_id
    ).first()

    if existing_rating:
        existing_rating.rating = rating_in.rating
        target_rating = existing_rating
    else:
        new_rating = Rating(
            user_id=rating_in.user_id,
            movie_id=rating_in.movie_id,
            rating=rating_in.rating
        )
        db.add(new_rating)
        target_rating = new_rating

    db.commit()
    db.refresh(target_rating)

    movie_resp = _enrich_movie_response(movie, user_id=user.id, db=db)
    return RatingResponse(
        id=target_rating.id,
        user_id=target_rating.user_id,
        movie_id=target_rating.movie_id,
        rating=target_rating.rating,
        created_at=target_rating.created_at,
        updated_at=target_rating.updated_at,
        movie=movie_resp
    )


@app.get("/api/ratings/{user_id}", response_model=List[RatingResponse], tags=["Ratings"])
def get_user_ratings(user_id: int, db: Session = Depends(get_db)):
    """Retrieve all ratings given by a user."""
    ratings = db.query(Rating).filter(Rating.user_id == user_id).order_by(desc(Rating.updated_at)).all()
    results = []
    for r in ratings:
        m = db.query(Movie).filter(Movie.id == r.movie_id).first()
        m_resp = _enrich_movie_response(m, user_id=user_id, db=db) if m else None
        results.append(RatingResponse(
            id=r.id,
            user_id=r.user_id,
            movie_id=r.movie_id,
            rating=r.rating,
            created_at=r.created_at,
            updated_at=r.updated_at,
            movie=m_resp
        ))
    return results


@app.delete("/api/ratings/{user_id}/{movie_id}", status_code=status.HTTP_200_OK, tags=["Ratings"])
def delete_rating(user_id: int, movie_id: int, db: Session = Depends(get_db)):
    """Remove a rating given by a user for a movie."""
    r = db.query(Rating).filter(Rating.user_id == user_id, Rating.movie_id == movie_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Rating not found")
    db.delete(r)
    db.commit()
    return {"message": "Rating removed successfully", "user_id": user_id, "movie_id": movie_id}


# ---------------------------------------------------------
# Favorites Endpoints
# ---------------------------------------------------------

@app.post("/api/favorites", response_model=FavoriteResponse, tags=["Favorites"])
def add_favorite(fav_in: FavoriteCreate, db: Session = Depends(get_db)):
    """Add a movie to a user's Favorites."""
    user = db.query(User).filter(User.id == fav_in.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    movie = db.query(Movie).filter(Movie.id == fav_in.movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    fav = db.query(Favorite).filter(Favorite.user_id == fav_in.user_id, Favorite.movie_id == fav_in.movie_id).first()
    if not fav:
        fav = Favorite(user_id=fav_in.user_id, movie_id=fav_in.movie_id)
        db.add(fav)
        db.commit()
        db.refresh(fav)

    movie_resp = _enrich_movie_response(movie, user_id=user.id, db=db)
    return FavoriteResponse(
        id=fav.id,
        user_id=fav.user_id,
        movie_id=fav.movie_id,
        created_at=fav.created_at,
        movie=movie_resp
    )


@app.get("/api/favorites/{user_id}", response_model=List[FavoriteResponse], tags=["Favorites"])
def get_user_favorites(user_id: int, db: Session = Depends(get_db)):
    """Retrieve all favorite movies for a user."""
    favorites = db.query(Favorite).filter(Favorite.user_id == user_id).order_by(desc(Favorite.created_at)).all()
    results = []
    for f in favorites:
        m = db.query(Movie).filter(Movie.id == f.movie_id).first()
        m_resp = _enrich_movie_response(m, user_id=user_id, db=db) if m else None
        results.append(FavoriteResponse(
            id=f.id,
            user_id=f.user_id,
            movie_id=f.movie_id,
            created_at=f.created_at,
            movie=m_resp
        ))
    return results


@app.delete("/api/favorites/{user_id}/{movie_id}", status_code=status.HTTP_200_OK, tags=["Favorites"])
def remove_favorite(user_id: int, movie_id: int, db: Session = Depends(get_db)):
    """Remove a movie from a user's Favorites."""
    fav = db.query(Favorite).filter(Favorite.user_id == user_id, Favorite.movie_id == movie_id).first()
    if not fav:
        raise HTTPException(status_code=404, detail="Favorite not found")
    db.delete(fav)
    db.commit()
    return {"message": "Movie removed from favorites", "user_id": user_id, "movie_id": movie_id}


# ---------------------------------------------------------
# Recommendation Endpoints
# ---------------------------------------------------------

@app.get("/api/recommendations/{user_id}", response_model=RecommendationsResponse, tags=["Recommendations"])
def get_recommendations(
    user_id: int,
    limit: int = Query(10, ge=1, le=20),
    method: str = Query("hybrid", pattern="^(hybrid|content|collaborative)$"),
    content_weight: Optional[float] = Query(None, ge=0.0, le=1.0),
    db: Session = Depends(get_db)
):
    """
    Get personalized movie recommendations for a user.
    Supports:
    - method=hybrid: Blends Content-Based and Collaborative Filtering (optional content_weight 0.0 - 1.0)
    - method=content: Recommends based on genre preferences & rated movie features
    - method=collaborative: Recommends based on similar users' ratings (with fallback)
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    engine = RecommendationEngine(db)

    if method == "content":
        recs = engine.content_based_recommendations(user_id=user_id, top_n=limit)
        algo_used = "content"
    elif method == "collaborative":
        recs, success = engine.collaborative_filtering_recommendations(user_id=user_id, top_n=limit)
        if not success:
            recs = engine.content_based_recommendations(user_id=user_id, top_n=limit)
            algo_used = "content_fallback"
        else:
            algo_used = "collaborative"
    else:  # hybrid
        result_dict = engine.hybrid_recommendations(user_id=user_id, top_n=limit, content_weight=content_weight)
        recs = result_dict["recommendations"]
        algo_used = result_dict["algorithm_used"]

    # Enrich recommendation items with movie details
    enriched_items = []
    for item in recs:
        m = db.query(Movie).filter(Movie.id == item["movie_id"]).first()
        if m:
            m_resp = _enrich_movie_response(m, user_id=user_id, db=db)
            enriched_items.append(RecommendationItem(
                movie=m_resp,
                score=item["score"],
                algorithm=item["algorithm"],
                explanation=item["explanation"]
            ))

    return RecommendationsResponse(
        user_id=user_id,
        algorithm_used=algo_used,
        count=len(enriched_items),
        recommendations=enriched_items
    )


@app.get("/api/recommendations/{user_id}/similar/{movie_id}", response_model=List[RecommendationItem], tags=["Recommendations"])
def get_similar_movies_endpoint(
    user_id: int,
    movie_id: int,
    limit: int = Query(6, ge=1, le=15),
    db: Session = Depends(get_db)
):
    """
    Get movies similar to a specified movie based on TF-IDF cosine similarity
    of genre tags and plot descriptions.
    """
    target_movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not target_movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    engine = RecommendationEngine(db)
    similars = engine.get_similar_movies(movie_id=movie_id, top_n=limit)

    results = []
    for item in similars:
        m = db.query(Movie).filter(Movie.id == item["movie_id"]).first()
        if m:
            m_resp = _enrich_movie_response(m, user_id=user_id, db=db)
            results.append(RecommendationItem(
                movie=m_resp,
                score=item["score"],
                algorithm=item["algorithm"],
                explanation=item["explanation"]
            ))
    return results


# ---------------------------------------------------------
# User Statistics Endpoints (for Recharts)
# ---------------------------------------------------------

@app.get("/api/stats/{user_id}", response_model=UserStatsResponse, tags=["Stats"])
def get_user_stats(user_id: int, db: Session = Depends(get_db)):
    """Retrieve rating statistics and genre breakdown for visualization."""
    ratings = db.query(Rating).filter(Rating.user_id == user_id).all()
    fav_count = db.query(Favorite).filter(Favorite.user_id == user_id).count()

    total_ratings = len(ratings)
    avg_rating = round(sum(r.rating for r in ratings) / total_ratings, 2) if total_ratings > 0 else 0.0

    # Star distribution from 1 to 5 stars
    dist_map = {1.0: 0, 2.0: 0, 3.0: 0, 4.0: 0, 5.0: 0}
    for r in ratings:
        # Round to nearest integer for histogram
        star_key = float(round(r.rating))
        if star_key in dist_map:
            dist_map[star_key] += 1
        elif star_key < 1.0:
            dist_map[1.0] += 1
        else:
            dist_map[5.0] += 1

    distribution_list = [
        RatingCountByScore(stars=k, count=v)
        for k, v in sorted(dist_map.items())
    ]

    # Genre frequency among rated movies
    genre_freq = {}
    for r in ratings:
        m = db.query(Movie).filter(Movie.id == r.movie_id).first()
        if m and m.genres:
            for g in m.genres.split("|"):
                g_clean = g.strip()
                if g_clean:
                    genre_freq[g_clean] = genre_freq.get(g_clean, 0) + 1

    top_genres = [
        GenreDistribution(genre=k, count=v)
        for k, v in sorted(genre_freq.items(), key=lambda x: x[1], reverse=True)[:6]
    ]

    return UserStatsResponse(
        user_id=user_id,
        total_ratings=total_ratings,
        average_rating=avg_rating,
        total_favorites=fav_count,
        rating_distribution=distribution_list,
        top_genres=top_genres
    )


# @app.post("/api/reset-data", tags=["Maintenance"])
# def reset_seed_data(db: Session = Depends(get_db)):
#     """Reset database to default seed movies, demo users, and ratings."""
#     res = seed_database(db, force_reset=True)
#     return res
