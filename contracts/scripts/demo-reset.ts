import { seedDemoData } from "./seed";

async function main() {
  console.log("Resetting Kavach Network state to clean demo baseline...");
  await seedDemoData();
  console.log("Demo environment reset complete.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

