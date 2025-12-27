import { useStoreConfig } from '@/context/StoreConfigContext'; // Make sure this context exists in Admin or create one

/**
 * useFeature Hook
 * Check if a feature is enabled for the current tenant.
 */
export function useFeature() {
    // In Admin, we might fetch config differently, or assume it's passed down.
    // For now, let's assume we have a similar specific context or we fetch it.
    // BUT Admin usually logs in as User, and Tenant config is global.
    // Let's rely on a new check or the existing config.

    // TEMPORARY: Mocking simply until we connect Admin to Config Context properly
    // Real implementation should read from the loaded StoreConfig

    const isEnabled = (featurePath: string) => {
        // TODO: Read from actual config
        // Default to true for now to avoid breaking until backend is ready
        return true;
    };

    return { isEnabled };
}
