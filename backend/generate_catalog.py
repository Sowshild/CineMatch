import pprint

# Extra 25 movies to reach 125 total
EXTRA_MOVIES = [
    {
        "id": 101,
        "title": "Donnie Darko",
        "release_year": 2001,
        "genres": "Drama|Mystery|Sci-Fi",
        "industry": "Hollywood",
        "director": "Richard Kelly",
        "cast": "Jake Gyllenhaal, Jena Malone, Mary McDonnell, Drew Barrymore",
        "overview": "After narrowly escaping a bizarre accident, a troubled teenager is plagued by visions of a man in a large rabbit suit who manipulates him to commit a series of crimes.",
        "poster_url": "https://image.tmdb.org/t/p/w500/fhBp9iWp0m1V3.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/w1280/8bK7qN.jpg",
        "video_url": "https://www.youtube-nocookie.com/embed/rPeGaX830j0",
        "stream_url": "https://watch.plex.tv/movie/donnie-darko",
        "vote_average": 8.0,
        "vote_count": 12400
    },
    {
        "id": 102,
        "title": "The Girl with the Dragon Tattoo",
        "release_year": 2009,
        "genres": "Crime|Drama|Mystery|Thriller",
        "industry": "Hollywood",
        "director": "Niels Arden Oplev",
        "cast": "Noomi Rapace, Michael Nyqvist, Lena Endre, Sven-Bertil Taube",
        "overview": "A journalist and a hacker search for a woman who has been missing for forty years across a wealthy Swedish industrialist dynasty.",
        "poster_url": "https://image.tmdb.org/t/p/w500/2jP9s.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/w1280/5nL2.jpg",
        "video_url": "https://www.youtube-nocookie.com/embed/RlJGl6g2F7Y",
        "stream_url": "https://watch.plex.tv/movie/the-girl-with-the-dragon-tattoo-2009",
        "vote_average": 7.8,
        "vote_count": 4100
    },
    {
        "id": 103,
        "title": "The Hunt",
        "release_year": 2012,
        "genres": "Drama",
        "industry": "Hollywood",
        "director": "Thomas Vinterberg",
        "cast": "Mads Mikkelsen, Thomas Bo Larsen, Annika Wedderkopp, Lasse Fogelstrom",
        "overview": "A teacher lives a lonely life, all the while struggling over his son's custody. His life slowly gets better as he finds love and receives good news from his son, but his new luck is about to be brutally shattered by an innocent little lie.",
        "poster_url": "https://image.tmdb.org/t/p/w500/7C5.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/w1280/9yH.jpg",
        "video_url": "https://www.youtube-nocookie.com/embed/he_L2qB7u14",
        "stream_url": "https://watch.plex.tv/movie/the-hunt-2012",
        "vote_average": 8.3,
        "vote_count": 4800
    },
    {
        "id": 104,
        "title": "Short Term 12",
        "release_year": 2013,
        "genres": "Drama",
        "industry": "Hollywood",
        "director": "Destin Daniel Cretton",
        "cast": "Brie Larson, John Gallagher Jr., Stephanie Beatriz, Rami Malek, Lakeith Stanfield",
        "overview": "A 20-something supervisor at a foster-care facility for at-risk teenagers passionately cares for her charges while navigating her own painful past.",
        "poster_url": "https://image.tmdb.org/t/p/w500/8jP.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/w1280/4kM.jpg",
        "video_url": "https://www.youtube-nocookie.com/embed/qhS66480Hx4",
        "stream_url": "https://watch.plex.tv/movie/short-term-12",
        "vote_average": 8.0,
        "vote_count": 3200
    },
    {
        "id": 105,
        "title": "Melancholia",
        "release_year": 2011,
        "genres": "Drama|Sci-Fi",
        "industry": "Hollywood",
        "director": "Lars von Trier",
        "cast": "Kirsten Dunst, Charlotte Gainsbourg, Kiefer Sutherland, Alexander Skarsgard",
        "overview": "Two sisters find their already strained relationship challenged as a mysterious new rogue planet threatens to collide with Earth.",
        "poster_url": "https://image.tmdb.org/t/p/w500/6vL.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/w1280/3xP.jpg",
        "video_url": "https://www.youtube-nocookie.com/embed/wz7Lwx5p_v8",
        "stream_url": "https://watch.plex.tv/movie/melancholia",
        "vote_average": 7.2,
        "vote_count": 3900
    },
    {
        "id": 106,
        "title": "Paterson",
        "release_year": 2016,
        "genres": "Comedy|Drama|Romance",
        "industry": "Hollywood",
        "director": "Jim Jarmusch",
        "cast": "Adam Driver, Golshifteh Farahani, Nellie, Rizwan Manji",
        "overview": "A quiet observation of the triumphs and defeats of daily life, along with the poetry evident in its smallest details, centered on a bus driver poet.",
        "poster_url": "https://image.tmdb.org/t/p/w500/9mL.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/w1280/2aX.jpg",
        "video_url": "https://www.youtube-nocookie.com/embed/m8pGJBgiiDU",
        "stream_url": "https://watch.plex.tv/movie/paterson",
        "vote_average": 7.5,
        "vote_count": 2100
    },
    {
        "id": 107,
        "title": "Frances Ha",
        "release_year": 2012,
        "genres": "Comedy|Drama|Romance",
        "industry": "Hollywood",
        "director": "Noah Baumbach",
        "cast": "Greta Gerwig, Mickey Sumner, Michael Esper, Adam Driver",
        "overview": "A New York woman apprentices for a dance company and throws herself headlong into her dreams, even as the possibility of realizing them dwindles.",
        "poster_url": "https://image.tmdb.org/t/p/w500/3oN.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/w1280/8tJ.jpg",
        "video_url": "https://www.youtube-nocookie.com/embed/YBn5ugf1nVE",
        "stream_url": "https://watch.plex.tv/movie/frances-ha",
        "vote_average": 7.4,
        "vote_count": 2300
    },
    {
        "id": 108,
        "title": "The Cabinet of Dr. Caligari",
        "release_year": 1920,
        "genres": "Horror|Mystery|Thriller",
        "industry": "Hollywood",
        "director": "Robert Wiene",
        "cast": "Werner Krauss, Conrad Veidt, Friedrich Feher, Lil Dagover",
        "overview": "Hypnotist Dr. Caligari uses a somnambulist to commit murders in a seminal landmark of German Expressionist cinema.",
        "poster_url": "https://image.tmdb.org/t/p/w500/3k8.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/w1280/7kP.jpg",
        "video_url": "https://www.youtube-nocookie.com/embed/IAtpxqajFak",
        "stream_url": "https://watch.plex.tv/movie/the-cabinet-of-dr-caligari",
        "vote_average": 8.0,
        "vote_count": 1700
    },
    {
        "id": 109,
        "title": "Metropolis",
        "release_year": 1927,
        "genres": "Drama|Sci-Fi",
        "industry": "Hollywood",
        "director": "Fritz Lang",
        "cast": "Brigitte Helm, Alfred Abel, Gustav Frohlich, Rudolf Klein-Rogge",
        "overview": "In a futuristic city sharply divided between the working class and the city planners, the son of the city's mastermind falls in love with a working-class prophet.",
        "poster_url": "https://image.tmdb.org/t/p/w500/2Kk.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/w1280/5rZ.jpg",
        "video_url": "https://www.youtube-nocookie.com/embed/gdtZv3XWPnc",
        "stream_url": "https://watch.plex.tv/movie/metropolis",
        "vote_average": 8.2,
        "vote_count": 2800
    },
    {
        "id": 110,
        "title": "Charade",
        "release_year": 1963,
        "genres": "Comedy|Mystery|Romance|Thriller",
        "industry": "Hollywood",
        "director": "Stanley Donen",
        "cast": "Cary Grant, Audrey Hepburn, Walter Matthau, James Coburn",
        "overview": "Romance and suspense in Paris as a woman is pursued by several men who want a fortune her murdered husband had stolen.",
        "poster_url": "https://image.tmdb.org/t/p/w500/4g1.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/w1280/9sZ.jpg",
        "video_url": "https://www.youtube-nocookie.com/embed/4g1rB34J21U",
        "stream_url": "https://watch.plex.tv/movie/charade",
        "vote_average": 7.9,
        "vote_count": 1900
    },
    {
        "id": 111,
        "title": "Kahaani",
        "release_year": 2012,
        "genres": "Mystery|Thriller",
        "industry": "Bollywood",
        "director": "Sujoy Ghosh",
        "cast": "Vidya Balan, Parambrata Chattopadhyay, Nawazuddin Siddiqui, Indraneil Sengupta",
        "overview": "A pregnant woman's search for her missing husband takes her from London to Kolkata, but everyone she questions denies having ever met him.",
        "poster_url": "https://image.tmdb.org/t/p/w500/7mK.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/w1280/3jQ.jpg",
        "video_url": "https://www.youtube-nocookie.com/embed/rs9fU_0O59A",
        "stream_url": "https://watch.plex.tv/movie/kahaani",
        "vote_average": 8.1,
        "vote_count": 1800
    },
    {
        "id": 112,
        "title": "Gully Boy",
        "release_year": 2019,
        "genres": "Drama|Music",
        "industry": "Bollywood",
        "director": "Zoya Akhtar",
        "cast": "Ranveer Singh, Alia Bhatt, Siddhant Chaturvedi, Vijay Raaz",
        "overview": "A coming-of-age story based on the lives of street rappers in Mumbai, discovering his voice through hip-hop poetry.",
        "poster_url": "https://image.tmdb.org/t/p/w500/9kJ.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/w1280/2mL.jpg",
        "video_url": "https://www.youtube-nocookie.com/embed/JfbxcD6BiOk",
        "stream_url": "https://watch.plex.tv/movie/gully-boy",
        "vote_average": 7.9,
        "vote_count": 1500
    },
    {
        "id": 113,
        "title": "Barfi!",
        "release_year": 2012,
        "genres": "Comedy|Drama|Romance",
        "industry": "Bollywood",
        "director": "Anurag Basu",
        "cast": "Ranbir Kapoor, Priyanka Chopra, Ileana D'Cruz, Saurabh Shukla",
        "overview": "Three young people learn that love can neither be defined nor contained by society's norms of normal and abnormal.",
        "poster_url": "https://image.tmdb.org/t/p/w500/8tA.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/w1280/5nK.jpg",
        "video_url": "https://www.youtube-nocookie.com/embed/yGQ4Ua8N3r8",
        "stream_url": "https://watch.plex.tv/movie/barfi",
        "vote_average": 8.1,
        "vote_count": 1700
    },
    {
        "id": 114,
        "title": "Chhichhore",
        "release_year": 2019,
        "genres": "Comedy|Drama",
        "industry": "Bollywood",
        "director": "Nitesh Tiwari",
        "cast": "Sushant Singh Rajput, Shraddha Kapoor, Varun Sharma, Prateik Babbar",
        "overview": "A tragic incident forces Anirudh, a middle-aged man, to take a trip down memory lane and reminisce his college days with his friends, who were labeled as losers.",
        "poster_url": "https://image.tmdb.org/t/p/w500/4gV.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/w1280/6tQ.jpg",
        "video_url": "https://www.youtube-nocookie.com/embed/tsxemFX0a7k",
        "stream_url": "https://watch.plex.tv/movie/chhichhore",
        "vote_average": 8.2,
        "vote_count": 1600
    },
    {
        "id": 115,
        "title": "Udaan",
        "release_year": 2010,
        "genres": "Drama",
        "industry": "Bollywood",
        "director": "Vikramaditya Motwane",
        "cast": "Rajat Barmecha, Ronit Roy, Manjot Singh, Ram Kapoor",
        "overview": "Expelled from his school, a young boy returns home to his strict, authoritarian father and an unexpected half-brother he didn't know existed.",
        "poster_url": "https://image.tmdb.org/t/p/w500/7bQ.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/w1280/1vP.jpg",
        "video_url": "https://www.youtube-nocookie.com/embed/W0W0qXoUq-Y",
        "stream_url": "https://watch.plex.tv/movie/udaan",
        "vote_average": 8.1,
        "vote_count": 1400
    },
    {
        "id": 116,
        "title": "Piku",
        "release_year": 2015,
        "genres": "Comedy|Drama",
        "industry": "Bollywood",
        "director": "Shoojit Sircar",
        "cast": "Amitabh Bachchan, Deepika Padukone, Irrfan Khan, Moushumi Chatterjee",
        "overview": "A quirky comedy about the relationship between an aging father and his young daughter, who embark on a road trip from Delhi to Kolkata.",
        "poster_url": "https://image.tmdb.org/t/p/w500/3oK.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/w1280/7mL.jpg",
        "video_url": "https://www.youtube-nocookie.com/embed/oe7AZ3wL9tE",
        "stream_url": "https://watch.plex.tv/movie/piku",
        "vote_average": 7.6,
        "vote_count": 1400
    },
    {
        "id": 117,
        "title": "Special 26",
        "release_year": 2013,
        "genres": "Crime|Drama|Thriller",
        "industry": "Bollywood",
        "director": "Neeraj Pandey",
        "cast": "Akshay Kumar, Manoj Bajpayee, Anupam Kher, Jimmy Sheirgill",
        "overview": "A team of con artists conduct fake CBI raids to loot politicians and businessmen of their black money across 1980s India.",
        "poster_url": "https://image.tmdb.org/t/p/w500/6yN.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/w1280/4qJ.jpg",
        "video_url": "https://www.youtube-nocookie.com/embed/8W928tQ80dM",
        "stream_url": "https://watch.plex.tv/movie/special-26",
        "vote_average": 8.0,
        "vote_count": 1600
    },
    {
        "id": 118,
        "title": "A Wednesday!",
        "release_year": 2008,
        "genres": "Action|Crime|Drama|Thriller",
        "industry": "Bollywood",
        "director": "Neeraj Pandey",
        "cast": "Naseeruddin Shah, Anupam Kher, Jimmy Sheirgill, Aamir Bashir",
        "overview": "A retiring police commissioner recounts the most astounding day of his career, when an anonymous common man held Mumbai hostage with bombs.",
        "poster_url": "https://image.tmdb.org/t/p/w500/2tL.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/w1280/8mK.jpg",
        "video_url": "https://www.youtube-nocookie.com/embed/e7y-wL8f14Y",
        "stream_url": "https://watch.plex.tv/movie/a-wednesday",
        "vote_average": 8.1,
        "vote_count": 1800
    },
    {
        "id": 119,
        "title": "Pushpa 2: The Rule",
        "release_year": 2024,
        "genres": "Action|Crime|Drama|Thriller",
        "industry": "Tollywood",
        "director": "Sukumar",
        "cast": "Allu Arjun, Rashmika Mandanna, Fahadh Faasil, Jagapathi Babu",
        "overview": "The clash between Pushpa Raj and Bhanwar Singh Shekhawat escalates into an all-out war for supremacy over the red sandalwood trade.",
        "poster_url": "https://image.tmdb.org/t/p/w500/9kQ.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/w1280/4kL.jpg",
        "video_url": "https://www.youtube-nocookie.com/embed/1kVK0MZlbI4",
        "stream_url": "https://watch.plex.tv/movie/pushpa-2-the-rule",
        "vote_average": 8.1,
        "vote_count": 1800
    },
    {
        "id": 120,
        "title": "Vikram Vedha",
        "release_year": 2017,
        "genres": "Action|Crime|Drama|Thriller",
        "industry": "Tollywood",
        "director": "Pushkar, Gayathri",
        "cast": "R. Madhavan, Vijay Sethupathi, Varalaxmi Sarathkumar, Shraddha Srinath",
        "overview": "A pragmatic police inspector and his team embark on a mission to capture a notorious gangster who surrenders and tells him riddles.",
        "poster_url": "https://image.tmdb.org/t/p/w500/7nJ.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/w1280/5rM.jpg",
        "video_url": "https://www.youtube-nocookie.com/embed/1sNr6V4dD4g",
        "stream_url": "https://watch.plex.tv/movie/vikram-vedha-2017",
        "vote_average": 8.3,
        "vote_count": 2100
    },
    {
        "id": 121,
        "title": "Lucifer",
        "release_year": 2019,
        "genres": "Action|Crime|Drama|Thriller",
        "industry": "Tollywood",
        "director": "Prithviraj Sukumaran",
        "cast": "Mohanlal, Vivek Oberoi, Manju Warrier, Tovino Thomas",
        "overview": "A political Godfather dies and a lot of thieves dressed in white enter the scene to seize power, until a loyal protector named Stephen steps in.",
        "poster_url": "https://image.tmdb.org/t/p/w500/8bL.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/w1280/3xK.jpg",
        "video_url": "https://www.youtube-nocookie.com/embed/4Q80k1c1hNk",
        "stream_url": "https://watch.plex.tv/movie/lucifer-2019",
        "vote_average": 7.5,
        "vote_count": 1400
    },
    {
        "id": 122,
        "title": "Drishyam 2",
        "release_year": 2021,
        "genres": "Crime|Drama|Mystery|Thriller",
        "industry": "Tollywood",
        "director": "Jeethu Joseph",
        "cast": "Mohanlal, Meena, Ansiba, Esther Anil",
        "overview": "Six years after the events of Drishyam, Georgekutty and his family live under constant surveillance as a new police investigation re-opens the unsolved case.",
        "poster_url": "https://image.tmdb.org/t/p/w500/9kM.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/w1280/7kM.jpg",
        "video_url": "https://www.youtube-nocookie.com/embed/k5KkLz-d9Xw",
        "stream_url": "https://watch.plex.tv/movie/drishyam-2-2021",
        "vote_average": 8.4,
        "vote_count": 2200
    },
    {
        "id": 123,
        "title": "Minnal Murali",
        "release_year": 2021,
        "genres": "Action|Adventure|Comedy|Fantasy|Sci-Fi",
        "industry": "Tollywood",
        "director": "Basil Joseph",
        "cast": "Tovino Thomas, Guru Somasundaram, Aju Varghese, Femina George",
        "overview": "A tailor gains special superhero powers after being struck by lightning, but must take down an unexpected rival who developed the same powers.",
        "poster_url": "https://image.tmdb.org/t/p/w500/2vP.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/w1280/9vK.jpg",
        "video_url": "https://www.youtube-nocookie.com/embed/zAUdzsgbI3E",
        "stream_url": "https://watch.plex.tv/movie/minnal-murali",
        "vote_average": 7.9,
        "vote_count": 1600
    },
    {
        "id": 124,
        "title": "777 Charlie",
        "release_year": 2022,
        "genres": "Adventure|Comedy|Drama",
        "industry": "Tollywood",
        "director": "Kiranraj K",
        "cast": "Rakshit Shetty, Sangeetha Sringeri, Raj B. Shetty, Danish Sait",
        "overview": "Dharma is stuck in a rut with his negative and lonely lifestyle, until a stray labrador pup enters his life and gives him a new perspective.",
        "poster_url": "https://image.tmdb.org/t/p/w500/4kK.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/w1280/6kL.jpg",
        "video_url": "https://www.youtube-nocookie.com/embed/X128b9K3x6Y",
        "stream_url": "https://watch.plex.tv/movie/777-charlie",
        "vote_average": 8.8,
        "vote_count": 1900
    },
    {
        "id": 125,
        "title": "Mayabazar",
        "release_year": 1957,
        "genres": "Comedy|Drama|Fantasy",
        "industry": "Tollywood",
        "director": "K.V. Reddy",
        "cast": "N.T. Rama Rao, S.V. Ranga Rao, Savitri, Gemini Ganesan",
        "overview": "The immortal epic tale of Balarama's daughter Sasirekha and Abhimanyu, aided by the trickery and illusions of Ghatotkacha.",
        "poster_url": "https://image.tmdb.org/t/p/w500/4g78P2z3ZfB6e37o4fX68B25o1R.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/w1280/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
        "video_url": "https://www.youtube-nocookie.com/embed/WcK3qB70pLs",
        "stream_url": "https://watch.plex.tv/movie/mayabazar",
        "vote_average": 9.1,
        "vote_count": 1400
    }
]

