async function seedDatabase(): Promise<void> {
  try {
    console.log("Starting database seeding...");
    //TODO: Any seeding
    console.log("Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seedDatabase();
