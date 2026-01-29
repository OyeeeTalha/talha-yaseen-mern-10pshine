// MongoDB initialization script
// This runs when the container is first created

db = db.getSiblingDB("notes_app");

// Create application user with read/write permissions
db.createUser({
  user: "notes_user",
  pwd: "notes_password_456",
  roles: [
    {
      role: "readWrite",
      db: "notes_app",
    },
  ],
});

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.notes.createIndex({ userId: 1 });
db.notes.createIndex({ createdAt: -1 });
db.notes.createIndex({ isPinned: 1 });
db.notes.createIndex({ isFavorite: 1 });
db.notes.createIndex({ isDeleted: 1 });
db.categories.createIndex({ userId: 1 });

print("✅ MongoDB initialized successfully for notes_app");
