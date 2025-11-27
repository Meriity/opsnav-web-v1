import { useQuery } from "@tanstack/react-query";

export const useClientDetails = (
  clientId,
  matterNumber,
  currentModule,
  api
) => {
  return useQuery({
    queryKey: ["clientDetails", clientId, matterNumber, currentModule],
    queryFn: async () => {
      if (!api) throw new Error("API not available");

      if (currentModule === "commercial") {
        if (typeof api.getProjectFullData === "function") {
          try {
            const data = await api.getProjectFullData(matterNumber || clientId);
            if (data) return data;
          } catch (error) {
            console.warn("getProjectFullData failed:", error);
          }
        }

        return {
          _id: clientId,
          matterNumber: matterNumber,
        };
      } else {
        if (clientId && typeof api.getClientAllData === "function") {
          try {
            const data = await api.getClientAllData(clientId);
            if (data) return data.client || data.data || data.project || data;
          } catch (error) {
            console.warn("getClientAllData by clientId failed:", error);
          }
        }

        if (matterNumber && typeof api.getClientAllData === "function") {
          try {
            const data = await api.getClientAllData(matterNumber);
            if (data) return data.client || data.data || data.project || data;
          } catch (error) {
            console.warn("getClientAllData by matterNumber failed:", error);
          }
        }
      }

      throw new Error("Could not fetch client details");
    },
    enabled: !!(clientId || matterNumber) && !!api,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
};
