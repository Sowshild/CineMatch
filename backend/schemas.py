from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


# User Schemas
class UserBase(BaseModel):
    username: str = Field(..., min_length=2, max_length=50)
    name: str = Field(..., min_length=1, max_length=100)
    email: Optional[str] = None
    avatar: Optional[str] = None


class UserCreate(UserBase):
    password: Optional[str] = None


class UserRegister(BaseModel):
    username: str = Field(..., min_length=2, max_length=50)
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=6, max_length=100)
    avatar: Optional[str] = None


class UserLogin(BaseModel):
    login_id: str = Field(..., min_length=2, max_length=100, description="Username or email")
    password: str = Field(..., min_length=1, max_length=100)


class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    avatar: Optional[str] = None


class UserResponse(UserBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# Movie Schemas
class MovieBase(BaseModel):
    title: str
    release_year: Optional[int] = None
    genres: str
    industry: Optional[str] = "Hollywood"
    director: Optional[str] = None
    cast: Optional[str] = None
    overview: Optional[str] = None
    poster_url: Optional[str] = None
    backdrop_url: Optional[str] = None
    video_url: Optional[str] = None
    stream_url: Optional[str] = None
    vote_average: float = 0.0
    vote_count: int = 0


class MovieResponse(MovieBase):
    id: int
    genre_list: List[str] = []
    user_rating: Optional[float] = None
    is_favorite: Optional[bool] = False
    model_config = ConfigDict(from_attributes=True)


class MovieListResponse(BaseModel):
    items: List[MovieResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# Rating Schemas
class RatingCreate(BaseModel):
    user_id: int
    movie_id: int
    rating: float = Field(..., ge=0.5, le=5.0, description="Rating between 0.5 and 5.0 stars")


class RatingResponse(BaseModel):
    id: int
    user_id: int
    movie_id: int
    rating: float
    created_at: datetime
    updated_at: datetime
    movie: Optional[MovieResponse] = None
    model_config = ConfigDict(from_attributes=True)


# Review Schemas
class ReviewCreate(BaseModel):
    user_id: int
    comment: str = Field(..., min_length=2, max_length=2000)
    rating: Optional[float] = Field(None, ge=1.0, le=5.0)


class ReviewResponse(BaseModel):
    id: int
    user_id: int
    movie_id: int
    comment: str
    rating: Optional[float] = None
    created_at: datetime
    user_name: Optional[str] = None
    user_avatar: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


# User Preferences Schemas
class PreferencesCreate(BaseModel):
    user_id: int
    favorite_genres: List[str] = Field(..., min_length=1, description="List of favorite genre names")


class PreferencesResponse(BaseModel):
    user_id: int
    favorite_genres: List[str]
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


# Favorite Schemas
class FavoriteCreate(BaseModel):
    user_id: int
    movie_id: int


class FavoriteResponse(BaseModel):
    id: int
    user_id: int
    movie_id: int
    created_at: datetime
    movie: Optional[MovieResponse] = None
    model_config = ConfigDict(from_attributes=True)


# Recommendation Schemas
class RecommendationItem(BaseModel):
    movie: MovieResponse
    score: float
    algorithm: str  # "content", "collaborative", "hybrid", "popular"
    explanation: str


class RecommendationsResponse(BaseModel):
    user_id: int
    algorithm_used: str  # "hybrid", "content", "collaborative", "popular_fallback"
    count: int
    recommendations: List[RecommendationItem]


# User Stats Schema (for Recharts)
class RatingCountByScore(BaseModel):
    stars: float
    count: int


class GenreDistribution(BaseModel):
    genre: str
    count: int


class UserStatsResponse(BaseModel):
    user_id: int
    total_ratings: int
    average_rating: float
    total_favorites: int
    rating_distribution: List[RatingCountByScore]
    top_genres: List[GenreDistribution]
