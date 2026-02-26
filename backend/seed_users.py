"""
HOW TO RUN — choose one method:

METHOD 1 (Recommended): Save this file as seed_users.py in your Django project root, then:
    python manage.py shell < seed_users.py

METHOD 2: In Django shell, run:
    exec(open('seed_users.py').read())

METHOD 3 (management command): 
    python manage.py shell -c "exec(open('seed_users.py').read())"
"""

import random
from datetime import date, timedelta
from django.contrib.auth.models import User
from django.utils import timezone
from profiles.models import UserProfile  # adjust if your app name differs

FIRST_NAMES = [
    "Aria", "Liam", "Zoe", "Noah", "Maya", "Ethan", "Luna", "Lucas",
    "Chloe", "Oliver", "Stella", "Aiden", "Nora", "Elijah", "Isla",
    "James", "Aurora", "Mason", "Violet", "Logan", "Scarlett", "Sebastian",
    "Hazel", "Jack", "Ellie", "Owen", "Willow", "Henry", "Layla", "Carter",
    "Sofia", "Daniel", "Avery", "Matthew", "Penelope", "Leo", "Riley",
    "Jayden", "Savannah", "Caleb",
]

BIOS = [
    "Coffee addict by day, stargazer by night. Looking for someone to share late-night conversations and breakfast adventures.",
    "Passionate about hiking, cooking experimental dishes, and finding hidden gem restaurants. Let's get lost together.",
    "Dog parent, book lover, and amateur photographer. If you love golden hour walks, we'll get along great.",
    "Overthinker who loves deep talks, indie music, and spontaneous road trips. Swipe right if you enjoy both Netflix and beaches.",
    "Yoga teacher who moonlights as a foodie. My love language is cooking for people. Bonus points if you love spicy food.",
    "Engineer by day, home chef by night. I believe life's too short for bad coffee and boring conversations.",
    "Musician with a playlist for every mood. Looking for someone who appreciates concerts and cozy evenings equally.",
    "Fitness enthusiast meets bookworm. Yes, you can find me at the gym in the morning and a cafe in the afternoon.",
    "Travel junkie who has visited 18 countries and counting. Next stop: wherever you want to go.",
    "Art history nerd who also loves memes. Looking for the peanut butter to my jelly.",
    "Sustainable living advocate, plant parent, and weekend surfer. Come vibe with me.",
    "Introverted but will talk your ear off about astronomy, philosophy, or true crime podcasts.",
    "Brunch is non-negotiable. Love architecture, travel vlogs, and spontaneous karaoke nights.",
    "Amateur sommelier, professional overthinker. If you can recommend a wine or a good thriller, lets chat.",
    "Climber, swimmer, and terrible dancer but I commit fully. Looking for someone who laughs at themselves.",
    "I make sourdough and code in equal measure. Weekends are for farmers markets and long bike rides.",
    "Cat mom, film buff, and certified sauna enthusiast. Not looking for anything serious with my sleep schedule.",
    "Aspiring chef who tests recipes on friends and coworkers. You will never leave hungry.",
    "Traveler, doodler, and hopeless romantic. Ask me about my most embarrassing travel story.",
    "Marine biologist who loves diving, dad jokes, and overly ambitious dinner parties.",
]

CONVERSATION_STARTERS = [
    "If you could live anywhere in the world for a year, where would it be?",
    "What is the last thing that genuinely made you laugh out loud?",
    "Coffee, tea, or do you just mainline chaos?",
    "What is your most controversial food opinion?",
    "If your life had a soundtrack, what is the opening song?",
    "Best trip you have ever taken, go.",
    "What is something you are weirdly passionate about?",
    "Night owl or early bird? This matters more than it should.",
    "What is your go-to karaoke song?",
    "If we had one day together, what would you plan?",
    "What book changed the way you see the world?",
    "Describe your perfect Sunday in three words.",
    "What talent do you have that would surprise people?",
    "What is the last thing you taught yourself?",
    "If you could have dinner with anyone dead or alive, who is showing up?",
]

INTERESTS_POOL = [
    "Hiking", "Coffee", "Travel", "Photography", "Yoga", "Cooking", "Reading",
    "Fitness", "Music", "Art", "Gaming", "Movies", "Dancing", "Cycling",
    "Surfing", "Climbing", "Running", "Wine", "Astronomy", "Fashion",
    "Meditation", "Podcasts", "Road Trips", "Baking", "Swimming", "Concerts",
    "Museums", "Skiing", "Writing", "Volunteering", "Foodie", "Plants",
    "Dogs", "Cats", "Beaches", "Mountains", "Brunch", "Theater", "Film",
]

GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"]
INTERESTED_IN = [["Female"], ["Male"], ["Everyone"], ["Female", "Non-binary"], ["Male", "Non-binary"]]
RELATIONSHIP_TYPES = ["Serious relationship", "Casual dating", "Friendship first", "Open to anything"]
RELATIONSHIP_GOALS = [["Long-term partner"], ["Casual connection"], ["Marriage eventually"], ["Just exploring"]]
DRINKING = ["Never", "Socially", "Regularly", "Trying to cut back"]
SMOKING = ["Never", "Socially", "Regularly", "Trying to quit"]
WORKOUT = ["Never", "Sometimes", "Regularly", "Every day"]
PETS = ["Dog lover", "Cat lover", "No pets", "All animals welcome", "Allergic, sadly"]
COMMUNICATION_STYLES = [["Texting"], ["Calling"], ["Memes only"], ["In-person person"], ["Texting", "Calling"]]
RESPONSE_PACES = ["Instant replier", "Reply when I can", "Once a day", "Depends on the vibe"]
LOCATIONS = [
    "New York, NY", "Los Angeles, CA", "Chicago, IL", "Austin, TX", "San Francisco, CA",
    "Miami, FL", "Seattle, WA", "Boston, MA", "Denver, CO", "Atlanta, GA",
    "Portland, OR", "Nashville, TN", "Phoenix, AZ", "Dallas, TX", "San Diego, CA",
]
SEXUAL_ORIENTATIONS = [["Straight"], ["Gay"], ["Bisexual"], ["Pansexual"], ["Prefer not to say"]]
CITY_COORDS = [
    (40.7128, -74.0060), (34.0522, -118.2437), (41.8781, -87.6298),
    (30.2672, -97.7431), (37.7749, -122.4194), (25.7617, -80.1918),
    (47.6062, -122.3321), (42.3601, -71.0589), (39.7392, -104.9903),
    (33.7490, -84.3880), (45.5051, -122.6750), (36.1627, -86.7816),
    (33.4484, -112.0740), (32.7767, -96.7970), (32.7157, -117.1611),
]

created_count = 0
skipped_count = 0

for i in range(40):
    first_name = FIRST_NAMES[i]
    username = f"testuser_{first_name.lower()}_{i+1}"
    email = f"{first_name.lower()}{i+1}@testdating.com"
    password = "TestPass123!"

    if User.objects.filter(username=username).exists():
        print(f"Skipping {username} (already exists)")
        skipped_count += 1
        continue

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=first_name,
    )

    loc_idx = random.randint(0, len(LOCATIONS) - 1)
    location = LOCATIONS[loc_idx]
    lat, lng = CITY_COORDS[loc_idx]
    lat += random.uniform(-0.05, 0.05)
    lng += random.uniform(-0.05, 0.05)

    days_ago = random.randint(22 * 365, 38 * 365)
    dob = date.today() - timedelta(days=days_ago)
    gender = random.choice(GENDERS)
    interests = random.sample(INTERESTS_POOL, k=random.randint(4, 8))
    bio = random.choice(BIOS)

    profile, _ = UserProfile.objects.get_or_create(user=user)
    profile.first_name = first_name
    profile.date_of_birth = dob
    profile.gender = gender
    profile.show_gender = random.choice([True, True, False])
    profile.interested_in = random.choice(INTERESTED_IN)
    profile.relationship_type = random.choice(RELATIONSHIP_TYPES)
    profile.distance = random.choice([10, 25, 50, 100])
    profile.strict_distance = random.choice([True, False])
    profile.drinking = random.choice(DRINKING)
    profile.smoking = random.choice(SMOKING)
    profile.workout = random.choice(WORKOUT)
    profile.pets = random.choice(PETS)
    profile.communication_style = random.choice(COMMUNICATION_STYLES)
    profile.response_pace = random.choice(RESPONSE_PACES)
    profile.interests = interests
    profile.location = location
    profile.latitude = lat
    profile.longitude = lng
    profile.bio = bio
    profile.sexual_orientation = random.choice(SEXUAL_ORIENTATIONS)
    profile.relationship_goals = random.choice(RELATIONSHIP_GOALS)
    profile.onboarding_step = 9
    profile.completion_percentage = 100.0
    profile.status = random.choice(["online", "away", "offline"])
    profile.account_status = "active"
    profile.last_active = timezone.now() - timedelta(hours=random.randint(0, 72))
    profile.verified = random.choice([True, False])
    profile.premium = random.choice([True, False, False, False])
    profile.is_complete = True
    profile.profile_complete = True
    profile.extra_data = {
        "conversation_starter": random.choice(CONVERSATION_STARTERS),
        "tagline": bio[:60] + "..." if len(bio) > 60 else bio,
    }
    profile.save()

    created_count += 1
    print(f"Created: {first_name} ({email}) - {location}")

print(f"\n{'=' * 50}")
print(f"Created : {created_count} users")
print(f"Skipped : {skipped_count} users (already existed)")
print(f"Total test users in DB: {User.objects.filter(username__startswith='testuser_').count()}")
print(f"{'=' * 50}")
print("\nSample login:")
print("  Email    : aria1@testdating.com")
print("  Password : TestPass123!")