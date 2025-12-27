const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();
const User = require("./model/User");
const Post = require("./model/Post");
const Comment = require("./model/Comment");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

const users = [
  {
    username: "admin",
    email: "admin@blog.com",
    password: "admin123",
    admin: true,
    profilePicture: "https://i.pravatar.cc/150?img=1"
  },
  {
    username: "john_doe",
    email: "john@example.com",
    password: "password123",
    admin: false,
    profilePicture: "https://i.pravatar.cc/150?img=2"
  },
  {
    username: "jane_smith",
    email: "jane@example.com",
    password: "password123",
    admin: false,
    profilePicture: "https://i.pravatar.cc/150?img=3"
  },
  {
    username: "tech_writer",
    email: "tech@example.com",
    password: "password123",
    admin: false,
    profilePicture: "https://i.pravatar.cc/150?img=4"
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log("🗑️  Clearing existing data...");
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    console.log("✅ Existing data cleared");

    console.log("👥 Creating users...");
    const createdUsers = [];
    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await User.create({
        ...userData,
        password: hashedPassword
      });
      createdUsers.push(user);
      console.log(`   ✓ Created user: ${user.username}`);
    }

    console.log("📝 Creating posts...");
    const posts = [
      {
        userId: createdUsers[0]._id.toString(),
        title: "Getting Started with Node.js",
        slug: "getting-started-with-nodejs",
        content: "Node.js has revolutionized server-side JavaScript development. Learn the fundamentals and build scalable applications with this powerful runtime environment.",
        category: "Technology",
        image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800"
      },
      {
        userId: createdUsers[1]._id.toString(),
        title: "The Ultimate Guide to React Hooks",
        slug: "ultimate-guide-to-react-hooks",
        content: "React Hooks have transformed how we write components. Dive deep into useState, useEffect, and custom hooks to write better React code.",
        category: "Technology",
        image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800"
      },
      {
        userId: createdUsers[2]._id.toString(),
        title: "Exploring the Mountains of Nepal",
        slug: "exploring-mountains-of-nepal",
        content: "Join me on an incredible journey through the Himalayas. Discover breathtaking views, rich culture, and unforgettable trekking experiences in Nepal.",
        category: "Travel",
        image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800"
      },
      {
        userId: createdUsers[3]._id.toString(),
        title: "Understanding MongoDB and NoSQL",
        slug: "understanding-mongodb-nosql",
        content: "MongoDB is a powerful NoSQL database. Learn about document-oriented storage, flexible schemas, and when to use MongoDB in your projects.",
        category: "Technology",
        image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800"
      },
      {
        userId: createdUsers[0]._id.toString(),
        title: "Healthy Eating Habits for Busy Professionals",
        slug: "healthy-eating-habits-busy-professionals",
        content: "Maintain a healthy diet while managing a busy schedule. Practical tips for meal prep, smart snacking, and eating well on the go.",
        category: "Lifestyle",
        image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800"
      },
      {
        userId: createdUsers[1]._id.toString(),
        title: "Introduction to Machine Learning",
        slug: "introduction-to-machine-learning",
        content: "Machine Learning is transforming industries. Explore the fundamentals, types of ML, popular algorithms, and real-world applications.",
        category: "Technology",
        image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800"
      }
    ];

    const createdPosts = [];
    for (const postData of posts) {
      const post = await Post.create(postData);
      createdPosts.push(post);
      console.log(`   ✓ Created post: ${post.title}`);
    }

    console.log("💬 Creating comments...");
    const comments = [
      { content: "Great article! Very informative.", userId: createdUsers[1]._id, postId: createdPosts[0]._id.toString() },
      { content: "Thanks for sharing this.", userId: createdUsers[2]._id, postId: createdPosts[0]._id.toString() },
      { content: "This is exactly what I needed!", userId: createdUsers[3]._id, postId: createdPosts[1]._id.toString() },
      { content: "Excellent explanation!", userId: createdUsers[0]._id, postId: createdPosts[1]._id.toString() },
      { content: "Beautiful photos!", userId: createdUsers[1]._id, postId: createdPosts[2]._id.toString() },
      { content: "I want to visit Nepal now!", userId: createdUsers[3]._id, postId: createdPosts[2]._id.toString() },
      { content: "Very helpful for my project.", userId: createdUsers[2]._id, postId: createdPosts[3]._id.toString() },
      { content: "Looking forward to more content!", userId: createdUsers[1]._id, postId: createdPosts[4]._id.toString() }
    ];

    for (const commentData of comments) {
      await Comment.create(commentData);
    }
    console.log(`   ✓ Created ${comments.length} comments`);

    console.log("\n🎉 Database seeded successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Users: ${createdUsers.length}`);
    console.log(`   - Posts: ${createdPosts.length}`);
    console.log(`   - Comments: ${comments.length}`);
    console.log("\n👤 Admin credentials:");
    console.log("   Email: admin@blog.com");
    console.log("   Password: admin123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
