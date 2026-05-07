/**
 * Architectural Constraints
 * Defines hard technical limits for various system tiers.
 */
const CONSTRAINTS = {
  tier_limits: {
    mobile: { max_local_storage_gb: 512, max_ram_gb: 16 },
    browser: { max_local_storage_mb: 50, max_ram_mb: 4096 }
  },
  network_limits: {
    global_rtt_min_ms: 100,
    regional_rtt_min_ms: 10
  }
};

module.exports = CONSTRAINTS;
