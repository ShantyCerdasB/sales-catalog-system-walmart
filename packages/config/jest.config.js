module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/../.."],      // Excecute tests from each root directory
  moduleFileExtensions: ["ts", "js", "json"],
  transform: { "^.+\\.ts$": "ts-jest" }
};