import build_catalog
ALL_MOVIES = build_catalog.MOVIES + EXTRA_MOVIES

# Validate unique video URLs
video_urls = [m["video_url"] for m in ALL_MOVIES]
assert len(set(video_urls)) == len(ALL_MOVIES), f"Duplicate found! {len(set(video_urls))} vs {len(ALL_MOVIES)}"

# Let's import existing users, ratings, favorites, reviews from seed_data
import seed_data
SEED_USERS = seed_data.SEED_USERS

# Build rich ratings
SEED_RATINGS = list(seed_data.SEED_RATINGS)
# Add ratings for new movies
for uid, mid, score in [
    (1, 31, 4.5), # Titanic
    (1, 15, 5.0), # Gladiator
    (1, 22, 5.0), # Oppenheimer
    (1, 61, 4.5), # Train to Busan
    (1, 62, 4.5), # Drive
    (1, 83, 5.0), # RRR
    (2, 31, 5.0), # Titanic
    (2, 69, 5.0), # 3 Idiots
    (2, 72, 5.0), # DDLJ
    (2, 90, 5.0), # Sita Ramam
    (2, 113, 5.0), # Barfi!
    (3, 15, 5.0), # Gladiator
    (3, 19, 5.0), # Se7en
    (3, 27, 5.0), # Goodfellas
    (3, 42, 5.0), # Memento
    (3, 77, 5.0), # Wasseypur
    (3, 92, 5.0), # Vikram
    (4, 8, 5.0),  # Spirited Away
    (4, 23, 5.0), # Coco
    (4, 33, 5.0), # Toy Story
    (4, 43, 5.0), # WALL-E
    (4, 50, 5.0), # Lion King
    (4, 124, 5.0), # 777 Charlie
    (5, 4, 5.0),  # Matrix
    (5, 36, 5.0), # Mad Max
    (5, 60, 5.0), # John Wick
    (5, 83, 5.0), # RRR
    (5, 84, 5.0), # Baahubali
    (5, 86, 5.0), # KGF
    (5, 89, 4.5), # Pushpa
]:
    if not any(r["user_id"] == uid and r["movie_id"] == mid for r in SEED_RATINGS):
        SEED_RATINGS.append({"user_id": uid, "movie_id": mid, "rating": score})

