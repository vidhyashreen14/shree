import { SUPER_ADMIN_CONFIG, STANDALONE_LAB_CONFIG, type ReportConfig } from "../mock/data";

/**
 * MOCK API: Fetch the report configuration from the Super Admin settings.
 * In a real app, this would be an axios.get("/api/super-admin/report-config") call.
 */
export async function getSuperAdminReportConfig(isStandalone: boolean = false): Promise<ReportConfig> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return isStandalone ? STANDALONE_LAB_CONFIG : SUPER_ADMIN_CONFIG;
}

