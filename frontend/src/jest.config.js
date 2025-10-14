export default {
    preset: 'ts-jest', // Use ts-jest for TypeScript support
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.[tj]sx?$': 'ts-jest', // Use ts-jest for .ts/.tsx files
    },
    transformIgnorePatterns: [
        '/node_modules/(?!axios)', // Transpile Axios
    ],
};