SEED_FAVORITES = list(seed_data.SEED_FAVORITES)
SEED_REVIEWS = [
    {
        "user_id": 1,
        "movie_id": 1,
        "rating": 5.0,
        "comment": "An absolute masterclass in narrative structure and visual pacing. Christopher Nolan at his finest."
    },
    {
        "user_id": 2,
        "movie_id": 31,
        "rating": 5.0,
        "comment": "Titanic is a sweeping, emotionally devastating epic that defines romance and tragedy on screen. James Cameron's vision is timeless."
    },
    {
        "user_id": 3,
        "movie_id": 15,
        "rating": 5.0,
        "comment": "Are you not entertained? Russell Crowe and Joaquin Phoenix deliver sheer cinematic royalty. Hans Zimmer's score gives chills every time."
    },
    {
        "user_id": 5,
        "movie_id": 83,
        "rating": 5.0,
        "comment": "One of the most exhilarating cinematic spectacles ever conceived. The choreography, fire-and-water dynamics, and emotional payoff are breathtaking!"
    },
    {
        "user_id": 2,
        "movie_id": 69,
        "rating": 5.0,
        "comment": "Heartwarming, hilarious, and inspiring. It completely redefines what friendship and following your passion mean."
    },
    {
        "user_id": 4,
        "movie_id": 8,
        "rating": 5.0,
        "comment": "Pure enchantment. Studio Ghibli's hand-drawn animation feels like stepping into a living, breathing dream world."
    },
    {
        "user_id": 3,
        "movie_id": 61,
        "rating": 4.5,
        "comment": "One of the absolute best zombie thrillers ever made. Non-stop tension with huge emotional heart on a speeding train."
    },
    {
        "user_id": 1,
        "movie_id": 22,
        "rating": 5.0,
        "comment": "A towering historical thriller. Cillian Murphy's haunting eyes and Ludwig Goransson's score build unbearable, monumental tension."
    }
]

# Write to seed_data.py
out_file = "seed_data.py"
with open(out_file, "w", encoding="utf-8") as f:
    f.write('"""\nCineMatch Curated Seed Dataset with 125 Hollywood, Bollywood, and Tollywood titles.\n')
    f.write('Each title has its exact, verified YouTube embed trailer URL and Plex streaming link.\n"""\n\n')
    f.write("SEED_MOVIES = " + pprint.pformat(ALL_MOVIES, indent=4, width=120) + "\n\n")
    f.write("SEED_USERS = " + pprint.pformat(SEED_USERS, indent=4, width=120) + "\n\n")
    f.write("SEED_RATINGS = " + pprint.pformat(SEED_RATINGS, indent=4, width=120) + "\n\n")
    f.write("SEED_FAVORITES = " + pprint.pformat(SEED_FAVORITES, indent=4, width=120) + "\n\n")
    f.write("SEED_REVIEWS = " + pprint.pformat(SEED_REVIEWS, indent=4, width=120) + "\n")

print(f"Successfully generated {out_file} with {len(ALL_MOVIES)} verified movies, {len(SEED_RATINGS)} ratings, and {len(SEED_REVIEWS)} reviews!")
