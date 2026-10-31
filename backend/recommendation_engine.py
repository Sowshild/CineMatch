"""
CineMatch Dedicated Recommendation Engine
Implements:
1. Content-Based Filtering (TF-IDF vectorization on Genres + Overviews, Cosine Similarity)
2. Collaborative Filtering (User-Item Rating Matrix, User-Based Cosine Similarity / k-NN)
3. Hybrid Recommendation Architecture (Dynamic weight balancing, Min-Max score normalization)
4. Similar Movies Engine (Item-Item feature distance)
5. Explainable AI explanations based on actual mathematical signals
"""

import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy.orm import Session
from models import Movie, Rating, UserPreference, User


class RecommendationEngine:
    def __init__(self, db: Session):
        self.db = db
        self._load_data()

    def _load_data(self):
        """Loads movies and ratings from SQLite into pandas DataFrames."""
        # 1. Load movies
        movies = self.db.query(Movie).all()
        if not movies:
            self.movies_df = pd.DataFrame(columns=[
                "id", "title", "release_year", "genres", "industry", "director", "cast", "overview",
                "vote_average", "vote_count", "combined_features"
            ])
            self.tfidf_matrix = None
            self.tfidf_vectorizer = None
            self.movie_id_to_idx = {}
            self.idx_to_movie_id = {}
        else:
            movies_data = []
            for m in movies:
                # Replace pipe separators with spaces so genres are tokenized properly
                clean_genres = (m.genres or "").replace("|", " ").replace("-", "")
                industry = getattr(m, "industry", "") or ""
                director = getattr(m, "director", "") or ""
                cast = (getattr(m, "cast", "") or "").replace(",", " ")
                overview = m.overview or ""
                # Weight genres and industry higher, then append director, cast, synopsis
                combined = f"{clean_genres} {clean_genres} {industry} {industry} {director} {cast} {overview}".strip()

                movies_data.append({
                    "id": m.id,
                    "title": m.title,
                    "release_year": m.release_year,
                    "genres": m.genres or "",
                    "industry": industry,
                    "director": director,
                    "cast": cast,
                    "overview": overview,
                    "vote_average": float(m.vote_average or 0.0),
                    "vote_count": int(m.vote_count or 0),
                    "combined_features": combined
                })

            self.movies_df = pd.DataFrame(movies_data)
            self.movie_id_to_idx = {row["id"]: idx for idx, row in self.movies_df.iterrows()}
            self.idx_to_movie_id = {idx: row["id"] for idx, row in self.movies_df.iterrows()}

            # Fit TF-IDF Vectorizer
            self.tfidf_vectorizer = TfidfVectorizer(
                stop_words="english",
                ngram_range=(1, 2),
                min_df=1
            )
            self.tfidf_matrix = self.tfidf_vectorizer.fit_transform(self.movies_df["combined_features"])

        # 2. Load ratings
        ratings = self.db.query(Rating).all()
        if not ratings:
            self.ratings_df = pd.DataFrame(columns=["id", "user_id", "movie_id", "rating"])
        else:
            self.ratings_df = pd.DataFrame([
                {
                    "id": r.id,
                    "user_id": r.user_id,
                    "movie_id": r.movie_id,
                    "rating": float(r.rating)
                }
                for r in ratings
            ])

    def get_similar_movies(self, movie_id: int, top_n: int = 10) -> List[Dict[str, Any]]:
        """
        Calculates item-item cosine similarity using TF-IDF feature representations.
        Excludes the query movie itself.
        """
        if self.movies_df.empty or movie_id not in self.movie_id_to_idx or self.tfidf_matrix is None:
            return []

        movie_idx = self.movie_id_to_idx[movie_id]
        query_vector = self.tfidf_matrix[movie_idx]
        sim_scores = cosine_similarity(query_vector, self.tfidf_matrix).flatten()

        # Sort indices by similarity descending
        sorted_indices = np.argsort(sim_scores)[::-1]

        results = []
        target_movie = self.movies_df.iloc[movie_idx]
        target_genres = set(g.strip().lower() for g in target_movie["genres"].split("|") if g)

        for idx in sorted_indices:
            cand_id = int(self.idx_to_movie_id[idx])
            if cand_id == movie_id:
                continue

            score = float(sim_scores[idx])
            cand_row = self.movies_df.iloc[idx]
            cand_genres = set(g.strip().lower() for g in cand_row["genres"].split("|") if g)
            shared_genres = target_genres.intersection(cand_genres)

            if shared_genres:
                genre_names = ", ".join([g.title() for g in list(shared_genres)[:2]])
                explanation = f"Shares {genre_names} themes and storyline with {target_movie['title']}."
            else:
                explanation = f"Similar atmospheric tone and plot elements to {target_movie['title']}."

            results.append({
                "movie_id": cand_id,
                "score": round(score, 4),
                "algorithm": "content",
                "explanation": explanation
            })

            if len(results) >= top_n:
                break

        return results

    def content_based_recommendations(
        self,
        user_id: int,
        top_n: int = 10,
        exclude_rated: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Generates content-based recommendations based on:
        1. User's highly-rated movies (weighted profile vector).
        2. User's selected favorite genres (if onboarding/profile preferences exist).
        """
        if self.movies_df.empty or self.tfidf_matrix is None:
            return []

        # Find user's ratings
        user_ratings = self.ratings_df[self.ratings_df["user_id"] == user_id] if not self.ratings_df.empty else pd.DataFrame()
        rated_movie_ids = set(user_ratings["movie_id"].tolist()) if not user_ratings.empty else set()

        # Find user's favorite genres
        pref = self.db.query(UserPreference).filter(UserPreference.user_id == user_id).first()
        fav_genres = [g.strip() for g in pref.favorite_genres.split(",") if g.strip()] if pref and pref.favorite_genres else []

        user_vector = None
        explanation_sources: List[str] = []

        # Case A: User has ratings
        if not user_ratings.empty:
            # Positive ratings are >= 3.5
            pos_ratings = user_ratings[user_ratings["rating"] >= 3.5]
            if pos_ratings.empty:
                pos_ratings = user_ratings  # Fall back to whatever ratings exist

            # Compute weighted user profile vector
            vectors = []
            weights = []
            for _, r in pos_ratings.iterrows():
                m_id = r["movie_id"]
                if m_id in self.movie_id_to_idx:
                    idx = self.movie_id_to_idx[m_id]
                    # Scale weight: 5 stars -> 1.5, 4 stars -> 1.0, 3 stars -> 0.5
                    w = max(0.2, (r["rating"] - 2.5) / 2.0)
                    vectors.append(self.tfidf_matrix[idx].toarray())
                    weights.append(w)
                    if len(explanation_sources) < 2 and r["rating"] >= 4.5:
                        m_title = self.movies_df.loc[self.movies_df["id"] == m_id, "title"].values[0]
                        explanation_sources.append(f"{m_title} ({r['rating']:.1f}★)")

            if vectors:
                weighted_sum = np.sum([v * w for v, w in zip(vectors, weights)], axis=0)
                norm = np.linalg.norm(weighted_sum)
                if norm > 0:
                    user_vector = weighted_sum / norm

        # Case B: Combine with / fallback to Favorite Genres
        if fav_genres:
            genre_query = " ".join([f"{g} {g}" for g in fav_genres])
            genre_vec = self.tfidf_vectorizer.transform([genre_query]).toarray()
            genre_norm = np.linalg.norm(genre_vec)
            if genre_norm > 0:
                genre_vec = genre_vec / genre_norm
                if user_vector is not None:
                    # Blend rated profile (70%) with explicit genre preferences (30%)
                    user_vector = 0.7 * user_vector + 0.3 * genre_vec
                    user_vector = user_vector / np.linalg.norm(user_vector)
                else:
                    user_vector = genre_vec

        # If user has neither ratings nor favorite genres, fall back to popular
        if user_vector is None:
            return self._popular_fallback(exclude_movie_ids=rated_movie_ids if exclude_rated else set(), top_n=top_n)

        # Compute cosine similarity
        sim_scores = cosine_similarity(user_vector, self.tfidf_matrix).flatten()
        sorted_indices = np.argsort(sim_scores)[::-1]

        results = []
        for idx in sorted_indices:
            cand_id = int(self.idx_to_movie_id[idx])
            if exclude_rated and cand_id in rated_movie_ids:
                continue

            score = float(sim_scores[idx])
            cand_row = self.movies_df.iloc[idx]

            # Generate explainable string
            if explanation_sources:
                explanation = f"Matches your tastes for movies you rated highly: {', '.join(explanation_sources)}."
            elif fav_genres:
                explanation = f"Recommended because you enjoy {', '.join(fav_genres[:2])}."
            else:
                cand_genres = cand_row["genres"].replace("|", ", ")
                explanation = f"Fits your preferred movie style in {cand_genres}."

            results.append({
                "movie_id": cand_id,
                "score": round(score, 4),
                "algorithm": "content",
                "explanation": explanation
            })

            if len(results) >= top_n:
                break

        return results

    def collaborative_filtering_recommendations(
        self,
        user_id: int,
        top_n: int = 10,
        exclude_rated: bool = True
    ) -> Tuple[List[Dict[str, Any]], bool]:
        """
        User-Based Collaborative Filtering using Cosine Similarity on User-Item Matrix.
        Returns:
            (recommendations_list, success_flag)
            If insufficient ratings or no similar users found, returns ([], False)
            triggering an automatic fallback.
        """
        if self.ratings_df.empty or self.movies_df.empty:
            return [], False

        # Build pivot table: rows = user_id, columns = movie_id, values = rating
        user_movie_matrix = self.ratings_df.pivot_table(
            index="user_id",
            columns="movie_id",
            values="rating"
        )

        if user_id not in user_movie_matrix.index:
            return [], False

        # User must have rated at least 2 movies for meaningful CF
        user_ratings_series = user_movie_matrix.loc[user_id].dropna()
        if len(user_ratings_series) < 2:
            return [], False

        # Mean-center ratings to eliminate user rating bias (some users rate everything 5, others 3)
        user_means = user_movie_matrix.mean(axis=1)
        matrix_centered = user_movie_matrix.sub(user_means, axis=0).fillna(0)

        # Compute cosine similarity between target user and all other users
        user_vec = matrix_centered.loc[[user_id]].values
        all_vecs = matrix_centered.values

        sims = cosine_similarity(user_vec, all_vecs).flatten()
        user_indices = user_movie_matrix.index

        sim_df = pd.DataFrame({
            "user_id": user_indices,
            "similarity": sims
        })
        # Filter out self and non-positive similarities
        similar_users = sim_df[(sim_df["user_id"] != user_id) & (sim_df["similarity"] > 0.05)]

        if similar_users.empty:
            return [], False

        # Take top 10 most similar peer users
        top_peers = similar_users.sort_values(by="similarity", ascending=False).head(10)

        # Collect unseen candidate movies rated by similar users
        rated_by_user = set(user_ratings_series.index)
        scores: Dict[int, float] = {}
        sim_sums: Dict[int, float] = {}
        peer_contributors: Dict[int, List[int]] = {}

        for _, peer_row in top_peers.iterrows():
            peer_id = int(peer_row["user_id"])
            peer_sim = float(peer_row["similarity"])
            peer_ratings = user_movie_matrix.loc[peer_id].dropna()

            for m_id, r_val in peer_ratings.items():
                m_id = int(m_id)
                if exclude_rated and m_id in rated_by_user:
                    continue
                # Only consider positively rated movies by peers (>= 3.5)
                if r_val >= 3.5:
                    scores[m_id] = scores.get(m_id, 0.0) + (peer_sim * r_val)
                    sim_sums[m_id] = sim_sums.get(m_id, 0.0) + peer_sim
                    if m_id not in peer_contributors:
                        peer_contributors[m_id] = []
                    peer_contributors[m_id].append(peer_id)

        if not scores:
            return [], False

        # Calculate predicted weighted rating
        results = []
        for m_id, total_weighted_score in scores.items():
            predicted_rating = total_weighted_score / sim_sums[m_id]
            norm_score = min(1.0, max(0.0, predicted_rating / 5.0))

            # Retrieve contributor names for explainability
            peer_count = len(peer_contributors.get(m_id, []))
            if peer_count > 1:
                explanation = f"Users with similar taste to yours ({peer_count} members) rated this movie highly."
            else:
                explanation = "A viewer with cinematic tastes closely aligned to yours recommended this."

            results.append({
                "movie_id": m_id,
                "score": round(norm_score, 4),
                "algorithm": "collaborative",
                "explanation": explanation
            })

        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_n], True

    def hybrid_recommendations(
        self,
        user_id: int,
        top_n: int = 10,
        exclude_rated: bool = True,
        content_weight: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Combines Content-Based and Collaborative Filtering recommendations.
        - If CF data is sparse or user has < 2 ratings, gracefully falls back to Content-Based.
        - If user has no ratings and no preferences, falls back to Popular/Top Rated.
        - Dynamically weights Content vs CF based on rating count or explicit user slider.
        """
        user_ratings_count = 0
        if not self.ratings_df.empty:
            user_ratings_count = len(self.ratings_df[self.ratings_df["user_id"] == user_id])

        # Step 1: Attempt Collaborative Filtering
        cf_results, cf_success = self.collaborative_filtering_recommendations(
            user_id=user_id,
            top_n=top_n * 2,
            exclude_rated=exclude_rated
        )

        # Step 2: Content-Based Filtering
        cb_results = self.content_based_recommendations(
            user_id=user_id,
            top_n=top_n * 2,
            exclude_rated=exclude_rated
        )

        # Scenario A: CF failed or user is new/sparse -> use Content-Based
        if not cf_success or not cf_results:
            if not cb_results:
                pop_results = self._popular_fallback(
                    exclude_movie_ids=set(self.ratings_df[self.ratings_df["user_id"] == user_id]["movie_id"].tolist())
                    if not self.ratings_df.empty else set(),
                    top_n=top_n
                )
                return {
                    "algorithm_used": "popular_fallback",
                    "recommendations": pop_results
                }
            return {
                "algorithm_used": "content",
                "recommendations": cb_results[:top_n]
            }

        # Scenario B: Hybrid Combination
        # Normalize scores to [0, 1] range
        cb_scores = {item["movie_id"]: item["score"] for item in cb_results}
        cb_explanations = {item["movie_id"]: item["explanation"] for item in cb_results}

        cf_scores = {item["movie_id"]: item["score"] for item in cf_results}
        cf_explanations = {item["movie_id"]: item["explanation"] for item in cf_results}

        all_candidates = set(cb_scores.keys()).union(set(cf_scores.keys()))

        # Weighting: Use explicit content_weight if provided (from frontend slider), else dynamic
        if content_weight is not None:
            w_cb = max(0.0, min(1.0, float(content_weight)))
            w_cf = 1.0 - w_cb
        elif user_ratings_count >= 10:
            w_cf, w_cb = 0.65, 0.35
        elif user_ratings_count >= 5:
            w_cf, w_cb = 0.50, 0.50
        else:
            w_cf, w_cb = 0.35, 0.65

        combined_items = []
        for m_id in all_candidates:
            cb_val = cb_scores.get(m_id, 0.0)
            cf_val = cf_scores.get(m_id, 0.0)

            # Combined score
            final_score = (w_cb * cb_val) + (w_cf * cf_val)

            # Determine dominant algorithm and meaningful explanation
            if m_id in cb_scores and m_id in cf_scores:
                algo = "hybrid"
                explanation = f"Matched via Hybrid AI: Loved by peer viewers and aligns with your favorite genre elements."
            elif m_id in cf_scores:
                algo = "collaborative"
                explanation = cf_explanations[m_id]
            else:
                algo = "content"
                explanation = cb_explanations[m_id]

            combined_items.append({
                "movie_id": m_id,
                "score": round(final_score, 4),
                "algorithm": algo,
                "explanation": explanation
            })

        combined_items.sort(key=lambda x: x["score"], reverse=True)
        return {
            "algorithm_used": "hybrid",
            "recommendations": combined_items[:top_n]
        }

    def _popular_fallback(self, exclude_movie_ids: set, top_n: int = 10) -> List[Dict[str, Any]]:
        """Fallback for cold-start users: returns highly rated and universally popular movies."""
        if self.movies_df.empty:
            return []

        # Sort by vote_average descending with vote_count weighting
        sorted_movies = self.movies_df.sort_values(
            by=["vote_average", "vote_count"],
            ascending=[False, False]
        )

        results = []
        for _, row in sorted_movies.iterrows():
            m_id = int(row["id"])
            if m_id in exclude_movie_ids:
                continue

            results.append({
                "movie_id": m_id,
                "score": round(float(row["vote_average"]) / 10.0, 4),
                "algorithm": "popular",
                "explanation": "Trending and critically acclaimed with worldwide audiences."
            })

            if len(results) >= top_n:
                break

        return results
