from django.core.management import base

from users import models


class Command(base.BaseCommand):
    help = "Seed the database with initial applicant and reviewer users."

    def handle(self, *args, **kwargs) -> None:
        users = [
            {
                "username": "natasha",
                "email": "natasha@mubanga.com",
                "password": "natasha123",
                "role": "applicant",
                "first_name": "Natasha",
                "last_name": "Mubanga",
            },
            {
                "username": "alexsmith",
                "email": "alex@applitracker.com",
                "password": "applicant123",
                "role": "applicant",
                "first_name": "Alex",
                "last_name": "Smith",
            },
            {
                "username": "jojo",
                "email": "reviewer@applitracker.com",
                "password": "reviewer123",
                "role": "reviewer",
                "first_name": "Jojo",
                "last_name": "Muffins",
            },
        ]

        for data in users:
            if models.User.objects.filter(username=data["username"]).exists():
                self.stdout.write(f"  skipping {data['username']} — already exists")
                continue

            models.User.objects.create_user(
                username=data["username"],
                email=data["email"],
                password=data["password"],
                role=data["role"],
                first_name=data["first_name"],
                last_name=data["last_name"],
            )
            self.stdout.write(self.style.SUCCESS(f"  created {data['username']}"))

        self.stdout.write(self.style.SUCCESS("Seed complete."))
