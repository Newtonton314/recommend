// features/reportSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Report } from "../types/Supabase";

interface ReportState {
  report: Report | null;
  isSaved: boolean; // バックグラウンドでDBに保存済みかどうかを示す
}

const initialState: ReportState = {
  report: null,
  isSaved: false,
};

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    // AIで生成されたレポートをセットし、保存前の状態にする
    setReport(state, action: PayloadAction<Report>) {
      state.report = action.payload;
      state.isSaved = false;
    },
    // Reportの部分更新（複数フィールド更新可能）
    updateReport(state, action: PayloadAction<Partial<Report>>) {
      if (state.report) {
        state.report = { ...state.report, ...action.payload };
      }
    },
    // Reportをクリアする
    clearReport(state) {
      state.report = null;
      state.isSaved = false;
    },
    // DBへの保存が完了した場合に呼び出す
    markReportSaved(state) {
      state.isSaved = true;
    },
  },
});

export const { setReport, updateReport, clearReport, markReportSaved } = reportSlice.actions;
export default reportSlice.reducer;