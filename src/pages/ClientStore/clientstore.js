import { create } from 'zustand';

export const useClientStore = create((set) => ({
  // Stage 1 Data
  stage1: {
    referral: "",
    retainer: "",
    declarationForm: "",
    quoteType: "",
    quoteAmount: "",
    tenants: "",
    systemNote: "",
    clientComment: "",
  },

  // Stage 1 Actions
  updateStage1: (updates) => 
    set((state) => ({ 
      stage1: { ...state.stage1, ...updates } 
    })),

  setStage1Field: (field, value) => 
    set((state) => ({ 
      stage1: { ...state.stage1, [field]: value } 
    })),

  resetStage1: () => 
    set({ 
      stage1: {
        referral: "",
        retainer: "",
        declarationForm: "",
        quoteType: "",
        quoteAmount: "",
        tenants: "",
        systemNote: "",
        clientComment: "",
      }
    }),

  // Initialize with API data
  initializeStage1: (apiData) => {
    const { noteForClient, ...rest } = apiData;
    const [systemNote = "", clientComment = ""] = noteForClient?.split(" - ") || [];
    
    set({ 
      stage1: {
        ...rest,
        systemNote,
        clientComment,
        quoteAmount: apiData.quoteAmount?.$numberDecimal || ""
      } 
    });
  }
}));