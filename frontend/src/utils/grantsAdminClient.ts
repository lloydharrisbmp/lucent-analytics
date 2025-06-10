import brain from "brain";
import { API_URL } from "app";

// Extended client for grants_admin APIs until they're added to the generated client
export const grantsAdminClient = {
  // Grant Management
  createGrant: async (grant: any) => {
    const response = await fetch(`${API_URL}/grants_admin/grants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ grant })
    });
    return response;
  },
  
  updateGrant: async (grantId: string, grant: any) => {
    const response = await fetch(`${API_URL}/grants_admin/grants/${grantId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ grant })
    });
    return response;
  },
  
  deleteGrant: async (grantId: string) => {
    const response = await fetch(`${API_URL}/grants_admin/grants/${grantId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    });
    return response;
  },
  
  // Scraping Operations
  scrapeGrants: async (sources: string[], fullScan: boolean) => {
    const response = await fetch(`${API_URL}/grants_admin/grants/scrape`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ sources, full_scan: fullScan })
    });
    return response;
  },
  
  getScrapeStatus: async () => {
    const response = await fetch(`${API_URL}/grants_admin/grants/scrape/status`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    });
    return response;
  },
  
  // Scrape Sources Management
  listScrapeSources: async () => {
    const response = await fetch(`${API_URL}/grants_admin/grants/scrape/sources`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    });
    return response;
  },
  
  createScrapeSource: async (source: any) => {
    const response = await fetch(`${API_URL}/grants_admin/grants/scrape/sources`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(source)
    });
    return response;
  },
  
  updateScrapeSource: async (sourceId: string, source: any) => {
    const response = await fetch(`${API_URL}/grants_admin/grants/scrape/sources/${sourceId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(source)
    });
    return response;
  },
  
  deleteScrapeSource: async (sourceId: string) => {
    const response = await fetch(`${API_URL}/grants_admin/grants/scrape/sources/${sourceId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    });
    return response;
  }
};
