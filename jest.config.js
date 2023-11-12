module.exports = {
    collectCoverage: false,
    coverageReporters: ['clover', 'json', 'lcov', ['text', {skipFull: true}]],
    coveragePathIgnorePatterns: [
        '/dist/',
        '/build/',
        '/node_modules/',
        '/test/',
    ],
    coverageThreshold: {
        './src': {
            branches: 100,
            functions: 100,
            lines: 100,
            statements: 100,
        },
    },
    transform: {
        '^.+\\.ts$': ['ts-jest', {
            tsconfig: 'tsconfig.json',
        }],
    },
    reporters: [
        'default',
    ],
    // Only run tests in the unit and integration folders.
    // All test files need to have the suffix `.test.ts`.
    testRegex: 'src/tests/(components|usecases)/.*\\.test\\.ts$',
    moduleFileExtensions: [
        'ts',
        'js',
    ],
    testEnvironment: 'node',
    // Make sure our tests have enough time to start a server
    testTimeout: 60000,
    verbose: true,

};
