// Fixture for database.ts
// Mocks the useDB function and tables export for testing

export const tables = {} // Provide fake or empty schema as needed

export function useDB() {
    // Return a stubbed object simulating the Drizzle instance
    return {
        select: () => Promise.resolve([]),
        insert: () => Promise.resolve({}),
        update: () => Promise.resolve({}),
        delete: () => Promise.resolve({}),
        // Add more methods as needed for your tests
    }
}
