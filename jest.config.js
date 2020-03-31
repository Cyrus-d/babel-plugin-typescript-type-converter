module.exports = {
  "coverageDirectory": "./coverage",
  "coveragePathIgnorePatterns": [
    "node_modules/",
    "lib/",
    "esm/"
  ],
  "coverageReporters": [
    "lcov"
  ],
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 90,
      "lines": 90,
      "statements": 90
    }
  },
  "globals": {
    "__DEV__": true
  },
  "roots": [
    "<rootDir>"
  ],
  "setupFilesAfterEnv": [],
  "testEnvironment": "node",
  "testURL": "http://localhost",
  "timers": "real",
  "verbose": false,
  "testPathIgnorePatterns": [
    "/node_modules/",
    "/tests/fixtures/"
  ],
  "transformIgnorePatterns": [
    "/node_modules/",
    "/tests/fixtures/"
  ],
  "modulePathIgnorePatterns": [
    "/node_modules/",
    "/tests/fixtures/"
  ]
};