import os
from app import create_app, db 
from app.models.club import Club
from app.models.user import User 

def seed_data():
    app = create_app()
    with app.app_context():
        print("Seeding database...")
        # db.session.query(Club).delete()
        # db.session.commit()
        # print("Cleared existing clubs.")

        # Create a default user if none exists (to assign as club creator)
        default_user = User.query.filter_by(username='admin_seeder').first()
        if not default_user:
            default_user = User(username='admin_seeder', email='seeder@example.com')
            from app import bcrypt # Import bcrypt within app context
            default_user.password_hash = bcrypt.generate_password_hash("seedpassword".encode('utf-8')).decode('utf-8')
            db.session.add(default_user)
            db.session.commit()
            print("Created default seeder user: admin_seeder")
        else:
            print("Seeder user 'admin_seeder' already exists.")

        # Define your initial clubs (from your screenshot)
        initial_clubs = [
            {"name": "Thriller Fanatics", "description": "Dive deep into thrilling mysteries and suspense.", "genre": "Thriller"},
            {"name": "Rom-Com Lovers", "description": "Celebrate romance and comedy with us.", "genre": "Romance"},
            {"name": "Sci-Fi Nerds", "description": "Explore galaxies, aliens, and future tech.", "genre": "Sci-Fi"},
            {"name": "Horror Vault", "description": "Spine-chilling horror films and creepy tales await.", "genre": "Horror"},
            {"name": "Action Addicts", "description": "Explosions, fights, and adrenaline-pumping scenes all day.", "genre": "Action"},
            {"name": "Anime Alliance", "description": "From classics to new-gen anime – all in one club.", "genre": "Anime"},
            {"name": "Drama Queens", "description": "All about emotions, tears, and powerful performances.", "genre": "Drama"},
            {"name": "Documentary Diggers", "description": "Explore real-world stories and truths through documentaries.", "genre": "Documentary"},
            {"name": "Fantasy Realm", "description": "Dragons, magic, and epic quests from middle-earth to Westeros.", "genre": "Fantasy"},
            {"name": "Classic Cinema", "description": "Discuss timeless masterpieces from the golden age of film.", "genre": "Classic"}
        ]

        # Add clubs to the database only if they don't already exist
        for club_data in initial_clubs:
            existing_club = Club.query.filter_by(name=club_data["name"]).first()
            if not existing_club:
                club = Club(
                    name=club_data["name"],
                    description=club_data["description"],
                    genre=club_data["genre"],
                    created_by_user_id=default_user.id 
                )
                db.session.add(club)
                print(f"Added club: {club.name}")
            else:
                print(f"Club '{club_data['name']}' already exists. Skipping.")

        db.session.commit()
        print("Database seeding complete!")

if __name__ == '__main__':
    seed_data()
