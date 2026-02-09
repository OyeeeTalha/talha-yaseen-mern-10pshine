/**
 * Trash Configuration
 *
 * Adjust TRASH_PERIOD_SECONDS for testing or production:
 * - 60 seconds = 1 minute (testing)
 * - 300 seconds = 5 minutes (testing)
 * - 3600 seconds = 1 hour (testing)
 * - 86400 seconds = 1 day (testing)
 * - 2592000 seconds = 30 days (production - default)
 */

export const TRASH_PERIOD_SECONDS = 2592000; // 30 days (production)
// export const TRASH_PERIOD_SECONDS = 60; // 1 minute (testing)

export const ACCOUNT_DEACTIVATION_GRACE_PERIOD_SECONDS = 120; // 7 days
// export const ACCOUNT_DEACTIVATION_GRACE_PERIOD_SECONDS = 60; // 1 minute (testing)

export const REACTIVATION_REQUEST_COOLDOWN_SECONDS = 60; // 7 days

export const CONTACT_US_COOLDOWN_SECONDS = 604800; // 7 days
