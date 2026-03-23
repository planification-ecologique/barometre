module.exports = {
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  modulePathIgnorePatterns: [
    "<rootDir>/dist/",
    "<rootDir>/public/tarteaucitron/",
  ],
  moduleFileExtensions: ["js", "json", "vue"],
  transform: {
    "^.+\\.vue$": "@vue/vue2-jest",
    "^.+\\.js$": "babel-jest",
  },
};
